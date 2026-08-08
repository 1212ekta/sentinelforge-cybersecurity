import { postJson } from './apiClient';
import type {
  ChatRequestPayload,
  ChatResponsePayload,
  SendMessageParams,
  SendMessageResult,
} from '@/features/chat/types/chat.types';

/**
 * Sends a prompt and optional conversation_id to the FastAPI backend.
 */
export async function sendMessage({
  prompt,
  conversation_id,
  signal,
  onChunk,
}: SendMessageParams): Promise<SendMessageResult> {
  const payload: ChatRequestPayload = { prompt, conversation_id };

  const data = await postJson<ChatRequestPayload, ChatResponsePayload>(
    '/chat',
    payload,
    { signal }
  );

  onChunk?.(data.response);

  return { content: data.response, conversation_id: data.conversation_id };
}

export const chatService = { sendMessage };