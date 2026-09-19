import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, MeetingRecord } from "@/types/api.types";

export const getMeetings = async (
  projectId: string,
): Promise<MeetingRecord[]> => {
  const { data } = await axiosInstance.get<ApiResponse<MeetingRecord[]>>(
    `/api/v1/projects/${projectId}/meetings`,
  );
  return data.data.map((meeting) => ({
    ...meeting,
    // Map shortname or description for display in lists
    shortname: meeting.shortname || meeting.description?.split('\n')[0] || undefined,
  }));
};

export const getMeeting = async (
  projectId: string,
  meetingId: string,
): Promise<MeetingRecord> => {
  const { data } = await axiosInstance.get<
    ApiResponse<{ meeting: MeetingRecord; record: MeetingRecord | null }>
  >(`/api/v1/projects/${projectId}/meetings/${meetingId}`);

  const meeting = data.data.meeting;
  const record = data.data.record;

  return {
    ...meeting,
    ...record,
    // Ensure we have all required fields
    shortname: record?.shortname || meeting.shortname,
    description: record?.description || meeting.description,
    actions: record?.actions || meeting.actions,
  };
};

export const getMeetingSummary = async (
  projectId: string,
  meetingId: string,
): Promise<MeetingRecord> => {
  const { data } = await axiosInstance.get<ApiResponse<MeetingRecord>>(
    `/api/v1/projects/${projectId}/meetings/${meetingId}/summary`,
  );
  return data.data;
};

export const uploadTranscript = async (
  projectId: string,
  payload: {
    meeting_platform: string;
    original_transcript: string;
  },
): Promise<MeetingRecord> => {
  const { data } = await axiosInstance.post<ApiResponse<MeetingRecord>>(
    `/api/v1/projects/${projectId}/meetings`,
    payload,
  );
  return data.data;
};
