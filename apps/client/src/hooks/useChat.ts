"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createChat, deleteChat, getChat, getChats } from "@/api/chat.api";
import { chatKeys, messageKeys } from "./queryKeys";

export const useChats = (projectId: string) =>
  useQuery({
    queryKey: chatKeys.list(projectId),
    queryFn: () => getChats(projectId),
    enabled: !!projectId,
  });

export const useChat = (projectId: string, chatId: string) =>
  useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: () => getChat(projectId, chatId),
    enabled: !!projectId && !!chatId,
  });

export const useCreateChat = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { chat_name: string }) => createChat(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.list(projectId) }),
  });
};

export const useDeleteChat = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => deleteChat(projectId, chatId),
    onSuccess: (_data, chatId) => {
      qc.invalidateQueries({ queryKey: chatKeys.list(projectId) });
      qc.removeQueries({ queryKey: chatKeys.detail(chatId) });
      qc.removeQueries({ queryKey: messageKeys.list(chatId) });
    },
  });
};
