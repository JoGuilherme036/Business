// Durable Object that keeps every open screen connected over WebSocket and relays
// "schedule changed" messages the moment the API writes something.
// Uses the hibernation API: idle connections cost nothing, and "ping" is answered
// with "pong" by the runtime without waking the object.
import type { DurableObjectState } from './d1';

export class ScheduleHub {
  constructor(private state: DurableObjectState) {
    state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/notify') {
      const message = await request.text();
      for (const ws of this.state.getWebSockets()) {
        try {
          ws.send(message);
        } catch {
          /* socket already closing */
        }
      }
      return new Response('ok');
    }
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket upgrade', { status: 426 });
    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] } as ResponseInit);
  }

  webSocketMessage() {
    /* clients only send pings, answered by the auto-response */
  }

  webSocketClose(ws: WebSocket, code: number) {
    try {
      ws.close(code === 1005 || code === 1006 ? 1000 : code, 'closing');
    } catch {
      /* already closed */
    }
  }

  webSocketError() {
    /* the runtime closes the socket */
  }
}
