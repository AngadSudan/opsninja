export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
};

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, id] as const,
};

export const integrationKeys = {
  all: ["integrations"] as const,
  me: () => [...integrationKeys.all, "me"] as const,
};

export const chatKeys = {
  all: ["chats"] as const,
  list: (projectId: string) => [...chatKeys.all, projectId, "list"] as const,
  detail: (chatId: string) => [...chatKeys.all, chatId] as const,
};

export const messageKeys = {
  all: ["messages"] as const,
  list: (chatId: string) => [...messageKeys.all, chatId, "list"] as const,
};

export const meetingKeys = {
  all: ["meetings"] as const,
  list: (projectId: string) => [...meetingKeys.all, projectId, "list"] as const,
  detail: (meetingId: string) => [...meetingKeys.all, meetingId] as const,
  summary: (meetingId: string) => [...meetingKeys.all, meetingId, "summary"] as const,
};

export const actionKeys = {
  all: ["actions"] as const,
  list: (meetingId: string) => [...actionKeys.all, meetingId, "list"] as const,
};
