# Frontend Integration Plan — OpsNinja

TanStack Query wires every backend API to the frontend with caching, background refetch, and mutation-driven invalidation. This document covers the full integration: installation, folder structure, provider setup, API client layer, query/mutation hooks per domain, optimistic update patterns, error handling, and component wiring.

---

## 1. Installation

```bash
cd apps/client
bun add @tanstack/react-query @tanstack/react-query-devtools
```

No other packages needed — axios is already installed and configured with `withCredentials: true` in `src/lib/axiosInstance.ts`.

---

## 2. Folder Structure

```
apps/client/src/
├── lib/
│   ├── axiosInstance.ts          # existing — no changes
│   ├── api.ts                    # existing — no changes
│   └── queryClient.ts            # NEW — singleton QueryClient
├── api/                          # NEW — one file per API domain
│   ├── user.api.ts
│   ├── project.api.ts
│   ├── integration.api.ts
│   ├── chat.api.ts
│   ├── message.api.ts
│   ├── meeting.api.ts
│   └── action.api.ts
├── hooks/                        # NEW — one file per domain
│   ├── useUser.ts
│   ├── useProject.ts
│   ├── useIntegration.ts
│   ├── useChat.ts
│   ├── useMessage.ts
│   ├── useMeeting.ts
│   └── useAction.ts
├── types/
│   ├── ops-ninja.ts              # existing
│   └── api.types.ts              # NEW — API response shapes
├── component/                    # existing — wired to hooks
└── app/
    └── layout.tsx                # MODIFIED — add QueryClientProvider
```

---

## 3. QueryClient Setup

### `src/lib/queryClient.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30s — most data is semi-static
      gcTime: 5 * 60 * 1000,       // 5min — keep in cache after unmount
      retry: 1,
      refetchOnWindowFocus: false,  // prevents jarring refetches mid-work
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### `src/app/layout.tsx` — add provider

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

> **Note:** `QueryClientProvider` must wrap the entire app. Since Next.js 13+ app router treats `layout.tsx` as a server component by default, add `"use client"` to a thin wrapper component if needed, or use a `providers.tsx` client component that wraps children.

---

## 4. API Response Types

### `src/types/api.types.ts`

```typescript
export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error: string;
};

// Domain shapes returned from the backend
export type User = {
  user_id: string;
  user_name: string;
  email: string;
  profile_pic?: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  project_id: string;
  project_name: string;
  project_description?: string;
  created_by: string;
  members: string[];
  created_at: string;
  updated_at: string;
};

export type Integration = {
  integration_id: string;
  user_id: string;
  platform: "jira" | "slack" | "calendar";
  credentials: Record<string, string>;
  connected_at: string;
};

export type Chat = {
  chat_id: string;
  project_id: string;
  chat_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  message_id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Meeting = {
  meeting_id: string;
  project_id: string;
  uploaded_by: string;
  meeting_platform: string;
  original_transcript: string;
  created_at: string;
  updated_at: string;
};

export type MeetingRecord = {
  record_id: string;
  meeting_id: string;
  minutes: import("./ops-ninja").StructuredMeetingNote;
  proposals: import("./ops-ninja").ActionProposal[];
};

export type Action = {
  action_id: string;
  meeting_id: string;
  title: string;
  description?: string;
  action_status: "proposed" | "approved" | "rejected" | "executing" | "done" | "failed";
  error_message?: string;
  proposal: import("./ops-ninja").ActionProposal;
  created_at: string;
  updated_at: string;
};
```

---

## 5. API Function Layer

One file per domain. All functions call the existing `apiGet`/`apiPost`/`apiPatch`/`apiDelete` helpers, which internally use `axiosInstance` (already configured with `withCredentials: true` so the `application_token` httpOnly cookie is sent automatically).

### `src/api/user.api.ts`

