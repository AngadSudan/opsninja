"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disconnectIntegration, getMyIntegrations } from "@/api/integration.api";
import { integrationKeys } from "./queryKeys";

export const useMyIntegrations = () =>
  useQuery({ queryKey: integrationKeys.me(), queryFn: getMyIntegrations });

export const useDisconnectIntegration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (platform: "jira" | "slack" | "calendar") => disconnectIntegration(platform),
    onSuccess: () => qc.invalidateQueries({ queryKey: integrationKeys.me() }),
  });
};
