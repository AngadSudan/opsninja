export interface Project {
  project_id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  created_by: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
}

// User
export interface User {
  user_id: string;
  user_name: string;
  user_email: string;
  atlassian_connected: boolean;
  slack_connected: boolean;
  calendar_connected: boolean;
  profile_pic?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserDTO {
  user_name?: string;
  profile_pic?: string;
}

// Chat
export interface Chat {
  chat_id: string;
  project_id: string;
  chat_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChatDTO {
  project_id: string;
  chat_name?: string;
  created_by: string;
}

// Message
export interface Message {
  message_id: string;
  chat_id: string;
  message: string;
  message_type: "USER" | "SYSTEM";
  created_at: string;
  updated_at: string;
  structured_response?: string;
  proposed_actions?: string;
}

export interface CreateMessageDTO {
  chat_id: string;
  message: string;
  message_type: "USER" | "SYSTEM";
}

// Meeting
export interface Meeting {
  meeting_id: string;
  project_id: string;
  uploaded_by: string;
  meeting_platform: string;
  original_transcript: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingDTO {
  project_id: string;
  uploaded_by: string;
  meeting_platform: Meeting["meeting_platform"];
  original_transcript: string;
}

// MeetingRecord
export interface MeetingRecord {
  record_id: string;
  meeting_id: string;
  shortname: string;
  description: string;
  actions: MeetingAction[];
  created_at: string;
  updated_at: string;
}

export interface MeetingAction {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  externalAction?: "none" | "jira" | "slack";
  target?: string;
}

// Action
export interface MeetingActionItem {
  action_id: string;
  meeting_id: string;
  action_by: string;
  action_status:
    "success" | "failed" | "pending" | "un_initialized" | "initialized";
  action_type:
    "create_jira_issue" | "send_slack_message" | "create_calendar_event";
  error_message?: string;
  integration_platform: "jira" | "slack" | "calendar";
  title?: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  target?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateActionDTO {
  action_status: MeetingActionItem["action_status"];
  error_message?: string;
}

// Integration
export interface Integration {
  integration_id: string;
  user_id: string;
  atlassian_id?: string;
  atlassian_cloud_id?: string;
  atlassian_site_url?: string;
  atlassian_token_expires_at?: string;
  atlassian_access_token?: string;
  atlassian_refresh_token?: string;
  slack_token?: string;
  slack_team_id?: string;
  created_at: string;
  updated_at: string;
}