```typescript
import { apiGet, apiPatch } from "@/lib/api";
import type { ApiResponse, User } from "@/types/api.types";

export const getMe = () =>
  apiGet<ApiResponse<User>>("/api/v1/users/me");

export const getUserById = (userId: string) =>
  apiGet<ApiResponse<User>>(`/api/v1/users/${userId}`);

export const updateMe = (body: { user_name?: string; profile_pic?: string }) =>
  apiPatch<ApiResponse<User>>("/api/v1/users/me", body);
```

### `src/api/project.api.ts`

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { ApiResponse, Project } from "@/types/api.types";

export const getProjects = () =>
  apiGet<ApiResponse<Project[]>>("/api/v1/projects");

export const getProject = (projectId: string) =>
  apiGet<ApiResponse<Project>>(`/api/v1/projects/${projectId}`);

export const createProject = (body: { project_name: string; project_description?: string }) =>
  apiPost<ApiResponse<Project>>("/api/v1/projects", body);

export const updateProject = (projectId: string, body: { project_name?: string; project_description?: string }) =>
  apiPatch<ApiResponse<Project>>(`/api/v1/projects/${projectId}`, body);

export const deleteProject = (projectId: string) =>
  apiDelete<ApiResponse<null>>(`/api/v1/projects/${projectId}`);

export const addProjectMember = (projectId: string, userId: string) =>
  apiPost<ApiResponse<Project>>(`/api/v1/projects/${projectId}/members`, { user_id: userId });

export const removeProjectMember = (projectId: string, userId: string) =>
  apiDelete<ApiResponse<Project>>(`/api/v1/projects/${projectId}/members/${userId}`);
```

### `src/api/integration.api.ts`

```typescript
import { apiGet, apiDelete } from "@/lib/api";
import type { ApiResponse, Integration } from "@/types/api.types";

export const getMyIntegrations = () =>
  apiGet<ApiResponse<Integration[]>>("/api/v1/integrations/me");

export const disconnectIntegration = (platform: "jira" | "slack" | "calendar") =>
  apiDelete<ApiResponse<null>>(`/api/v1/integrations/${platform}`);
```

> **Jira OAuth:** The connect flow is server-redirect based. Trigger it by navigating to `GET /api/v1/auth/jira` — not a fetch call. Use `window.location.href = "/api/v1/auth/jira"`.

### `src/api/chat.api.ts`

```typescript
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { ApiResponse, Chat } from "@/types/api.types";

export const getChats = (projectId: string) =>
  apiGet<ApiResponse<Chat[]>>(`/api/v1/projects/${projectId}/chats`);

export const getChat = (projectId: string, chatId: string) =>
  apiGet<ApiResponse<Chat>>(`/api/v1/projects/${projectId}/chats/${chatId}`);

export const createChat = (projectId: string, body: { chat_name: string }) =>
  apiPost<ApiResponse<Chat>>(`/api/v1/projects/${projectId}/chats`, body);

export const deleteChat = (projectId: string, chatId: string) =>
  apiDelete<ApiResponse<null>>(`/api/v1/projects/${projectId}/chats/${chatId}`);
```

### `src/api/message.api.ts`

```typescript
import { apiGet, apiPost } from "@/lib/api";
import type { ApiResponse, Message } from "@/types/api.types";

type SendMessageBody = {
  message: string;
  jira_credentials?: Record<string, string>;
  slack_credentials?: Record<string, string>;
};

export const getMessages = (projectId: string, chatId: string) =>
  apiGet<ApiResponse<Message[]>>(`/api/v1/projects/${projectId}/chats/${chatId}/messages`);

export const sendMessage = (projectId: string, chatId: string, body: SendMessageBody) =>
  apiPost<ApiResponse<{ userMessage: Message; assistantMessage: Message }>>(
    `/api/v1/projects/${projectId}/chats/${chatId}/messages`,
    body,
  );
