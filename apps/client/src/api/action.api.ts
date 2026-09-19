import axiosInstance from "@/lib/axiosInstance";
import type { ActionItem, ApiResponse } from "@/types/api.types";

export const getActions = async (
  projectId: string,
  meetingId: string
): Promise<ActionItem[]> => {
  const { data } = await axiosInstance.get<ApiResponse<ActionItem[]>>(
    `/api/v1/projects/${projectId}/meetings/${meetingId}/actions`
  );
  return data.data;
};

export const executeAction = async (
  projectId: string,
  meetingId: string,
  actionId: string,
  payload: { proposal: unknown; credentials: unknown }
): Promise<ActionItem> => {
  const { data } = await axiosInstance.post<ApiResponse<ActionItem>>(
    `/api/v1/projects/${projectId}/meetings/${meetingId}/actions/${actionId}/execute`,
    payload
  );
  return data.data;
};

export const updateActionStatus = async (
  projectId: string,
  meetingId: string,
  actionId: string,
  payload: { action_status: string; error_message?: string }
): Promise<ActionItem> => {
  const { data } = await axiosInstance.patch<ApiResponse<ActionItem>>(
    `/api/v1/projects/${projectId}/meetings/${meetingId}/actions/${actionId}`,
    payload
  );
  return data.data;
};
