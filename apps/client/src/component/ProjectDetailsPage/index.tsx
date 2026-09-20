"use client";

import { useState } from "react";
import Link from "next/link";
import { useProject } from "@/hooks/useProject";
import { useMeetings } from "@/hooks/useMeeting";
import { useChats, useCreateChat } from "@/hooks/useChat";
import UploadMeetingModal from "@/component/UploadMeetingModal";

export default function ProjectDetailsPage({
  projectId,
}: {
  projectId: string;
}) {
  const {
    data: project,
    isLoading: projectLoading,
    isError,
  } = useProject(projectId);
  const { data: meetings, isLoading: meetingsLoading } = useMeetings(projectId);
  const { data: chats, isLoading: chatsLoading } = useChats(projectId);
  const createChat = useCreateChat(projectId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const meetingList = meetings ?? [];
  const chatList = chats ?? [];

  const createThread = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newChatName.trim()) return;
    await createChat.mutateAsync({ chat_name: newChatName.trim() });
    setNewChatName("");
    setNewChatOpen(false);
  };

  return (
    <div className="workspace-page">
      <header className="border-b border-[var(--line)] pb-8">
        <nav className="mb-5 flex gap-2 text-sm font-semibold text-[var(--ink-3)]">
          <Link href="/projects" className="hover:text-[var(--ink)]">Projects</Link>
          <span>/</span>
          <span className="truncate">{project?.name || "Project"}</span>
        </nav>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              {project?.name ??
                (projectLoading ? "Loading project..." : "Project workspace")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--ink-2)]">
              {project?.description ||
                "A shared operational record for meetings, decisions, and follow-through."}
            </p>
            <p className="mt-4 text-sm text-[var(--ink-3)]">
              {meetingList.length} meetings · {chatList.length} conversations
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3 lg:justify-end">
            <button onClick={() => setNewChatOpen(true)} className="secondary-action">
              New conversation
            </button>
            <button onClick={() => setUploadOpen(true)} className="primary-action">
              Upload transcript
            </button>
          </div>
        </div>
      </header>

      <nav className="flex gap-6 overflow-x-auto border-b border-[var(--line)] py-4 text-sm font-bold" aria-label="Project sections">
        <Link href={`/project/${projectId}`} className="text-[var(--orange-dark)]">Overview</Link>
        <Link href={`/project/${projectId}/meeting-summary`} className="text-[var(--ink-2)] hover:text-[var(--ink)]">Meetings</Link>
        <Link href={`/project/${projectId}/meeting-summary`} className="text-[var(--ink-2)] hover:text-[var(--ink)]">Knowledge</Link>
        <Link href={`/project/${projectId}/meeting-summary`} className="text-[var(--ink-2)] hover:text-[var(--ink)]">Actions</Link>
        <Link href={`/project/${projectId}/chat`} className="text-[var(--ink-2)] hover:text-[var(--ink)]">Chat</Link>
      </nav>

      {isError && (
        <div className="border-b border-[var(--line)] py-5 text-sm text-[var(--red)]">
          Project details could not be loaded. Please verify the project ID and try again.
        </div>
      )}

      {newChatOpen && (
        <form
          onSubmit={createThread}
          className="grid gap-3 border-b border-[var(--line)] py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          <input
            autoFocus
            required
            value={newChatName}
            onChange={(event) => setNewChatName(event.target.value)}
            placeholder="Name this conversation"
            className="min-h-11 rounded-[5px] border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--orange)]"
          />
          <button disabled={createChat.isPending} className="primary-action">
            {createChat.isPending ? "Creating..." : "Create thread"}
          </button>
          <button
            type="button"
            onClick={() => setNewChatOpen(false)}
            className="secondary-action"
          >
            Cancel
          </button>
        </form>
      )}

      <section className="grid gap-12 py-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent activity</h2>
              <p className="mt-1 text-sm text-[var(--ink-3)]">
                Meeting evidence, decisions, and follow-up records.
              </p>
            </div>
            <Link href={`/project/${projectId}/meeting-summary`} className="text-sm font-bold text-[var(--orange-dark)]">
              View all
            </Link>
          </div>

          {meetingsLoading && (
            <div className="py-8 text-sm text-[var(--ink-3)]">Loading meeting records...</div>
          )}
          {!meetingsLoading && !meetingList.length && (
            <div className="border-b border-[var(--line)] py-10">
              <h3 className="text-xl font-bold">No transcripts yet</h3>
              <p className="mt-2 text-sm text-[var(--ink-2)]">
                Upload the first meeting to create a project record.
              </p>
              <button onClick={() => setUploadOpen(true)} className="primary-action mt-6">
                Upload transcript
              </button>
            </div>
          )}
          <div className="divide-y divide-[var(--line)]">
            {meetingList.slice(0, 6).map((meeting) => (
              <Link
                key={meeting.meeting_id}
                href={`/project/${projectId}/meeting/${meeting.meeting_id}`}
                className="grid gap-4 py-5 hover:bg-white sm:grid-cols-[7rem_minmax(0,1fr)_8rem]"
              >
                <time className="text-sm text-[var(--ink-3)]">
                  {new Date(meeting.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <div>
                  <p className="text-sm font-bold text-[var(--orange-dark)]">
                    {meeting.meeting_platform || "Meeting"}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">
                    {meeting.shortname || "Meeting record"}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-[var(--ink-2)]">
                    {meeting.description ||
                      "Structured minutes and action proposals are ready for review."}
                  </p>
                </div>
                <span className="status-text status-success sm:justify-self-end">
                  Indexed
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-8">
          <section>
            <div className="flex items-end justify-between border-b border-[var(--line)] pb-4">
              <h2 className="text-2xl font-bold tracking-tight">Chat</h2>
              <Link href={`/project/${projectId}/chat`} className="text-sm font-bold text-[var(--orange-dark)]">
                All
              </Link>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {chatsLoading && (
                <p className="py-5 text-sm text-[var(--ink-3)]">Loading threads...</p>
              )}
              {!chatsLoading && !chatList.length && (
                <p className="py-5 text-sm leading-6 text-[var(--ink-2)]">
                  No conversations yet.
                </p>
              )}
              {chatList.slice(0, 5).map((chat) => (
                <Link
                  key={chat.chat_id}
                  href={`/project/${projectId}/chat/${chat.chat_id}`}
                  className="block py-4 hover:text-[var(--orange-dark)]"
                >
                  <p className="truncate font-bold">{chat.chat_name || "Untitled conversation"}</p>
                  <p className="mt-1 text-sm text-[var(--ink-3)]">
                    {new Date(chat.updated_at || chat.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="border-y border-[var(--line)] py-5">
            <h2 className="text-lg font-bold">Project metadata</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-3)]">Project ID</dt>
                <dd className="font-semibold">{projectId.slice(0, 8)}...</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-3)]">Records</dt>
                <dd className="font-semibold">{meetingList.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-3)]">Threads</dt>
                <dd className="font-semibold">{chatList.length}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </section>

      <UploadMeetingModal
        projectId={projectId}
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
}
