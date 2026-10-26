// Minimal Cloudflare runtime typings used by the API (avoids pulling the full workers-types package).
export interface D1Result<T = unknown> {
  results: T[];
  meta: { changes: number; last_row_id: number };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}
export interface DurableObjectStub {
  fetch(input: string | Request, init?: RequestInit): Promise<Response>;
}
export interface DurableObjectNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStub;
}
export interface DurableObjectState {
  acceptWebSocket(ws: WebSocket, tags?: string[]): void;
  getWebSockets(tag?: string): WebSocket[];
  setWebSocketAutoResponse(pair: unknown): void;
}
export interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}
export type Env = { DB: D1Database; ADMIN_TOKEN?: string; HUB?: DurableObjectNamespace; ASSETS?: Fetcher };

declare global {
  // Cloudflare Workers runtime globals.
  const WebSocketPair: { new (): { 0: WebSocket; 1: WebSocket } };
  const WebSocketRequestResponsePair: { new (request: string, response: string): unknown };
}
