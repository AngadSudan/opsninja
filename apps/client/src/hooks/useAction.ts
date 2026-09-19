"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  executeAction,
  getActions,
  updateActionStatus,
} from "@/api/action.api";
import { actionKeys } from "./queryKeys";

export const useActions = (projectId: string, meetingId: string) =>
  useQuery({
    queryKey: actionKeys.list(meetingId),
    queryFn: () => getActions(projectId, meetingId),
    enabled: !!projectId && !!meetingId,
  });

export const useExecuteAction = (projectId: string, meetingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      actionId,
      proposal,
      credentials,
    }: {
      actionId: string;
      proposal: unknown;
      credentials: unknown;
    }) => executeAction(projectId, meetingId, actionId, { proposal, credentials }),
    onSuccess: () => qc.invalidateQueries({ queryKey: actionKeys.list(meetingId) }),
  });
};

export const useUpdateActionStatus = (projectId: string, meetingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      actionId,
      action_status,
      error_message,
    }: {
      actionId: string;
      action_status: string;
      error_message?: string;
    }) => updateActionStatus(projectId, meetingId, actionId, { action_status, error_message }),
    onSuccess: () => qc.invalidateQueries({ queryKey: actionKeys.list(meetingId) }),
  });
};
