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
  const latestMeeting = meetingList[0];
  const workflowSteps = [
    { label: "Meeting", value: String(meetingList.length), tone: "text-[#315f8d]" },
    { label: "Context", value: "Indexed", tone: "text-[#208c55]" },
    { label: "Review", value: "Human gate", tone: "text-[#c97a17]" },
    { label: "Execute", value: "Jira / Slack", tone: "text-[#c3562c]" },
  ];
  const createThread = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newChatName.trim()) return;
    await createChat.mutateAsync({ chat_name: newChatName.trim() });
    setNewChatName("");
    setNewChatOpen(false);
  };

  return (
    <div className="workspace-page">
      <header className="flex flex-col gap-4 border-b border-[#ddd5c9] pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <nav className="mb-3 flex gap-2 text-[11px] font-semibold text-[#7a8678]">
            <Link href="/projects" className="text-[#59745b]">
              Projects
            </Link>
            <span>/</span>
            <span className="truncate">{project?.name || "Workspace"}</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#9f3f1e]">
            Project cockpit
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {project?.name ??
              (projectLoading ? "Loading project…" : "Project workspace")}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#665f55]">
            {project?.description ||
              "A shared operational record for meetings, decisions, and follow-through."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setNewChatOpen(true)}
            className="min-h-10 rounded-lg border border-[#ddd5c9] bg-white px-4 py-2 text-xs font-bold text-[#706a60] transition hover:border-[#c3562c] hover:text-[#1c1b17]"
          >
            New conversation
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="min-h-10 rounded-lg bg-[#1c1b17] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2b2923]"
          >
            Upload transcript
          </button>
        </div>
      </header>
      {isError && (
        <div className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          Project details could not be loaded. Please verify the project ID and
          try again.
        </div>
      )}
      {newChatOpen && (
        <form
          onSubmit={createThread}
          className="mt-4 flex flex-col gap-2 rounded-lg border border-[#cfd9cd] bg-[#f7faf6] p-3 sm:flex-row"
        >
          <input
            autoFocus
            required
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            placeholder="Name this conversation…"
            className="min-w-0 flex-1 rounded-lg border border-[#d6ddd3] bg-white px-3 py-2 text-sm outline-none focus:border-[#59745b] focus:ring-4 focus:ring-[#59745b]/10"
          />
          <button
            disabled={createChat.isPending}
            className="rounded-lg bg-[#20251f] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            {createChat.isPending ? "Creating…" : "Create thread"}
          </button>
          <button
            type="button"
            onClick={() => setNewChatOpen(false)}
            className="px-3 py-2 text-xs font-bold text-[#667166]"
          >
            Cancel
          </button>
        </form>
      )}
      <section className="mt-5 grid gap-px overflow-hidden rounded-lg border border-[#ddd5c9] bg-[#ddd5c9] md:grid-cols-4">
        {workflowSteps.map((step) => (
          <div key={step.label} className="bg-[#fffdfa] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8175]">
              {step.label}
            </p>
            <p className={`mt-1 text-sm font-extrabold ${step.tone}`}>
              {step.value}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-5 grid overflow-hidden rounded-lg border border-[#ddd5c9] bg-[#fffdfa] xl:grid-cols-[210px_minmax(0,1fr)_310px]">
        <aside className="border-b border-[#e8e0d4] p-3 xl:border-b-0 xl:border-r">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#8a8175]">
            Project
          </p>
          <nav className="grid gap-1 text-xs font-semibold">
            <Link
              className="rounded-md bg-[#f4e8de] px-2.5 py-2 text-[#8f3e21]"
              href={`/project/${projectId}`}
            >
              Overview
            </Link>
            <Link
              className="rounded-md px-2.5 py-2 text-[#665f55] hover:bg-[#f8f6f1]"
              href={`/project/${projectId}/meeting-summary`}
            >
              Meeting records{" "}
              <span className="float-right text-[#8a9587]">
                {meetingList.length}
              </span>
            </Link>
            <Link
              className="rounded-md px-2.5 py-2 text-[#665f55] hover:bg-[#f8f6f1]"
              href={`/project/${projectId}/chat`}
            >
              Conversations{" "}
              <span className="float-right text-[#8a9587]">
                {chatList.length}
              </span>
            </Link>
          </nav>
        </aside>
        <section className="min-w-0 border-b border-[#e8e0d4] xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8e0d4] px-4 py-3">
            <div>
              <h2 className="text-sm font-bold">Recent operational activity</h2>
              <p className="text-[11px] text-[#756d63]">
                Meeting evidence, extracted decisions, and follow-up proposals
              </p>
            </div>
            <Link
              href={`/project/${projectId}/meeting-summary`}
              className="text-[11px] font-bold text-[#9f3f1e]"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#edf0eb]">
            {meetingsLoading && (
              <div className="p-4 text-xs text-[#7a8678]">
                Loading meeting records…
              </div>
            )}
            {!meetingsLoading && !meetingList.length && (
              <div className="p-5 text-xs text-[#667166]">
                No transcripts in this vault.{" "}
                <button
                  onClick={() => setUploadOpen(true)}
                  className="font-bold text-[#59745b]"
                >
                  Upload the first one
                </button>
                .
              </div>
            )}
            {meetingList.slice(0, 5).map((meeting, index) => (
              <Link
                key={meeting.meeting_id}
                href={`/project/${projectId}/meeting/${meeting.meeting_id}`}
                className="block px-4 py-3 transition hover:bg-[#f8f6f1]"
              >
                <div className="flex justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#9f3f1e]">
                    {meeting.meeting_platform || "Meeting"}
                  </span>
                  <span className="text-[10px] text-[#8a9587]">
                    {new Date(meeting.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-sm font-bold">
                  {meeting.shortname || "Meeting record"}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-[#6d776b]">
                  {meeting.description ||
                    "Structured minutes and action proposals are ready for review."}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="ops-status ops-status-success">MOM ready</span>
                  <span className="ops-status ops-status-pending">
                    {index === 0 ? "Review next" : "Evidence linked"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <aside className="min-w-0 bg-[#fbfaf7]">
          <div className="border-b border-[#e8e0d4] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8a8175]">
              Vault context
            </p>
            <p className="mt-1 text-xs font-bold">
              {meetingList.length} records indexed
            </p>
            {latestMeeting && (
              <Link
                href={`/project/${projectId}/meeting/${latestMeeting.meeting_id}`}
                className="mt-3 block rounded-md border border-[#ddd5c9] bg-white p-3 text-xs transition hover:border-[#c3562c]"
              >
                <span className="font-bold text-[#9f3f1e]">Latest meeting</span>
                <span className="mt-1 block truncate text-[#1c1b17]">
                  {latestMeeting.shortname || "Meeting record"}
                </span>
              </Link>
            )}
          </div>
          <div className="p-4">
            <div className="flex justify-between">
              <h2 className="text-sm font-bold">Recent conversations</h2>
              <Link
                href={`/project/${projectId}/chat`}
                className="text-[11px] font-bold text-[#9f3f1e]"
              >
                All
              </Link>
            </div>
            <div className="mt-2 divide-y divide-[#e7ebe5]">
              {chatsLoading && (
                <p className="py-3 text-xs text-[#7a8678]">Loading threads…</p>
              )}
              {!chatsLoading && !chatList.length && (
                <p className="py-3 text-xs text-[#6d776b]">
                  No conversations yet.
                </p>
              )}
              {chatList.slice(0, 4).map((chat) => (
                <Link
                  key={chat.chat_id}
                  href={`/project/${projectId}/chat/${chat.chat_id}`}
                  className="block py-2.5 hover:text-[#9f3f1e]"
                >
                  <p className="truncate text-xs font-semibold">
                    {chat.chat_name || "Untitled conversation"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8a9587]">
                    {new Date(
                      chat.updated_at || chat.created_at,
                    ).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-[#e8e0d4] p-4 text-xs text-[#665f55]">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#208c55]" />
            Vault sync active
            <br />
            <span className="ml-2.5 text-[10px] text-[#8a9587]">
              ID {projectId.slice(0, 8)}…
            </span>
          </div>
        </aside>
      </div>
      <UploadMeetingModal
        projectId={projectId}
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
}
