import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, Project } from "@/types/api.types";

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await axiosInstance.get<ApiResponse<Project[]>>("/api/v1/projects");
  return data.data;
};

export const getProject = async (projectId: string): Promise<Project> => {
  const { data } = await axiosInstance.get<ApiResponse<Project>>(`/api/v1/projects/${projectId}`);
  return data.data;
};

export const createProject = async (payload: {
  name: string;
  description?: string;
  created_by: string;
}): Promise<Project> => {
  const { data } = await axiosInstance.post<ApiResponse<Project>>("/api/v1/projects", payload);
  return data.data;
};

export const updateProject = async (
  projectId: string,
  payload: { name?: string; description?: string }
): Promise<Project> => {
  const { data } = await axiosInstance.put<ApiResponse<Project>>(`/api/v1/projects/${projectId}`, payload);
  return data.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/projects/${projectId}`);
};
