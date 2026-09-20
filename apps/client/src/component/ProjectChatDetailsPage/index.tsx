"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProject } from "@/hooks/useProject";
import { useChat } from "@/hooks/useChat";
import { useMessages, useSendMessage } from "@/hooks/useMessage";
import MarkdownContent from "@/component/MarkdownContent";

type ProjectChatDetailsPageProps = {
  chatId: string;
  projectId: string;
};

export default function ProjectChatDetailsPage({
  chatId,
  projectId,
}: ProjectChatDetailsPageProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: project } = useProject(projectId);
  const { data: chat } = useChat(projectId, chatId);
  const { data: messages, isLoading, isError } = useMessages(projectId, chatId);
  const sendMessage = useSendMessage(projectId, chatId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sendMessage.isPending) return;
    sendMessage.mutate(text);
    setInput("");
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (sendMessage.isPending) return;
    sendMessage.mutate(suggestion);
  };

  const suggestions = [
    "What key decisions were captured in the latest meeting?",
    "Which action items are currently pending?",
    "Summarize the technical dependencies for this project.",
  ];
  const provenanceSignals = [
    "Meeting records",
    "Extracted decisions",
    "Action proposals",
    "Project knowledge",
  ];

  return (
    <div className="workspace-page flex h-[calc(100vh-56px)] max-w-none flex-col py-5">
      {/* Breadcrumb & Header */}
      <div className="mb-6 shrink-0">
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#8a9587]">
          <Link
            href={`/project/${projectId}`}
            className="text-[#59745b] transition hover:text-[#20251f]"
          >
            {project?.name || "Project"}
          </Link>
          <span>/</span>
          <Link
            href={`/project/${projectId}/chat`}
            className="text-[#59745b] transition hover:text-[#20251f]"
          >
            Chat Threads
          </Link>
          <span>/</span>
          <span className="text-[#20251f] font-bold">
            {chat?.chat_name || "Conversation"}
          </span>
        </nav>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-b border-[#dfe5dc] pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#20251f] sm:text-3xl">
              {chat?.chat_name || "Chat Thread"}
            </h1>
            <p className="mt-1 text-xs text-[#596257]">
              Grounding questions in Project {project?.name || "workspace"}{" "}
              records & MOM vault
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dce6da] bg-[#f1f7ef] px-3.5 py-1.5 text-xs font-bold text-[#426347]">
            <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
            Vault aware
          </span>
        </div>
      </div>

      {/* Chat messages viewport */}
      <div className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-[#ddd5c9] bg-[#fffdfa] shadow-none xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
          {isLoading && (
            <div className="flex justify-center py-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#59745b]">
                Loading conversation…
              </span>
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              Failed to load conversation history. Check your connection and try
              again.
            </div>
          )}

          {!isLoading && messages?.length === 0 && (
            <div className="mx-auto my-auto max-w-lg text-center py-16 px-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#edf3ff] text-2xl text-[#3564a8]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 13.9 9l5.35 1.9-5.35 1.9L12 18.25l-1.9-5.45-5.35-1.9L10.1 9 12 3.75Z" />
                </svg>
              </div>
              <h2 className="mt-5 text-lg font-bold text-[#20251f]">
                What would you like to explore?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#596257]">
                Ops Ninja has this project&apos;s meeting minutes, action items,
                and connected integrations in active memory.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                {suggestions.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleSuggestionClick(text)}
                    className="rounded-lg border border-[#dfe5dc] bg-[#fafaf8] p-3.5 text-left text-xs font-medium text-[#596257] transition hover:border-[#59745b] hover:bg-white hover:text-[#20251f]"
                  >
                    “{text}”
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages?.map((msg) => {
            const isUser = msg.message_type === "USER";
            return (
              <div
                key={msg.message_id}
                className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3ff] text-xs font-bold text-[#3564a8] shadow-2xs">
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 13.9 9l5.35 1.9-5.35 1.9L12 18.25l-1.9-5.45-5.35-1.9L10.1 9 12 3.75Z" />
                    </svg>
                  </span>
                )}

                <div
                  className={`max-w-[min(88%,46rem)] sm:max-w-[min(78%,46rem)] ${isUser ? "text-right" : "text-left"}`}
                >
                  <div className="mb-1.5 text-[11px] font-bold text-[#8a9587]">
                    {isUser ? "You" : "Ops Ninja"}
                  </div>
                  <div
                    className={`inline-block rounded-lg px-5 py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#20251f] text-white shadow-xs rounded-tr-xs"
                        : "border border-[#dfe5dc] bg-[#f9faf8] text-[#20251f] shadow-xs rounded-tl-xs"
                    }`}
                  >
                      <MarkdownContent
                        content={msg.message}
                        tone={isUser ? "inverse" : "default"}
                      />
                  </div>
                  {!isUser && (
                    <div className="mt-3 grid gap-2 rounded-lg border border-[#ddd5c9] bg-[#fffdfa] p-3 text-left text-[11px] text-[#665f55] sm:grid-cols-2">
                      <span className="font-bold uppercase tracking-[0.12em] text-[#9f3f1e]">
                        Provenance
                      </span>
                      <span className="text-right text-[#8a8175] sm:text-right">
                        Project graph
                      </span>
                      {provenanceSignals.slice(0, 3).map((signal) => (
                        <span key={signal} className="rounded-md border border-[#eee6db] bg-[#f8f6f1] px-2 py-1">
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.proposed_actions && (
                    <div className="mt-3 rounded-lg border border-[#dce6da] bg-[#f1f7ef] p-4 text-left text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#426347]">
                        <span>✓</span>
                        <span>Action proposal generated</span>
                      </div>
                      <MarkdownContent
                        content={msg.proposed_actions}
                        className="mt-1.5 text-[#596257]"
                      />
                    </div>
                  )}
                </div>

                {isUser && (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#20251f] text-xs font-bold text-white shadow-2xs">
                    U
                  </span>
                )}
              </div>
            );
          })}

          {sendMessage.isPending && (
            <div className="flex gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3ff] text-xs font-bold text-[#3564a8] shadow-2xs">
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 13.9 9l5.35 1.9-5.35 1.9L12 18.25l-1.9-5.45-5.35-1.9L10.1 9 12 3.75Z" />
                </svg>
              </span>
              <div className="rounded-lg border border-[#dfe5dc] bg-[#f9faf8] px-5 py-3.5 text-xs text-[#7a8678]">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#59745b]" />
                  <span>Thinking and retrieving context…</span>
                </div>
              </div>
            </div>
          )}

          {sendMessage.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              Failed to send message. Please try again.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={submit}
          className="flex flex-col gap-3 border-t border-[#ddd5c9] bg-[#f8f6f1] p-4 sm:flex-row sm:items-center sm:p-5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sendMessage.isPending}
            placeholder="Ask about meeting records, commitments, or next steps..."
            className="min-w-0 flex-1 rounded-lg border border-[#ddd5c9] bg-white px-5 py-3.5 text-sm text-[#1c1b17] placeholder:text-[#8a8175] transition focus:border-[#c3562c] focus:outline-none focus:ring-4 focus:ring-[#c3562c]/10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#1c1b17] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#2b2923] disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 sm:w-auto"
          >
            Send
          </button>
        </form>
        </div>

        <aside className="hidden min-h-0 border-l border-[#ddd5c9] bg-[#fbfaf7] xl:flex xl:flex-col">
          <div className="border-b border-[#e8e0d4] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9f3f1e]">
              Context packet
            </p>
            <h2 className="mt-1 text-sm font-bold text-[#1c1b17]">
              Why this answer exists
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#665f55]">
              Ops Ninja should answer from durable project evidence, not from a generic model memory.
            </p>
          </div>
          <div className="grid gap-3 p-4">
            {provenanceSignals.map((signal, index) => (
              <div key={signal} className="rounded-lg border border-[#ddd5c9] bg-white p-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#1c1b17]">{signal}</strong>
                  <span className={index === 0 ? "ops-status ops-status-success" : "ops-status ops-status-muted"}>
                    {index === 0 ? "Live" : "Indexed"}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[#706a60]">
                  {index === 0
                    ? "Transcript evidence and meeting summaries supply the factual basis."
                    : index === 1
                      ? "Approved decisions stay connected to the originating meeting."
                      : index === 2
                        ? "External work remains staged until a human approves it."
                        : "Project memory keeps prior context available across threads."}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