```

### `src/api/meeting.api.ts`

```typescript
import { apiGet, apiPost } from "@/lib/api";
import type { ApiResponse, Meeting, MeetingRecord } from "@/types/api.types";

type UploadTranscriptBody = {
  meeting_platform: string;
  original_transcript: string;
};

export const getMeetings = (projectId: string) =>
  apiGet<ApiResponse<Meeting[]>>(`/api/v1/projects/${projectId}/meetings`);

export const getMeeting = (projectId: string, meetingId: string) =>
  apiGet<ApiResponse<Meeting>>(`/api/v1/projects/${projectId}/meetings/${meetingId}`);

export const getMeetingSummary = (projectId: string, meetingId: string) =>
  apiGet<ApiResponse<MeetingRecord>>(`/api/v1/projects/${projectId}/meetings/${meetingId}/summary`);

export const uploadTranscript = (projectId: string, body: UploadTranscriptBody) =>
  apiPost<ApiResponse<{ meeting: Meeting; record: MeetingRecord }>>(
    `/api/v1/projects/${projectId}/meetings`,
    body,
  );
```

### `src/api/action.api.ts`

```typescript
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import type { ApiResponse, Action } from "@/types/api.types";
import type { ActionProposal } from "@/types/ops-ninja";

type ExecuteActionBody = {
  proposal: ActionProposal;
  credentials: Record<string, string>;
};

type UpdateActionBody = {
  action_status: Action["action_status"];
  error_message?: string;
};

export const getActions = (projectId: string, meetingId: string) =>
  apiGet<ApiResponse<Action[]>>(`/api/v1/projects/${projectId}/meetings/${meetingId}/actions`);

export const executeAction = (projectId: string, meetingId: string, actionId: string, body: ExecuteActionBody) =>
  apiPost<ApiResponse<Action>>(
    `/api/v1/projects/${projectId}/meetings/${meetingId}/actions/${actionId}/execute`,
    body,
  );

export const updateActionStatus = (projectId: string, meetingId: string, actionId: string, body: UpdateActionBody) =>
  apiPatch<ApiResponse<Action>>(
    `/api/v1/projects/${projectId}/meetings/${meetingId}/actions/${actionId}`,
    body,
  );
```

---

## 6. Query Keys

Define all query keys in one place to avoid string typos and enable targeted invalidation.

### `src/hooks/queryKeys.ts`

```typescript
export const queryKeys = {
  user: {
    me: () => ["user", "me"] as const,
    byId: (userId: string) => ["user", userId] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    detail: (projectId: string) => ["projects", projectId] as const,
  },
  integrations: {
    mine: () => ["integrations", "me"] as const,
  },
  chats: {
    list: (projectId: string) => ["chats", projectId] as const,
    detail: (projectId: string, chatId: string) => ["chats", projectId, chatId] as const,
  },
  messages: {
    list: (projectId: string, chatId: string) => ["messages", projectId, chatId] as const,
  },
  meetings: {
    list: (projectId: string) => ["meetings", projectId] as const,
    detail: (projectId: string, meetingId: string) => ["meetings", projectId, meetingId] as const,
    summary: (projectId: string, meetingId: string) => ["meetings", projectId, meetingId, "summary"] as const,
  },
  actions: {
    list: (projectId: string, meetingId: string) => ["actions", projectId, meetingId] as const,
  },
} as const;
```

---

## 7. Query & Mutation Hooks

### `src/hooks/useUser.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getMe, getUserById, updateMe } from "@/api/user.api";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => getMe().then((r) => r.data),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user.byId(userId),
    queryFn: () => getUserById(userId).then((r) => r.data),
    enabled: !!userId,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}
```

### `src/hooks/useProject.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getProjects, getProject, createProject, updateProject, deleteProject } from "@/api/project.api";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all(),
    queryFn: () => getProjects().then((r) => r.data),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProject(projectId).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateProject>[1]) => updateProject(projectId, body),
    onSuccess: (response) => {
      qc.setQueryData(queryKeys.projects.detail(projectId), response.data);
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      qc.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}
```

### `src/hooks/useIntegration.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getMyIntegrations, disconnectIntegration } from "@/api/integration.api";

