import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, Message, SendMessageResponse } from "@/types/api.types";

export const getMessages = async (projectId: string, chatId: string): Promise<Message[]> => {
  const { data } = await axiosInstance.get<ApiResponse<Message[]>>(
    `/api/v1/projects/${projectId}/chats/${chatId}/messages`
  );
  return data.data;
};

export const sendMessage = async (
  projectId: string,
  chatId: string,
  text: string
): Promise<SendMessageResponse> => {
  const { data } = await axiosInstance.post<ApiResponse<SendMessageResponse>>(
    `/api/v1/projects/${projectId}/chats/${chatId}/messages`,
    { message: text }
  );
  return data.data;
};
