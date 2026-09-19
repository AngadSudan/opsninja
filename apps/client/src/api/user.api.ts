import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, User } from "@/types/api.types";

export const getMe = async (): Promise<User> => {
  const { data } = await axiosInstance.get<ApiResponse<User>>("/api/v1/users/me");
  return data.data;
};

export const updateMe = async (payload: { user_name?: string; profile_pic?: string }): Promise<User> => {
  const { data } = await axiosInstance.put<ApiResponse<User>>("/api/v1/users/me", payload);
  return data.data;
};
