import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, Integration } from "@/types/api.types";

export const getMyIntegrations = async (): Promise<Integration[]> => {
  const { data } = await axiosInstance.get<ApiResponse<Integration[]>>("/api/v1/integrations/me");
  return data.data;
};

export const disconnectIntegration = async (platform: "jira" | "slack" | "calendar"): Promise<void> => {
  await axiosInstance.delete(`/api/v1/integrations/${platform}`);
};
