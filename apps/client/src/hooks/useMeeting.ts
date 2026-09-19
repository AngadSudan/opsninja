"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMeeting,
  getMeetings,
  getMeetingSummary,
  uploadTranscript,
} from "@/api/meeting.api";
import { meetingKeys } from "./queryKeys";

export const useMeetings = (projectId: string) =>
  useQuery({
    queryKey: meetingKeys.list(projectId),
    queryFn: () => getMeetings(projectId),
    enabled: !!projectId,
  });

export const useMeeting = (projectId: string, meetingId: string) =>
  useQuery({
    queryKey: meetingKeys.detail(meetingId),
    queryFn: () => getMeeting(projectId, meetingId),
    enabled: !!projectId && !!meetingId,
  });

export const useMeetingSummary = (projectId: string, meetingId: string) =>
  useQuery({
    queryKey: meetingKeys.summary(meetingId),
    queryFn: () => getMeetingSummary(projectId, meetingId),
    enabled: !!projectId && !!meetingId,
  });

export const useUploadTranscript = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { meeting_platform: string; original_transcript: string }) =>
      uploadTranscript(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: meetingKeys.list(projectId) }),
  });
};
