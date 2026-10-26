// Cloudflare Worker entry: static site (dist/) + schedule API (/api/*) + realtime hub (/api/live).
import { handle } from './api';
import type { Env, ExecutionContext } from './d1';

export { ScheduleHub } from './hub';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/live') {
      if (!env.HUB) return new Response('realtime_not_configured', { status: 503 });
      return env.HUB.get(env.HUB.idFromName('schedule')).fetch(request);
    }
    if (url.pathname.startsWith('/api/')) return handle(request, env, ctx);
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
  },
};
