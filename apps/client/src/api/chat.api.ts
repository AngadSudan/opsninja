import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, Chat } from "@/types/api.types";

export const getChats = async (projectId: string): Promise<Chat[]> => {
  const { data } = await axiosInstance.get<ApiResponse<Chat[]>>(
    `/api/v1/projects/${projectId}/chats`
  );
  return data.data;
};

export const getChat = async (projectId: string, chatId: string): Promise<Chat> => {
  const { data } = await axiosInstance.get<ApiResponse<Chat>>(
    `/api/v1/projects/${projectId}/chats/${chatId}`
  );
  return data.data;
};

export const createChat = async (
  projectId: string,
  payload: { chat_name: string }
): Promise<Chat> => {
  const { data } = await axiosInstance.post<ApiResponse<Chat>>(
    `/api/v1/projects/${projectId}/chats`,
    payload
  );
  return data.data;
};

export const deleteChat = async (projectId: string, chatId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/projects/${projectId}/chats/${chatId}`);
};
