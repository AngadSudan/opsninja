import z from "zod";

const meetingRecordModel = z.object({
  record_id: z.string(),
  meeting_id: z.string(),
  shortname: z.string(),
  description: z.string(),
  actions: z.array(z.record(z.string(), z.unknown())).default([]),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

export default meetingRecordModel;