export function useMyIntegrations() {
  return useQuery({
    queryKey: queryKeys.integrations.mine(),
    queryFn: () => getMyIntegrations().then((r) => r.data),
  });
}

export function useDisconnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disconnectIntegration,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.integrations.mine() });
    },
  });
}
```

### `src/hooks/useChat.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getChats, getChat, createChat, deleteChat } from "@/api/chat.api";

export function useChats(projectId: string) {
  return useQuery({
    queryKey: queryKeys.chats.list(projectId),
    queryFn: () => getChats(projectId).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useChat(projectId: string, chatId: string) {
  return useQuery({
    queryKey: queryKeys.chats.detail(projectId, chatId),
    queryFn: () => getChat(projectId, chatId).then((r) => r.data),
    enabled: !!projectId && !!chatId,
  });
}

export function useCreateChat(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { chat_name: string }) => createChat(projectId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chats.list(projectId) });
    },
  });
}

export function useDeleteChat(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => deleteChat(projectId, chatId),
    onSuccess: (_, chatId) => {
      qc.removeQueries({ queryKey: queryKeys.chats.detail(projectId, chatId) });
      qc.invalidateQueries({ queryKey: queryKeys.chats.list(projectId) });
    },
  });
}
```

### `src/hooks/useMessage.ts`

This is the most important hook. Sending a message is synchronous from the API's perspective (the endpoint waits for the agent to reply before responding), so we use **optimistic updates** to show the user's message immediately while the request is in flight.

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getMessages, sendMessage } from "@/api/message.api";
import type { Message } from "@/types/api.types";

export function useMessages(projectId: string, chatId: string) {
  return useQuery({
    queryKey: queryKeys.messages.list(projectId, chatId),
    queryFn: () => getMessages(projectId, chatId).then((r) => r.data),
    enabled: !!projectId && !!chatId,
    // Messages are append-only — no need to refetch frequently
    staleTime: Infinity,
    refetchOnMount: true,
  });
}

export function useSendMessage(projectId: string, chatId: string) {
  const qc = useQueryClient();
  const key = queryKeys.messages.list(projectId, chatId);

  return useMutation({
    mutationFn: (body: { message: string; jira_credentials?: Record<string, string>; slack_credentials?: Record<string, string> }) =>
      sendMessage(projectId, chatId, body),

    // Show user message immediately while waiting for agent
    onMutate: async ({ message }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Message[]>(key);

      const optimisticMsg: Message = {
        message_id: `optimistic-${Date.now()}`,
        chat_id: chatId,
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      };

      qc.setQueryData<Message[]>(key, (old = []) => [...old, optimisticMsg]);

      return { previous };
    },

    // Replace optimistic entry with real server data (both user + assistant messages)
    onSuccess: (response) => {
      qc.setQueryData<Message[]>(key, (old = []) => {
        // Remove optimistic entry, add real user and assistant messages from response
        const withoutOptimistic = old.filter((m) => !m.message_id.startsWith("optimistic-"));
        return [...withoutOptimistic, response.data.userMessage, response.data.assistantMessage];
      });
    },

    // Roll back on error
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(key, context.previous);
      }
    },
  });
}
```

### `src/hooks/useMeeting.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getMeetings, getMeeting, getMeetingSummary, uploadTranscript } from "@/api/meeting.api";

