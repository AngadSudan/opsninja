"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages, sendMessage } from "@/api/message.api";
import { messageKeys } from "./queryKeys";
import type { Message } from "@/types/api.types";

export const useMessages = (projectId: string, chatId: string) =>
  useQuery({
    queryKey: messageKeys.list(chatId),
    queryFn: () => getMessages(projectId, chatId),
    enabled: !!projectId && !!chatId,
    staleTime: 0,
  });

export const useSendMessage = (projectId: string, chatId: string) => {
  const qc = useQueryClient();
  const key = messageKeys.list(chatId);

  return useMutation({
    mutationFn: (text: string) => sendMessage(projectId, chatId, text),
    onMutate: async (text: string) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<Message[]>(key);

      const optimistic: Message = {
        message_id: `optimistic-${Date.now()}`,
        chat_id: chatId,
        message: text,
        message_type: "USER",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      qc.setQueryData<Message[]>(key, (prev) => [...(prev ?? []), optimistic]);
      return { snapshot };
    },
    onSuccess: (result) => {
      qc.setQueryData<Message[]>(key, (prev) => {
        const filtered = (prev ?? []).filter((m) => !m.message_id.startsWith("optimistic-"));
        return [...filtered, result.user_message, result.agent_reply];
      });
    },
    onError: (_err, _text, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(key, ctx.snapshot);
    },
  });
};
