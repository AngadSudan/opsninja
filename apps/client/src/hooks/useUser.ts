"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe } from "@/api/user.api";
import { userKeys } from "./queryKeys";

export const useMe = () =>
  useQuery({ queryKey: userKeys.me(), queryFn: getMe });

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me() }),
  });
};
