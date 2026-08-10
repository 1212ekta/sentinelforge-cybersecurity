import React from "react";
import { chatService } from "@/services/chatService";
import { ApiError } from "@/types/api.types";
import type { ChatMessage, SendMessageHandler } from "../types/chat.types";

export type { ChatMessage, SendMessageHandler, MessageStatus, Role } from "../types/chat.types";

function makeId(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export interface UseChatOptions {
  sendMessageHandler?: SendMessageHandler;
  initialMessages?: ChatMessage[];
  conversationId?: string;
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.cause) {
      case "aborted":
        return "Generation stopped by user.";
      case "timeout":
        return "AI analysis is taking longer than expected. Please retry.";
      case "network":
        return "Security analysis service is temporarily unavailable.";
      case "parse":
        return "Received an invalid response format from the server.";
      case "http":
        return err.message || `Server returned error status ${err.status}.`;
      default:
        return err.message;
    }
  }
  if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
    return "Generation stopped by user.";
  }
  return err instanceof Error ? err.message : "An unexpected error occurred.";
}

export function useChat(opts?: UseChatOptions) {
  const { sendMessageHandler, initialMessages = [], conversationId, onMessagesChange } = opts || {};
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = React.useState(false);
  const currentAssistantIdRef = React.useRef<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Re-sync messages state whenever conversationId or initialMessages changes
  React.useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages]);

  const setAndNotify = React.useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setMessages((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        onMessagesChange?.(next);
        return next;
      });
    },
    [onMessagesChange]
  );

  const pushMessage = React.useCallback(
    (m: ChatMessage) => {
      setAndNotify((prev) => [...prev, m]);
    },
    [setAndNotify]
  );

  const updateMessage = React.useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setAndNotify((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    [setAndNotify]
  );

  const appendAssistantContent = React.useCallback(
    (assistantId: string, patch: string) => {
      setAndNotify((prevMsgs) =>
        prevMsgs.map((m) => (m.id === assistantId ? { ...m, content: `${m.content || ""}${patch}` } : m))
      );
    },
    [setAndNotify]
  );

  const clear = React.useCallback(() => {
    setAndNotify([]);
  }, [setAndNotify]);

  const defaultSendHandler: SendMessageHandler = React.useCallback(
    async (prompt: string, onProgress: (patch: string) => void, signal: AbortSignal, cid?: string) => {
      await chatService.sendMessage({
        prompt,
        conversation_id: cid || conversationId,
        signal,
        onChunk: onProgress,
      });
    },
    [conversationId]
  );

  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!text || isSending) return;

      const userId = makeId("u_");
      const userMsg: ChatMessage = {
        id: userId,
        role: "user",
        content: text,
        createdAt: Date.now(),
        status: "complete",
      };
      pushMessage(userMsg);

      const assistantId = makeId("a_");
      currentAssistantIdRef.current = assistantId;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        status: "pending",
      };
      pushMessage(assistantMsg);

      setIsSending(true);
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const handler = sendMessageHandler || defaultSendHandler;

      try {
        await handler(
          text,
          (patch: string) => {
            appendAssistantContent(assistantId, patch);
          },
          signal,
          conversationId
        );
        updateMessage(assistantId, { status: "complete", error: null });
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(err);
        updateMessage(assistantId, { status: "error", error: errorMsg });
      } finally {
        setIsSending(false);
        abortControllerRef.current = null;
        currentAssistantIdRef.current = null;
      }
    },
    [isSending, pushMessage, sendMessageHandler, defaultSendHandler, conversationId, appendAssistantContent, updateMessage]
  );

  const stopGenerating = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const retryMessage = React.useCallback(
    async (assistantMessageId: string) => {
      if (isSending) return;
      const failedMsg = messages.find((m) => m.id === assistantMessageId);
      if (!failedMsg || failedMsg.role !== "assistant") return;


      const idx = messages.findIndex((m) => m.id === assistantMessageId);
      let prompt = "";
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          prompt = messages[i].content;
          break;
        }
      }
      if (!prompt) return;

      updateMessage(assistantMessageId, { content: "", status: "pending", error: null });
      setIsSending(true);
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      const handler = sendMessageHandler || defaultSendHandler;
      try {
        await handler(
          prompt,
          (patch: string) => {
            appendAssistantContent(assistantMessageId, patch);
          },
          signal,
          conversationId
        );
        updateMessage(assistantMessageId, { status: "complete", error: null });
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(err);
        updateMessage(assistantMessageId, { status: "error", error: errorMsg });
      } finally {
        setIsSending(false);
        abortControllerRef.current = null;
      }
    },
    [messages, updateMessage, sendMessageHandler, defaultSendHandler, conversationId, appendAssistantContent]
  );

  const removeMessage = React.useCallback(
    (id: string) => {
      setAndNotify((prev) => prev.filter((m) => m.id !== id));
    },
    [setAndNotify]
  );

  return {
    messages,
    isSending,
    sendMessage,
    stopGenerating,
    retryMessage,
    clear,
    removeMessage,
  };
}