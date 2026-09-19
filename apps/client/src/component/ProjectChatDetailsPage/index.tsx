"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProject } from "@/hooks/useProject";
import { useChat } from "@/hooks/useChat";
import { useMessages, useSendMessage } from "@/hooks/useMessage";

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
          <span className="text-[#20251f] font-bold">{chat?.chat_name || "Conversation"}</span>
        </nav>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#20251f] sm:text-3xl">
              {chat?.chat_name || "Chat Thread"}
            </h1>
            <p className="mt-1 text-xs text-[#596257]">
              Grounding questions in Project {project?.name || "workspace"} records & MOM vault
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dce6da] bg-[#f1f7ef] px-3.5 py-1.5 text-xs font-bold text-[#426347]">
            <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
            Vault aware
          </span>
        </div>
      </div>

      {/* Chat messages viewport */}
      <div className="flex flex-1 flex-col overflow-hidden border border-[#dfe5dc] bg-white shadow-none">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#59745b]">
                Loading conversation…
              </span>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              Failed to load conversation history. Check your connection and try again.
            </div>
          )}

          {!isLoading && messages?.length === 0 && (
            <div className="mx-auto my-auto max-w-lg text-center py-16 px-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ff] text-2xl text-[#3564a8] shadow-xs">
                ✦
              </div>
              <h2 className="mt-5 text-lg font-bold text-[#20251f]">
                What would you like to explore?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#596257]">
                Ops Ninja has this project&apos;s meeting minutes, action items, and connected integrations in active memory.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                {suggestions.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleSuggestionClick(text)}
                    className="rounded-2xl border border-[#dfe5dc] bg-[#fafaf8] p-3.5 text-left text-xs font-medium text-[#596257] transition hover:border-[#59745b] hover:bg-white hover:text-[#20251f] shadow-2xs"
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#edf3ff] text-xs font-bold text-[#3564a8] shadow-2xs">
                    ✦
                  </span>
                )}

                <div className={`max-w-[78%] ${isUser ? "text-right" : "text-left"}`}>
                  <div className="mb-1.5 text-[11px] font-bold text-[#8a9587]">
                    {isUser ? "You" : "Ops Ninja"}
                  </div>
                  <div
                    className={`inline-block rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#20251f] text-white shadow-xs rounded-tr-xs"
                        : "border border-[#dfe5dc] bg-[#f9faf8] text-[#20251f] shadow-xs rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  {msg.proposed_actions && (
                    <div className="mt-3 rounded-2xl border border-[#dce6da] bg-[#f1f7ef] p-4 text-left text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#426347]">
                        <span>✓</span>
                        <span>Action proposal generated</span>
                      </div>
                      <p className="mt-1.5 text-[#596257] leading-relaxed">{msg.proposed_actions}</p>
                    </div>
                  )}
                </div>

                {isUser && (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#20251f] text-xs font-bold text-white shadow-2xs">
                    U
                  </span>
                )}
              </div>
            );
          })}

          {sendMessage.isPending && (
            <div className="flex gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#edf3ff] text-xs font-bold text-[#3564a8] shadow-2xs">
                ✦
              </span>
              <div className="rounded-2xl border border-[#dfe5dc] bg-[#f9faf8] px-5 py-3.5 text-xs text-[#7a8678] shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#59745b]" />
                  <span>Thinking and retrieving context…</span>
                </div>
              </div>
            </div>
          )}

          {sendMessage.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              Failed to send message. Please try again.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={submit}
          className="flex items-center gap-3 border-t border-[#dfe5dc] bg-[#fafaf8] p-4 sm:p-5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sendMessage.isPending}
            placeholder="Ask about meeting records, commitments, or next steps..."
            className="flex-1 rounded-2xl border border-[#dfe5dc] bg-white px-5 py-3.5 text-sm text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="inline-flex items-center justify-center rounded-2xl bg-[#20251f] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#343e33] disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
