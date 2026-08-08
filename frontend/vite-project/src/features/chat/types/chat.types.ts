import type { LucideIcon } from 'lucide-react';

export type Role = 'user' | 'assistant' | 'system';

export type MessageStatus = 'pending' | 'complete' | 'error';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  status?: MessageStatus;
  error?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatRequestPayload {
  prompt: string;
  conversation_id?: string;
}

export interface ChatResponsePayload {
  success: boolean;
  response: string;
  conversation_id: string;
  timestamp?: string;
  processing_time?: number;
  error?: string | null;
}

export interface SendMessageParams {
  prompt: string;
  conversation_id?: string;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
}

export interface SendMessageResult {
  content: string;
  conversation_id?: string;
}

export type SendMessageHandler = (
  prompt: string,
  onProgress: (patch: string) => void,
  signal: AbortSignal,
  conversationId?: string
) => Promise<void>;

export interface CodeBlockAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (code: string) => void;
}
