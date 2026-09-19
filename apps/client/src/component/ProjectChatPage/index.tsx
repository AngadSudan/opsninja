"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { useChats, useCreateChat, useDeleteChat } from "@/hooks/useChat";
import ConfirmDialog from "@/component/ConfirmDialog";

type ProjectChatPageProps = {
  projectId: string;
};

export default function ProjectChatPage({ projectId }: ProjectChatPageProps) {
  const router = useRouter();
  const { data: project } = useProject(projectId);
  const { data: chats, isLoading, isError } = useChats(projectId);
  const createChat = useCreateChat(projectId);
  const deleteChat = useDeleteChat(projectId);

  const [isCreating, setIsCreating] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    const res = await createChat.mutateAsync({ chat_name: newChatName.trim() });
    setNewChatName("");
    setIsCreating(false);
    if (res?.chat_id) {
      router.push(`/project/${projectId}/chat/${res.chat_id}`);
    }
  };

  const handleDeleteChat = async () => {
    if (chatToDelete) {
      await deleteChat.mutateAsync(chatToDelete);
      setChatToDelete(null);
    }
  };

  const chatList = chats ?? [];

  return (
    <div className="workspace-page space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#8a9587]">
        <Link
          href={`/project/${projectId}`}
          className="flex items-center gap-1.5 text-[#59745b] transition hover:text-[#20251f]"
        >
          <span>←</span>
          <span>{project?.name || "Project"}</span>
        </Link>
        <span>/</span>
        <span className="text-[#20251f] font-bold">Conversations</span>
      </nav>

      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#dfe5dc] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              Project Conversations
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Chat Threads & Queries
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#596257]">
            Grounded operational conversations backed by meeting intelligence and project knowledge.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#323c31] active:scale-[0.98]"
        >
          <span className="text-base leading-none">+</span>
          <span>New chat thread</span>
        </button>
      </section>

      {/* New Chat Creator Drawer/Card */}
      {isCreating && (
        <div className="rounded-3xl border border-[#cbd9c8] bg-[#fafbf9] p-7 sm:p-8 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#20251f]">Start a new conversation thread</h2>
              <p className="mt-1 text-xs text-[#596257]">
                Give this thread a descriptive name so team members know what context is explored here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-[#8a9587] hover:text-[#20251f]"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateChat} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              required
              autoFocus
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="E.g., Sprint 42 Scope & Blockers..."
              className="flex-1 rounded-2xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={createChat.isPending}
                className="rounded-xl bg-[#20251f] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#323c31] disabled:opacity-50"
              >
                {createChat.isPending ? "Creating…" : "Start conversation"}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-xs font-bold text-[#596257] hover:bg-[#f0f3ee]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="divide-y divide-[#edf0eb] border border-[#dfe5dc] bg-white">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white p-6" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load chat threads. Please check your connection and try again.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && chatList.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#cbd9c8] bg-white p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-2xl text-[#2563eb] shadow-xs">
            ✦
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#20251f]">No conversations started yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#596257]">
            Start a new thread to ask questions about meeting decisions, action items, or project scope.
          </p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31]"
          >
            + Start first thread
          </button>
        </div>
      )}

      {/* Threads list */}
      {!isLoading && !isError && chatList.length > 0 && (
        <div className="space-y-4">
          {chatList.map((chat) => (
            <div
              key={chat.chat_id}
              className="group flex flex-col justify-between p-4 transition hover:bg-[#f8faf7] sm:flex-row sm:items-center gap-4"
            >
              <Link
                href={`/project/${projectId}/chat/${chat.chat_id}`}
                className="flex flex-1 items-center gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ff] text-base font-bold text-[#2563eb] shadow-xs">
                  ✦
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#20251f] group-hover:text-[#59745b] transition-colors">
                    {chat.chat_name || "Untitled Thread"}
                  </h2>
                  <p className="mt-1 text-xs text-[#7a8678]">
                    Created {new Date(chat.created_at || chat.updated_at).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Link
                  href={`/project/${projectId}/chat/${chat.chat_id}`}
                  className="rounded-xl border border-[#dfe5dc] bg-[#fafaf8] px-4 py-2 text-xs font-bold text-[#59745b] transition hover:border-[#59745b] hover:bg-white"
                >
                  Open thread →
                </Link>
                <button
                  type="button"
                  onClick={() => setChatToDelete(chat.chat_id)}
                  className="rounded-xl p-2 text-[#a0a99f] transition hover:bg-red-50 hover:text-red-600"
                  title="Delete thread"
                  aria-label={`Delete thread ${chat.chat_name}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(chatToDelete)}
        title="Delete Conversation Thread?"
        message="Are you sure you want to delete this thread? All messages in this conversation will be permanently removed."
        confirmText="Delete Thread"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteChat}
        onCancel={() => setChatToDelete(null)}
      />
    </div>
  );
}
