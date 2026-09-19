import { z } from "zod";

export const actionTypeSchema = z.enum(["none", "jira", "slack"]);
export type ActionType = z.infer<typeof actionTypeSchema>;

export const meetingActionSchema = z.object({
  id: z.string().min(1).describe("A short, unique slug for this action item."),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  externalAction: actionTypeSchema.default("none"),
  target: z
    .string()
    .nullable()
    .optional()
    .describe("Jira project key or Slack channel when known."),
}).transform((data) => ({
  ...data,
  description: data.description || undefined,
  assignee: data.assignee || undefined,
  dueDate: data.dueDate || undefined,
  target: data.target || undefined,
}));

export type MeetingAction = z.infer<typeof meetingActionSchema>;

export const meetingMinutesSchema = z.object({
  title: z.string().min(1).describe("A concise meeting title."),
  date: z
    .string()
    .optional()
    .describe("Meeting date as stated in the transcript."),
  participants: z.array(z.string()).default([]),
  objective: z.string().optional(),
  summary: z.string().min(1),
  decisions: z.array(z.string()).default([]),
  risksAndDependencies: z.array(z.string()).default([]),
  actionItems: z.array(meetingActionSchema).default([]),
  followUp: z
    .object({
      date: z.string().optional(),
      purpose: z.string().optional(),
    })
    .optional(),
  relatedTopics: z.array(z.string()).default([]),
});

export type MeetingMinutes = z.infer<typeof meetingMinutesSchema>;

export const actionProposalSchema = z.object({
  actionNoteId: z.string().min(1),
  type: z.enum(["jira", "slack"]),
  title: z.string().min(1),
  description: z.string().optional(),
  target: z.string().optional(),
  assignee: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export type ActionProposal = z.infer<typeof actionProposalSchema>;
