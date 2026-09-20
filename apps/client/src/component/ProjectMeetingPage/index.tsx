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
  const transcriptEvidence =
    meeting?.original_transcript
      ?.split("\n")
      .find((line) => line.trim().length > 80)
      ?.trim()
      .slice(0, 220) || meeting?.original_transcript?.trim().slice(0, 220);

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
          <div className="h-40 animate-pulse rounded-lg border border-[#dfe5dc] bg-white" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-lg border border-[#dfe5dc] bg-white lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-lg border border-[#dfe5dc] bg-white" />
          </div>
        </div>
      )}

      {/* Error state */}
      {meetingError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Meeting record could not be loaded. Please check your connection and
          try again.
        </div>
      )}

      {meeting && (
        <>
          {/* Header Banner */}
          <section className="rounded-lg border border-[#ddd5c9] bg-[#fffdfa] p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-lg bg-[#f4e8de] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#9f3f1e]">
                  {meeting.meeting_platform || "Meeting"}
                </span>
                <span className="ops-status ops-status-success px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#208c55] animate-pulse" />
                  MOM Synthesized
                </span>
                <span className="ops-status ops-status-pending px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#c97a17]" />
                  {actionList.length} Actions
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
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
              <article className="rounded-lg border border-[#ddd5c9] bg-[#fffdfa] p-5 sm:p-8">
                <div className="flex items-center gap-3 pb-6 border-b border-[#e8e0d4]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e9f6ef] text-lg font-bold text-[#208c55]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 9h6M9 13h4M7 3.5h10A2.5 2.5 0 0 1 19.5 6v12A2.5 2.5 0 0 1 17 20.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#20251f]">
                      Minutes of Meeting (MOM)
                    </h2>
                    <p className="text-xs text-[#756d63]">
                      Structured operational artifact with source traceability
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  {description ? (
                    <div className="space-y-4 text-sm leading-relaxed text-[#596257]">
                      <MarkdownContent content={description} />
                      {!!meeting.actions?.length && (
                        <div className="border-t border-[#edf0eb] pt-5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9f3f1e]">
                            Extracted actions
                          </h3>
                          <div className="mt-3 space-y-3">
                            {meeting.actions.map((action) => (
                              <div
                                key={action.id}
                                className="rounded-lg border border-[#e8e0d4] bg-[#fbfaf7] p-3"
                              >
                                <p className="text-sm font-bold text-[#20251f]">
                                  {action.title}
                                </p>
                                {action.description && (
                                  <p className="mt-1 text-xs text-[#667166]">
                                    {action.description}
                                  </p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-[#756d63]">
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
                  <div className="rounded-lg border border-dashed border-[#c9bdae] bg-[#fbfaf7] p-8 text-center">
                      <p className="text-sm text-[#667166]">
                        Summary is being synthesized...
                      </p>
                    </div>
                  )}
                </div>
              </article>

              {/* Transcript Card */}
              <article className="rounded-lg border border-[#ddd5c9] bg-[#fffdfa] p-5 sm:p-8">
                <div className="flex flex-col gap-3 border-b border-[#e8e0d4] pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#20251f]">
                      Original Transcript
                    </h2>
                    <p className="text-xs text-[#756d63]">
                      Unmodified source conversation
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#ddd5c9] bg-white px-4 py-2 text-xs font-bold text-[#9f3f1e] transition hover:border-[#c3562c] hover:bg-[#f8f6f1] active:scale-[0.98]"
                  >
                    {copied ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h10v12H8zM6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6">
                  <div
                    className={`overflow-hidden rounded-lg border border-[#e8e0d4] bg-[#f8f6f1] p-4 font-mono text-xs leading-relaxed text-[#5f584f] transition-all sm:p-6 ${
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
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#9f3f1e] transition hover:text-[#1c1b17]"
                      >
                        <span>{expandedTranscript ? "Collapse" : "Expand"}</span>
                        <svg
                          className={`h-3.5 w-3.5 transition ${expandedTranscript ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    )}
                </div>
              </article>
            </div>

            {/* Right Column: Actions & Stats */}
            <aside className="h-fit space-y-6 lg:sticky lg:top-20">
              {/* Stats Cards */}
              <div className="space-y-3">
                <div className="rounded-lg border border-[#ddd5c9] bg-[#fff5e5] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2f7447]">
                    Pending Actions
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#9a5c10]">
                    {pendingActions.length}
                  </p>
                </div>
                <div className="rounded-lg border border-[#ddd5c9] bg-[#e9f6ef] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
                    Completed
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#1e40af]">
                    {completedActions.length}
                  </p>
                </div>
              </div>

              {/* Actions List */}
              <div className="rounded-lg border border-[#ddd5c9] bg-[#fffdfa] p-5 sm:p-6">
                <div className="flex items-center justify-between pb-6 border-b border-[#e8e0d4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#c97a17]" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a5c10]">
                        Approval queue
                      </p>
                    </div>
                    <h2 className="mt-1 text-lg font-bold text-[#20251f]">
                      External work
                    </h2>
                  </div>
                  <span className="rounded-md bg-[#fff5e5] px-3 py-1 text-xs font-bold text-[#9a5c10] border border-[#c97a17]/20">
                    {actionList.length}
                  </span>
                </div>

                {actionsLoading && (
                  <div className="mt-6 space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-lg bg-[#f7f8f5]"
                      />
                    ))}
                  </div>
                )}

                {actionsError && (
                  <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                    Failed to load action items.
                  </div>
                )}

                {!actionsLoading &&
                  !actionsError &&
                  actionList.length === 0 && (
                    <div className="mt-6 rounded-lg border border-dashed border-[#cbd9c8] bg-[#fafaf8] p-6 text-center">
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
                          className="rounded-lg border border-[#e8e0d4] bg-[#fbfaf7] p-4 transition hover:border-[#ddd5c9] hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9f3f1e]">
                                {action.action_type || "Task"}
                              </span>
                              <h3 className="mt-1 text-xs font-bold text-[#20251f] line-clamp-2">
                                {action.title || "Untitled"}
                              </h3>
                              {action.assignee && (
                                <p className="mt-1 text-[11px] text-[#7a8678]">
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
                                    </svg>
                                    {action.assignee}
                                  </span>
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
                            <div className="mt-3 rounded-md border border-[#e8e0d4] bg-white p-3">
                              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8175]">
                                Evidence
                              </p>
                              <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-[#665f55]">
                                {transcriptEvidence
                                  ? `"${transcriptEvidence}${transcriptEvidence.length >= 220 ? "..." : ""}"`
                                  : "Transcript evidence is available in the source panel."}
                              </p>
                            </div>
                          )}

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
                              className="mt-3 w-full rounded-lg bg-[#1c1b17] px-3 py-2 text-[11px] font-bold text-white shadow-xs transition hover:bg-[#2b2923] disabled:opacity-50 active:scale-[0.98]"
                            >
                              {executeAction.isPending ? "Executing…" : "Approve and execute"}
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
