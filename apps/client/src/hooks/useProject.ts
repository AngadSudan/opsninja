"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "@/api/project.api";
import { projectKeys } from "./queryKeys";

export const useProjects = () =>
  useQuery({ queryKey: projectKeys.list(), queryFn: getProjects });

export const useProject = (projectId: string) =>
  useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.list() }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: { name?: string; description?: string } }) =>
      updateProject(projectId, payload),
    onSuccess: (_data, { projectId }) => {
      qc.invalidateQueries({ queryKey: projectKeys.list() });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.list() }),
  });
};