export function useMeetings(projectId: string) {
  return useQuery({
    queryKey: queryKeys.meetings.list(projectId),
    queryFn: () => getMeetings(projectId).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useMeeting(projectId: string, meetingId: string) {
  return useQuery({
    queryKey: queryKeys.meetings.detail(projectId, meetingId),
    queryFn: () => getMeeting(projectId, meetingId).then((r) => r.data),
    enabled: !!projectId && !!meetingId,
  });
}

export function useMeetingSummary(projectId: string, meetingId: string) {
  return useQuery({
    queryKey: queryKeys.meetings.summary(projectId, meetingId),
    queryFn: () => getMeetingSummary(projectId, meetingId).then((r) => r.data),
    enabled: !!projectId && !!meetingId,
    // Summary doesn't change after it's created
    staleTime: Infinity,
  });
}

export function useUploadTranscript(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { meeting_platform: string; original_transcript: string }) =>
      uploadTranscript(projectId, body),
    onSuccess: (response) => {
      // Add new meeting to the list without a full refetch
      qc.invalidateQueries({ queryKey: queryKeys.meetings.list(projectId) });
      // Pre-populate detail and summary caches with what the server returned
      const { meeting, record } = response.data;
      qc.setQueryData(queryKeys.meetings.detail(projectId, meeting.meeting_id), meeting);
      qc.setQueryData(queryKeys.meetings.summary(projectId, meeting.meeting_id), record);
    },
  });
}
```

### `src/hooks/useAction.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getActions, executeAction, updateActionStatus } from "@/api/action.api";
import type { Action } from "@/types/api.types";
import type { ActionProposal } from "@/types/ops-ninja";

export function useActions(projectId: string, meetingId: string) {
  return useQuery({
    queryKey: queryKeys.actions.list(projectId, meetingId),
    queryFn: () => getActions(projectId, meetingId).then((r) => r.data),
    enabled: !!projectId && !!meetingId,
  });
}

export function useExecuteAction(projectId: string, meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, proposal, credentials }: { actionId: string; proposal: ActionProposal; credentials: Record<string, string> }) =>
      executeAction(projectId, meetingId, actionId, { proposal, credentials }),
    onSuccess: (response) => {
      // Update the specific action in the cached list
      qc.setQueryData<Action[]>(queryKeys.actions.list(projectId, meetingId), (old = []) =>
        old.map((a) => (a.action_id === response.data.action_id ? response.data : a)),
      );
    },
  });
}

export function useUpdateActionStatus(projectId: string, meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, ...body }: { actionId: string; action_status: Action["action_status"]; error_message?: string }) =>
      updateActionStatus(projectId, meetingId, actionId, body),
    onSuccess: (response) => {
      qc.setQueryData<Action[]>(queryKeys.actions.list(projectId, meetingId), (old = []) =>
        old.map((a) => (a.action_id === response.data.action_id ? response.data : a)),
      );
    },
  });
}
```

---

## 8. Component Wiring

### Projects page — `ProjectPage/index.tsx`

Replace the hardcoded `projects` array:

```tsx
"use client";

import { useProjects, useCreateProject } from "@/hooks/useProject";
import Link from "next/link";

