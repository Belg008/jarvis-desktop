import { useCallback, useEffect, useRef, useState } from 'react';
import { JarvisClient } from './lib/ws';
import type { ActiveCommand, AssistantState } from './lib/protocol';

export interface ConfirmRequest {
  id: string;
  command: string;
  description: string;
}

export interface ChatLogEntry {
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

export interface JarvisFile {
  id: string;
  name: string;
  url: string;
  ts: number;
}

export interface JarvisState {
  connected: boolean;
  ready: boolean;
  assistantState: AssistantState;
  transcript: string;
  response: string;
  command: ActiveCommand | null;
  memory: boolean;
  confirm: ConfirmRequest | null;
  error: string | null;
  log: ChatLogEntry[];
  files: JarvisFile[];
  serverUrl: string;
}

export function useJarvis(opts: { lang: string; serverUrl?: string }) {
  const { lang } = opts;

  const [state, setState] = useState<JarvisState>({
    connected: false,
    ready: false,
    assistantState: 'idle',
    transcript: '',
    response: '',
    command: null,
    memory: false,
    confirm: null,
    error: null,
    log: [],
    files: [],
    serverUrl: opts.serverUrl ?? 'https://jarvis.sindbelg.me',
  });

  const clientRef = useRef<JarvisClient | null>(null);

  const patch = useCallback((p: Partial<JarvisState>) => setState((s) => ({ ...s, ...p })), []);

  const connect = useCallback((url?: string) => {
    const targetUrl = url ?? state.serverUrl;
    patch({ serverUrl: targetUrl, connected: false, ready: false, error: null });

    const client = new JarvisClient();
    client.setServerUrl(targetUrl);
    clientRef.current = client;

    client.onOpen = () => patch({ connected: true });
    client.onClose = () => patch({ connected: false });
    client.onMessage = (msg) => {
      switch (msg.t) {
        case 'ready':
          patch({ ready: true, memory: msg.memory });
          break;
        case 'state':
          patch({ assistantState: msg.state });
          break;
        case 'transcript':
          patch({ transcript: msg.text, response: '' });
          setState((s) => ({ ...s, log: [...s.log, { role: 'user', text: msg.text, ts: Date.now() }] }));
          break;
        case 'assistant_delta':
          setState((s) => ({ ...s, response: s.response + msg.text }));
          break;
        case 'assistant_done':
          patch({ response: msg.text });
          setState((s) => ({ ...s, log: [...s.log, { role: 'assistant', text: msg.text, ts: Date.now() }] }));
          break;
        case 'command':
          patch({ command: msg.command });
          break;
        case 'confirm_request':
          patch({ confirm: { id: msg.id, command: msg.command, description: msg.description } });
          break;
        case 'memory':
          patch({ memory: msg.connected });
          break;
        case 'file':
          setState((s) => ({ ...s, files: [...s.files, { id: msg.id, name: msg.name, url: msg.url, ts: Date.now() }] }));
          break;
        case 'error':
          patch({ error: msg.message, assistantState: 'idle' });
          break;
      }
    };

    (async () => {
      try {
        const boot = await client.bootstrap();
        patch({ memory: boot.memory });
        client.connect();
      } catch (err) {
        patch({ error: `bootstrap: ${(err as Error).message}` });
        client.connect();
      }
    })();

    return () => client.close();
  }, [patch, state.serverUrl]);

  // Initial connect
  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.then?.(() => {});
      clientRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitText = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      patch({ transcript: t, response: '', assistantState: 'thinking' });
      clientRef.current?.send({ t: 'user_text', text: t, source: 'text' });
    },
    [patch],
  );

  const respondConfirm = useCallback(
    (approved: boolean) => {
      setState((s) => {
        if (s.confirm) clientRef.current?.send({ t: 'confirm_response', id: s.confirm.id, approved });
        return { ...s, confirm: null };
      });
    },
    [],
  );

  const dismissError = useCallback(() => patch({ error: null }), [patch]);

  const setServerUrl = useCallback((url: string) => {
    patch({ serverUrl: url });
    clientRef.current?.close();
    setTimeout(() => connect(url), 300);
  }, [patch, connect]);

  return { state, submitText, respondConfirm, dismissError, setServerUrl, connect };
}
