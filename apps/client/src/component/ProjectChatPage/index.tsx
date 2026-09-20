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

  const handleCreateChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newChatName.trim()) return;
    const response = await createChat.mutateAsync({ chat_name: newChatName.trim() });
    setNewChatName("");
    setIsCreating(false);
    if (response?.chat_id) {
      router.push(`/project/${projectId}/chat/${response.chat_id}`);
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
    <div className="workspace-page">
      <nav className="mb-5 flex items-center gap-2 text-sm font-semibold text-[var(--ink-3)]">
        <Link href={`/project/${projectId}`} className="hover:text-[var(--ink)]">
          {project?.name || "Project"}
        </Link>
        <span>/</span>
        <span>Chat</span>
      </nav>

      <section className="flex flex-col gap-6 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">Project chat</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-2)]">
            Ask questions against meeting records, decisions, action proposals,
            and project knowledge.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="primary-action"
        >
          New conversation
        </button>
      </section>

      {isCreating && (
        <form
          onSubmit={handleCreateChat}
          className="grid gap-3 border-b border-[var(--line)] py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          <input
            type="text"
            required
            autoFocus
            value={newChatName}
            onChange={(event) => setNewChatName(event.target.value)}
            placeholder="Conversation name"
            className="min-h-11 rounded-[5px] border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--orange)]"
          />
          <button
            type="submit"
            disabled={createChat.isPending}
            className="primary-action"
          >
            {createChat.isPending ? "Creating..." : "Start"}
          </button>
          <button type="button" onClick={() => setIsCreating(false)} className="secondary-action">
            Cancel
          </button>
        </form>
      )}

      {isLoading && (
        <div className="divide-y divide-[var(--line)]">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse bg-white/60" />
          ))}
        </div>
      )}

      {isError && (
        <div className="border-b border-[var(--line)] py-8 text-sm text-[var(--red)]">
          Failed to load chat threads. Please check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && chatList.length === 0 && (
        <div className="border-b border-[var(--line)] py-14">
          <h2 className="text-2xl font-bold">No conversations yet</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-2)]">
            Start a thread to inspect project decisions, unresolved actions, or
            technical dependencies.
          </p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="primary-action mt-6"
          >
            Start first thread
          </button>
        </div>
      )}

      {!isLoading && !isError && chatList.length > 0 && (
        <div className="divide-y divide-[var(--line)]">
          {chatList.map((chat) => (
            <article
              key={chat.chat_id}
              className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_12rem]"
            >
              <Link href={`/project/${projectId}/chat/${chat.chat_id}`}>
                <h2 className="text-2xl font-bold tracking-tight hover:text-[var(--orange-dark)]">
                  {chat.chat_name || "Untitled conversation"}
                </h2>
                <p className="mt-2 text-sm text-[var(--ink-3)]">
                  Created {new Date(chat.created_at || chat.updated_at).toLocaleDateString()}
                </p>
              </Link>

              <div className="flex items-center gap-3 sm:justify-end">
                <Link href={`/project/${projectId}/chat/${chat.chat_id}`} className="secondary-action min-h-10 px-3 py-2 text-xs">
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => setChatToDelete(chat.chat_id)}
                  className="min-h-10 rounded-[5px] px-3 text-xs font-bold text-[var(--red)] hover:bg-white"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(chatToDelete)}
        title="Delete conversation?"
        message="All messages in this conversation will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteChat}
        onCancel={() => setChatToDelete(null)}
      />
    </div>
  );
}
