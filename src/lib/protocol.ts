export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'command';

export interface ActiveCommand {
  id: string;
  type: string;
  description: string;
}

export type ClientMessage =
  | { t: 'user_text'; text: string; source?: 'text' | 'voice' }
  | { t: 'confirm_response'; id: string; approved: boolean }
  | { t: 'cancel' }
  | { t: 'auth'; token: string };

export type ServerMessage =
  | { t: 'ready'; memory: boolean; serverExec: boolean; lang: string }
  | { t: 'state'; state: AssistantState }
  | { t: 'transcript'; text: string }
  | { t: 'assistant_delta'; text: string }
  | { t: 'assistant_done'; text: string }
  | { t: 'command'; command: ActiveCommand }
  | { t: 'confirm_request'; id: string; command: string; description: string }
  | { t: 'memory'; connected: boolean }
  | { t: 'file'; id: string; name: string; url: string }
  | { t: 'error'; message: string };
