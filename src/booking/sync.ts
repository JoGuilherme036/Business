import { useEffect, useState } from 'react';
import { bookingApi } from './api';
import { LOCAL_STORE_KEY } from './localApi';
import { invalidateBusy } from './busyCache';

// Keeps every open screen in step with the schedule.
// • Live (Cloudflare): one WebSocket per tab to the realtime hub; the server pushes a message the
//   moment anything changes. While the socket is down, a cheap version check runs every 3 s, and
//   it reconnects with backoff.
// • Same device: other tabs get an instant BroadcastChannel ping (and storage events in demo mode).
// Any change bumps the counter returned by useScheduleVersion so callers refetch.

type Sub = { changed: () => void; status: (live: boolean) => void };
const subs = new Set<Sub>();
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('rb-schedule') : null;

let ws: WebSocket | null = null;
let live = false;
let retry = 0;
let pingTimer: ReturnType<typeof setInterval> | undefined;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

const emitChanged = () => {
  invalidateBusy();
  subs.forEach((s) => s.changed());
};
const emitStatus = () => subs.forEach((s) => s.status(live));

function liveUrl() {
  const base = (import.meta.env.VITE_API_BASE as string | undefined) || location.origin;
  return `${base.replace(/^http/, 'ws')}/api/live`;
}

function connect() {
  if (ws || bookingApi.mode !== 'live' || typeof WebSocket === 'undefined' || !subs.size) return;
  clearTimeout(reconnectTimer);
  let socket: WebSocket;
  try {
    socket = new WebSocket(liveUrl());
  } catch {
    return scheduleReconnect();
  }
  ws = socket;
  socket.onopen = () => {
    live = true;
    retry = 0;
    emitStatus();
    pingTimer = setInterval(() => socket.readyState === WebSocket.OPEN && socket.send('ping'), 25_000);
  };
  socket.onmessage = (e) => {
    if (e.data !== 'pong') emitChanged();
  };
  socket.onclose = () => {
    clearInterval(pingTimer);
    if (ws === socket) ws = null;
    if (live) {
      live = false;
      emitStatus();
    }
    scheduleReconnect();
  };
  socket.onerror = () => socket.close();
}

function scheduleReconnect() {
  if (!subs.size) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, Math.min(15_000, 1_000 * 2 ** retry++));
}

function disconnectIfUnused() {
  if (subs.size) return;
  clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
}

/** Call after this screen changed the schedule (booking, block, status). */
export function notifyScheduleChanged() {
  channel?.postMessage('changed');
  emitChanged();
}

type Options = { active?: boolean; fallbackMs?: number };

export function useScheduleVersion({ active = true, fallbackMs = 3_000 }: Options = {}) {
  const [tick, setTick] = useState(0);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(live);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    let last: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const bump = () => {
      if (!alive) return;
      invalidateBusy();
      setTick((t) => t + 1);
      setSyncedAt(Date.now());
    };

    const check = async () => {
      if (document.hidden) return;
      try {
        const v = await bookingApi.version();
        if (!alive) return;
        setSyncedAt(Date.now());
        if (last !== null && v !== last) {
          invalidateBusy();
          setTick((t) => t + 1);
        }
        last = v;
      } catch {
        /* offline: the next check or the socket will catch up */
      }
    };

    // Safety net: frequent while the socket is down, rare while it is up.
    const loop = () => {
      timer = setTimeout(async () => {
        await check();
        if (alive) loop();
      }, live ? 30_000 : fallbackMs);
    };

    const sub: Sub = {
      changed: bump,
      status: (on) => {
        if (!alive) return;
        setIsLive(on);
        if (on) check(); // catch anything missed while disconnected
      },
    };
    subs.add(sub);
    connect();
    check();
    loop();

    const onWake = () => {
      if (document.hidden) return;
      check();
      connect();
    };
    const onStorage = (e: StorageEvent) => e.key === LOCAL_STORE_KEY && bump();
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('focus', onWake);
    window.addEventListener('online', onWake);
    window.addEventListener('storage', onStorage);
    channel?.addEventListener('message', bump);

    return () => {
      alive = false;
      clearTimeout(timer);
      subs.delete(sub);
      disconnectIfUnused();
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('focus', onWake);
      window.removeEventListener('online', onWake);
      window.removeEventListener('storage', onStorage);
      channel?.removeEventListener('message', bump);
    };
  }, [active, fallbackMs]);

  return { tick, syncedAt, live: isLive };
}
