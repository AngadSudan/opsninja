"use client";

import { useState } from "react";
import Link from "next/link";
import { useProject } from "@/hooks/useProject";
import { useMeeting } from "@/hooks/useMeeting";
import { useActions, useExecuteAction } from "@/hooks/useAction";
import MarkdownContent from "@/component/MarkdownContent";

type ProjectMeetingPageProps = {
  meetingId: string;
  projectId: string;
};

export default function ProjectMeetingPage({
  meetingId,
  projectId,
}: ProjectMeetingPageProps) {
  const { data: project } = useProject(projectId);
  const {
    data: meeting,
    isLoading: meetingLoading,
    isError: meetingError,
  } = useMeeting(projectId, meetingId);
  const {
    data: actions,
    isLoading: actionsLoading,
    isError: actionsError,
  } = useActions(projectId, meetingId);
  const executeAction = useExecuteAction(projectId, meetingId);

  const [copied, setCopied] = useState(false);
  const [expandedTranscript, setExpandedTranscript] = useState(false);

  const handleCopyTranscript = () => {
    if (meeting?.original_transcript) {
      navigator.clipboard.writeText(meeting.original_transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const actionList = actions ?? [];
  const pendingActions = actionList.filter(
    (a) => a.action_status === "pending" || a.action_status === "initialized",
  );
  const completedActions = actionList.filter(
    (a) => a.action_status === "completed" || a.action_status === "success",
  );

  // Ensure we have a description to display
  const description = meeting?.description || "";
  const shortname =
    meeting?.shortname ||
    meeting?.original_transcript?.split("\n")[0] ||
    "Meeting Record";

  return (
    <div className="workspace-page space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#8a9587]">
        <Link
          href={`/project/${projectId}`}
          className="text-[#59745b] transition hover:text-[#20251f]"
        >
          {project?.name || "Project"}
        </Link>
        <span>/</span>
        <Link
          href={`/project/${projectId}/meeting-summary`}
          className="text-[#59745b] transition hover:text-[#20251f]"
        >
          Meeting Records
        </Link>
        <span>/</span>
        <span className="text-[#20251f] font-bold">Details</span>
      </nav>

      {/* Loading state */}
      {meetingLoading && (
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-96 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white" />
            <div className="h-96 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white" />
          </div>
        </div>
      )}

      {/* Error state */}
      {meetingError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Meeting record could not be loaded. Please check your connection and
          try again.
        </div>
      )}

      {meeting && (
        <>
          {/* Header Banner */}
          <section className="rounded-3xl border border-[#dfe5dc] bg-gradient-to-br from-[#fafaf8] to-white p-8 shadow-xs">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-xl bg-[#f0f5ee] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#59745b] shadow-xs">
                  {meeting.meeting_platform || "Meeting"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf6ec] px-4 py-1.5 text-xs font-bold text-[#347146] border border-[#16a34a]/30">
                  <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
                  MOM Synthesized
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2fd] px-4 py-1.5 text-xs font-bold text-[#1e40af] border border-[#3b82f6]/30">
                  <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                  {actionList.length} Actions
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#20251f]">
                  {shortname}
                </h1>
                <p className="mt-2 text-sm text-[#596257]">
                  Recorded on{" "}
                  <strong>
                    {new Date(meeting.created_at).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </strong>
                </p>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Summary & Transcript (2 cols on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Structured MOM Card */}
              <article className="rounded-3xl border border-[#dfe5dc] bg-white p-8 shadow-xs">
                <div className="flex items-center gap-3 pb-6 border-b border-[#edf0eb]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f8ef] text-lg font-bold text-[#2f7447] shadow-xs">
                    📋
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#20251f]">
                      Minutes of Meeting (MOM)
                    </h2>
                    <p className="text-xs text-[#7a8678]">
                      AI-synthesized summary, decisions & context
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  {description ? (
                    <div className="space-y-4 text-sm leading-relaxed text-[#596257]">
                      <MarkdownContent content={description} />
                      {!!meeting.actions?.length && (
                        <div className="border-t border-[#edf0eb] pt-5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#59745b]">
                            Extracted actions
                          </h3>
                          <div className="mt-3 space-y-3">
                            {meeting.actions.map((action) => (
                              <div
                                key={action.id}
                                className="rounded-xl border border-[#edf0eb] bg-[#fafaf8] p-3"
                              >
                                <p className="text-sm font-bold text-[#20251f]">
                                  {action.title}
                                </p>
                                {action.description && (
                                  <p className="mt-1 text-xs text-[#667166]">
                                    {action.description}
                                  </p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-[#7a8678]">
                                  {action.assignee && (
                                    <span>Owner: {action.assignee}</span>
                                  )}
                                  {action.dueDate && (
                                    <span>Due: {action.dueDate}</span>
                                  )}
                                  {action.priority && (
                                    <span>{action.priority}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#cbd9c8] bg-[#fafaf8] p-8 text-center">
                      <p className="text-sm text-[#667166]">
                        Summary is being synthesized...
                      </p>
                    </div>
                  )}
                </div>
              </article>

              {/* Transcript Card */}
              <article className="rounded-3xl border border-[#dfe5dc] bg-white p-8 shadow-xs">
                <div className="flex items-center justify-between pb-6 border-b border-[#edf0eb]">
                  <div>
                    <h2 className="text-xl font-bold text-[#20251f]">
                      Original Transcript
                    </h2>
                    <p className="text-xs text-[#7a8678]">
                      Unmodified source conversation
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="rounded-xl border border-[#dfe5dc] bg-white px-4 py-2 text-xs font-bold text-[#59745b] shadow-xs transition hover:border-[#59745b] hover:bg-[#f0f5ee] active:scale-[0.98]"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>

                <div className="mt-6">
                  <div
                    className={`rounded-2xl bg-[#fafaf8] p-6 font-mono text-xs leading-relaxed text-[#596257] border border-[#edf0eb] overflow-hidden transition-all ${
                      expandedTranscript ? "" : "max-h-64"
                    }`}
                  >
                    {meeting.original_transcript || "No transcript content."}
                  </div>
                  {meeting.original_transcript &&
                    meeting.original_transcript.length > 500 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTranscript(!expandedTranscript)
                        }
                        className="mt-4 text-xs font-bold text-[#59745b] transition hover:text-[#20251f]"
                      >
                        {expandedTranscript ? "← Collapse" : "Expand →"}
                      </button>
                    )}
                </div>
              </article>
            </div>

            {/* Right Column: Actions & Stats */}
            <aside className="h-fit space-y-6 lg:sticky lg:top-20">
              {/* Stats Cards */}
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#dfe5dc] bg-gradient-to-br from-[#eaf6ec] to-[#f0f8ef] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2f7447]">
                    Pending Actions
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#347146]">
                    {pendingActions.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#dfe5dc] bg-gradient-to-br from-[#eef2fd] to-[#f3f4f6] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
                    Completed
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#1e40af]">
                    {completedActions.length}
                  </p>
                </div>
              </div>

              {/* Actions List */}
              <div className="rounded-3xl border border-[#dfe5dc] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between pb-6 border-b border-[#edf0eb]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#c2491d]" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#c2491d]">
                        Actions
                      </p>
                    </div>
                    <h2 className="mt-1 text-lg font-bold text-[#20251f]">
                      Items
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#fff1e9] px-3 py-1 text-xs font-bold text-[#b5522c] border border-[#c2491d]/20">
                    {actionList.length}
                  </span>
                </div>

                {actionsLoading && (
                  <div className="mt-6 space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-2xl bg-[#f7f8f5]"
                      />
                    ))}
                  </div>
                )}

                {actionsError && (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                    Failed to load action items.
                  </div>
                )}

                {!actionsLoading &&
                  !actionsError &&
                  actionList.length === 0 && (
                    <div className="mt-6 rounded-2xl border border-dashed border-[#cbd9c8] bg-[#fafaf8] p-6 text-center">
                      <p className="text-xs text-[#667166]">
                        No actions identified.
                      </p>
                    </div>
                  )}

                {!actionsLoading && !actionsError && actionList.length > 0 && (
                  <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
                    {actionList.map((action) => {
                      const isPending =
                        action.action_status === "pending" ||
                        action.action_status === "initialized";
                      const isSuccess =
                        action.action_status === "completed" ||
                        action.action_status === "success";

                      return (
                        <div
                          key={action.action_id}
                          className="rounded-2xl border border-[#edf0eb] bg-[#fafaf8] p-4 shadow-xs transition hover:border-[#dfe5dc] hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#59745b]">
                                {action.action_type || "Task"}
                              </span>
                              <h3 className="mt-1 text-xs font-bold text-[#20251f] line-clamp-2">
                                {action.title || "Untitled"}
                              </h3>
                              {action.assignee && (
                                <p className="mt-1 text-[11px] text-[#7a8678]">
                                  👤 {action.assignee}
                                </p>
                              )}
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${
                                isSuccess
                                  ? "bg-[#eaf6ec] text-[#347146]"
                                  : isPending
                                    ? "bg-[#fff8ea] text-[#b45309]"
                                    : "bg-[#fff1f1] text-[#b91c1c]"
                              }`}
                            >
                              {action.action_status}
                            </span>
                          </div>

                          {isPending && (
                            <button
                              type="button"
                              disabled={executeAction.isPending}
                              onClick={() =>
                                executeAction.mutate({
                                  actionId: action.action_id,
                                  proposal: action,
                                  credentials: {},
                                })
                              }
                              className="mt-3 w-full rounded-lg bg-[#20251f] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-[#323c31] disabled:opacity-50 active:scale-[0.98]"
                            >
                              {executeAction.isPending ? "Running…" : "Execute"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