export default function ProjectPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();

  if (isLoading) return <main className="resource-shell"><p>Loading…</p></main>;

  return (
    <main className="resource-shell">
      {/* nav unchanged */}
      <section className="resource-page">
        <div className="projects-header">
          <div className="resource-intro">…</div>
          <button
            className="button button-primary"
            type="button"
            onClick={() => createProject.mutate({ project_name: "New project" })}
            disabled={createProject.isPending}
          >
            {createProject.isPending ? "Creating…" : "New project"}
          </button>
        </div>
        <div className="projects-grid">
          {projects?.map((project) => (
            <Link className="project-card" href={`/project/${project.project_id}`} key={project.project_id}>
              <h3>{project.project_name}</h3>
              <p>{project.project_description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
```

### Integrations page — `IntegrationsPage/index.tsx`

```tsx
"use client";

import { useMyIntegrations, useDisconnectIntegration } from "@/hooks/useIntegration";

export default function IntegrationsPage() {
  const { data: integrations, isLoading } = useMyIntegrations();
  const disconnect = useDisconnectIntegration();

  const handleConnect = (platform: string) => {
    if (platform === "jira") window.location.href = "/api/v1/auth/jira";
    // Slack and Calendar OAuth follow the same redirect pattern
  };

  if (isLoading) return <div>Loading integrations…</div>;

  return (
    <main className="resource-shell">
      {/* nav unchanged */}
      <div className="integrations-grid">
        {integrations?.map((integration) => (
          <article className="integration-card" key={integration.integration_id}>
            <h3>{integration.platform}</h3>
            <div className="integration-status">
              <span className="connected">Connected</span>
              <button
                className="button button-quiet small"
                onClick={() => disconnect.mutate(integration.platform)}
                disabled={disconnect.isPending}
              >
                Disconnect
              </button>
            </div>
          </article>
        ))}
        {/* Render "not connected" cards for platforms not in the list */}
      </div>
    </main>
  );
}
```

### Chat page — `ProjectChatDetailsPage/index.tsx`

This is the most important component — it replaces the local state with real API data and handles the optimistic update pattern.

```tsx
"use client";

import { useRef, useEffect } from "react";
import { useMessages, useSendMessage } from "@/hooks/useMessage";
import Link from "next/link";

type Props = { chatId: string; projectId: string };

export default function ProjectChatDetailsPage({ chatId, projectId }: Props) {
  const { data: messages, isLoading } = useMessages(projectId, chatId);
  const sendMessage = useSendMessage(projectId, chatId);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = inputRef.current?.value.trim();
    if (!message || sendMessage.isPending) return;
    sendMessage.mutate({ message });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <main className="resource-shell">
      <nav className="resource-nav">
        <Link href={`/project/${projectId}/chat`} className="text-link">← Chat threads</Link>
      </nav>
      <section className="resource-page thread-page">
        <div className="thread-conversation">
          {isLoading && <p className="thread-state">Loading messages…</p>}
          {messages?.map((msg) => (
            <div key={msg.message_id} className={`thread-message ${msg.role}`}>
              <span>{msg.role === "user" ? "You" : "ON"}</span>
              <p>{msg.content}</p>
            </div>
          ))}
          {/* Typing indicator while waiting for agent */}
          {sendMessage.isPending && (
            <div className="thread-message assistant">
              <span>ON</span>
              <p className="thread-thinking">Thinking…</p>
            </div>
          )}
          <div ref={bottomRef} />
          <form className="thread-compose" onSubmit={submit}>
            <input
              ref={inputRef}
              aria-label="Ask a project question"
              placeholder="Ask about this project…"
              disabled={sendMessage.isPending}
            />
            <button className="button button-primary" type="submit" disabled={sendMessage.isPending}>
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
```

### Meeting summary page — `MeetingSummaryPage/index.tsx`

```tsx
"use client";

import { useMeetingSummary } from "@/hooks/useMeeting";
import { useActions, useExecuteAction } from "@/hooks/useAction";

type Props = { projectId: string; meetingId: string };

export default function MeetingSummaryPage({ projectId, meetingId }: Props) {
  const { data: record, isLoading: summaryLoading } = useMeetingSummary(projectId, meetingId);
  const { data: actions, isLoading: actionsLoading } = useActions(projectId, meetingId);
  const executeAction = useExecuteAction(projectId, meetingId);

  if (summaryLoading || actionsLoading) return <div>Loading…</div>;

  const minutes = record?.minutes;

  return (
    <main className="resource-shell">
      <section className="resource-page">
        <h1>{minutes?.title}</h1>
        <p>{minutes?.summary}</p>

        <h2>Action items</h2>
        {actions?.map((action) => (
          <div key={action.action_id} className="action-card">
            <h3>{action.title}</h3>
            <span className={`status-${action.action_status}`}>{action.action_status}</span>
            {action.action_status === "proposed" && (
              <button
                className="button button-primary small"
                onClick={() =>
                  executeAction.mutate({
                    actionId: action.action_id,
                    proposal: action.proposal,
                    credentials: {},  // Pull from integrations store
                  })
                }
                disabled={executeAction.isPending}
              >
                Approve & execute
              </button>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
```

---

## 9. Auth Flow

The backend sets `application_token` as an httpOnly cookie after Cognito OAuth. Because `axiosInstance` has `withCredentials: true`, every request automatically sends this cookie — **no manual token handling is needed in the frontend**.

Handling 401s globally — add an interceptor to `axiosInstance.ts`:

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign-in; the Cognito OAuth redirect will come back to /api/v1/auth/cognito/callback
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  },
);
```

The sign-in page initiates Cognito OAuth:

```tsx
// SigninPage/index.tsx
const COGNITO_LOGIN_URL = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?...`;

function handleSignIn() {
  window.location.href = COGNITO_LOGIN_URL;
}
```

---

## 10. Error Handling

TanStack Query surfaces errors via `.isError` and `.error` on every query/mutation result. Use a shared `ErrorMessage` component:

```tsx
// src/component/ErrorMessage.tsx
export function ErrorMessage({ message }: { message?: string }) {
  return <p className="error-message">{message ?? "Something went wrong. Please try again."}</p>;
}

// In a component:
const { data, isError, error } = useProjects();
if (isError) return <ErrorMessage message={(error as any)?.response?.data?.error} />;
```

For mutations, show inline errors:

```tsx
const createProject = useCreateProject();

{createProject.isError && (
  <ErrorMessage message={(createProject.error as any)?.response?.data?.error} />
)}
```

---

## 11. Loading States

Use TanStack Query's `isLoading` (first fetch, no cache) vs `isFetching` (background refresh):

```tsx
// Skeleton while waiting for first data
if (isLoading) return <ProjectListSkeleton />;

// Subtle spinner for background refresh (data is already visible)
{isFetching && <span className="refresh-indicator" aria-label="Refreshing" />}
```

---

## 12. Prefetching (Nice-to-have)

Prefetch project detail when hovering a project card, so navigation feels instant:

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { getProject } from "@/api/project.api";

const qc = useQueryClient();

<Link
  href={`/project/${project.project_id}`}
  onMouseEnter={() =>
    qc.prefetchQuery({
      queryKey: queryKeys.projects.detail(project.project_id),
      queryFn: () => getProject(project.project_id).then((r) => r.data),
      staleTime: 30_000,
    })
  }
>
```

---

## 13. Implementation Order

| Phase | Work |
|---|---|
| 1 | Install `@tanstack/react-query`, create `queryClient.ts`, wrap `layout.tsx` with provider |
| 2 | Create `src/types/api.types.ts` and `src/hooks/queryKeys.ts` |
| 3 | Create all API files in `src/api/` |
| 4 | Create all hooks in `src/hooks/` |
| 5 | Wire `ProjectPage` and `IntegrationsPage` (simplest — read-only lists) |
| 6 | Wire `ProjectChatDetailsPage` with optimistic send |
| 7 | Wire `MeetingSummaryPage` + action approval flow |
| 8 | Wire `ProjectMeetingPage` with transcript upload |
| 9 | Wire auth interceptor and 401 redirect |
| 10 | Add prefetching and devtools |

---

## 14. Stale Time Reference

| Data | Stale time | Reason |
|---|---|---|
| `useMe` | 30s | Profile rarely changes mid-session |
| `useProjects` | 30s | Shared; could be updated by teammates |
| `useChats` | 30s | Lightweight list |
| `useMessages` | `Infinity` | Append-only; invalidated explicitly on send |
| `useMeetings` | 30s | Could change when teammate uploads |
| `useMeetingSummary` | `Infinity` | Created once; never changes |
| `useActions` | 30s | Status updates after execute |
| `useMyIntegrations` | 60s | OAuth state changes rarely |
