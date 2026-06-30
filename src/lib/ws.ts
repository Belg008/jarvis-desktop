import type { ClientMessage, ServerMessage } from './protocol';

export interface Bootstrap {
  token: string;
  email: string | null;
  lang: string;
  memory: boolean;
  serverExec: boolean;
  serverTts?: boolean;
}

/**
 * Desktop WebSocket client. Connects to JARVIS server via
 * Cloudflare tunnel (jarvis.sindbelg.me) with auth token.
 */
export class JarvisClient {
  private ws: WebSocket | null = null;
  private token = '';
  private closed = false;
  private retry = 0;
  private serverUrl = 'https://jarvis.sindbelg.me';

  onMessage: (msg: ServerMessage) => void = () => {};
  onOpen: () => void = () => {};
  onClose: () => void = () => {};

  setServerUrl(url: string) {
    this.serverUrl = url.replace(/\/+$/, '');
  }

  async bootstrap(): Promise<Bootstrap> {
    const res = await fetch(`${this.serverUrl}/api/bootstrap`, { credentials: 'include' });
    if (!res.ok) throw new Error(`bootstrap ${res.status}`);
    const data = (await res.json()) as Bootstrap;
    this.token = data.token ?? '';
    return data;
  }

  getToken(): string {
    return this.token;
  }

  connect() {
    this.closed = false;
    this.open();
  }

  private open() {
    const wsUrl = this.serverUrl.replace(/^https?/, 'wss');
    const q = this.token ? `?token=${encodeURIComponent(this.token)}` : '';
    const ws = new WebSocket(`${wsUrl}/ws${q}`);
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      this.onOpen();
    };
    ws.onmessage = (ev) => {
      try {
        this.onMessage(JSON.parse(ev.data) as ServerMessage);
      } catch {
        /* ignore non-JSON */
      }
    };
    ws.onclose = () => {
      this.onClose();
      if (this.closed) return;
      this.retry = Math.min(this.retry + 1, 6);
      setTimeout(() => this.open(), 500 * this.retry);
    };
    ws.onerror = () => ws.close();
  }

  send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  close() {
    this.closed = true;
    this.ws?.close();
  }
}
