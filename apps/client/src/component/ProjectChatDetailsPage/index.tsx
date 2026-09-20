"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@/hooks/useChat";
import { useMessages, useSendMessage } from "@/hooks/useMessage";
import MarkdownContent from "@/component/MarkdownContent";
import type { ActionProposal, Message } from "@/types/api.types";

type ProjectChatDetailsPageProps = {
  chatId: string;
  projectId: string;
};

function getMessageContent(message: Message) {
  return message.structured_response || message.message;
}

function parseActions(message: Message): ActionProposal[] {
  if (!message.proposed_actions) return [];

  try {
    const parsed = JSON.parse(message.proposed_actions);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function MessageItem({ message }: { message: Message }) {
  const isUser = message.message_type === "USER";
  const actions = parseActions(message);
  const content = getMessageContent(message);

  return (
    <article className={`message-row ${isUser ? "user" : "system"}`}>
      {!isUser && <span className="message-avatar-token">ON</span>}
      <div className="message-body">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-[var(--ink-3)]">
          <span>{isUser ? "You" : "Ops Ninja"}</span>
          <time dateTime={message.created_at}>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-7">{content}</p>
        ) : (
          <MarkdownContent content={content} />
        )}
        {actions.length > 0 && (
          <div className="mt-4 border-t border-[var(--line)] pt-4">
            <p className="text-xs font-bold text-[var(--ink-3)]">
              Proposed actions
            </p>
            <div className="mt-3 grid gap-2">
              {actions.map((action, index) => (
                <div
                  key={`${action.type}-${action.title}-${index}`}
                  className="border border-[var(--line)] bg-[var(--page)] p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[var(--ink)]">
                      {action.title}
                    </span>
                    <span className="status-text status-pending">
                      {action.type}
                    </span>
                  </div>
                  {action.description && (
                    <p className="mt-2 leading-6 text-[var(--ink-2)]">
                      {action.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && <span className="message-avatar-token">You</span>}
    </article>
  );
}

export default function ProjectChatDetailsPage({
  chatId,
  projectId,
}: ProjectChatDetailsPageProps) {
  const { data: chat, isLoading: chatLoading } = useChat(projectId, chatId);
  const {
    data: messages,
    isLoading: messagesLoading,
    isError,
  } = useMessages(projectId, chatId);
  const sendMessage = useSendMessage(projectId, chatId);
  const [draft, setDraft] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const messageList = useMemo(() => messages ?? [], [messages]);

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setDraft("");
    await sendMessage.mutateAsync(text);
    textAreaRef.current?.focus();
  };

  return (
    <div className="workspace-page">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--ink-3)]">
        <Link href={`/project/${projectId}`} className="hover:text-[var(--ink)]">
          Project
        </Link>
        <span>/</span>
        <Link
          href={`/project/${projectId}/chat`}
          className="hover:text-[var(--ink)]"
        >
          Chat
        </Link>
        <span>/</span>
        <span className="truncate">
          {chat?.chat_name || (chatLoading ? "Loading" : "Conversation")}
        </span>
      </nav>

      <header className="grid gap-6 border-b border-[var(--line)] pb-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {chat?.chat_name ||
              (chatLoading ? "Loading conversation..." : "Conversation")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-2)]">
            Ask about project records, decisions, unresolved actions, and
            evidence from connected meeting notes.
          </p>
        </div>
        <div className="border-y border-[var(--line)] py-4 text-sm lg:self-end">
          <dl className="grid gap-3">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-3)]">Messages</dt>
              <dd className="font-bold">{messageList.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-3)]">Status</dt>
              <dd className="status-text status-success">Ready</dd>
            </div>
          </dl>
        </div>
      </header>

      <main className="grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          {messagesLoading && (
            <div className="message-column">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse border border-[var(--line)] bg-white"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="border-y border-[var(--line)] py-8 text-sm text-[var(--red)]">
              Messages could not be loaded. Please check your connection and try
              again.
            </div>
          )}

          {!messagesLoading && !isError && messageList.length === 0 && (
            <div className="ledger-surface border border-[var(--line)] p-8">
              <h2 className="text-2xl font-bold">Start the conversation</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-2)]">
                Ask for decisions, risks, owners, or next steps from this
                project&apos;s meeting record.
              </p>
            </div>
          )}

          {!messagesLoading && !isError && messageList.length > 0 && (
            <div className="message-column">
              {messageList.map((message) => (
                <MessageItem key={message.message_id} message={message} />
              ))}
            </div>
          )}

          <form onSubmit={submitMessage} className="mt-8 message-input-shell">
            <label
              htmlFor="message"
              className="text-xs font-bold text-[var(--ink-3)]"
            >
              Message
            </label>
            <textarea
              id="message"
              ref={textAreaRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about a decision, action, risk, or meeting record."
              disabled={sendMessage.isPending}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <p className="text-xs text-[var(--ink-3)]">
                Answers use available project context.
              </p>
              <button
                type="submit"
                disabled={sendMessage.isPending || !draft.trim()}
                className="primary-action"
              >
                {sendMessage.isPending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-8">
          <section className="border-y border-[var(--line)] py-5">
            <h2 className="text-lg font-bold">Useful prompts</h2>
            <div className="mt-4 grid gap-2">
              {[
                "What decisions were made in the latest meeting?",
                "Which actions are still unresolved?",
                "Summarize the risks for the next review.",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="border border-[var(--line)] bg-white px-3 py-3 text-left text-sm font-semibold hover:border-[var(--line-strong)] hover:text-[var(--orange-dark)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          <section className="border-y border-[var(--line)] py-5">
            <h2 className="text-lg font-bold">Conversation details</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-3)]">Chat ID</dt>
                <dd className="font-semibold">{chatId.slice(0, 8)}...</dd>
              </div>
              {chat?.updated_at && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ink-3)]">Updated</dt>
                  <dd className="font-semibold">
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </main>
    </div>
  );
}
