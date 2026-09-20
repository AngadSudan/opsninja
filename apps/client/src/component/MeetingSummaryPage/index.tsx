"use client";

import { useState } from "react";
import Link from "next/link";
import { useProject } from "@/hooks/useProject";
import { useMeetings } from "@/hooks/useMeeting";
import UploadMeetingModal from "@/component/UploadMeetingModal";

type MeetingSummaryPageProps = {
  projectId: string;
};

export default function MeetingSummaryPage({
  projectId,
}: MeetingSummaryPageProps) {
  const { data: project } = useProject(projectId);
  const { data: meetings, isLoading, isError } = useMeetings(projectId);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const meetingList = meetings ?? [];

  return (
    <div className="workspace-page space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#8a9587]">
        <Link
          href={`/project/${projectId}`}
          className="flex items-center gap-1.5 text-[#59745b] transition hover:text-[#20251f]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6-6 6 6 6" />
          </svg>
          <span>{project?.name || "Project"}</span>
        </Link>
        <span>/</span>
        <span className="text-[#20251f] font-bold">Meeting Records</span>
      </nav>

      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-[#ddd5c9] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#208c55]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9f3f1e]">
              Meeting Intelligence
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Meeting Records & Syntheses
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#665f55]">
            Structured records give everyone the same starting point for
            decisions, dependencies, and next steps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1c1b17] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2b2923] active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-5 5m5-5 5 5M5 20h14" />
          </svg>
          <span>Upload transcript</span>
        </button>
      </section>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-[#dfe5dc] bg-white p-8"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load meetings. Please check your connection and try again.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && meetingList.length === 0 && (
        <div className="rounded-lg border border-dashed border-[#cbd9c8] bg-white p-10 text-center sm:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#f0f8ef] text-2xl text-[#2f7447]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15.5 9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-bold text-[#20251f]">
            No meeting records yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#596257]">
            Upload a meeting transcript to extract structured intelligence,
            decisions, and action items.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#20251f] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31]"
          >
            + Upload first transcript
          </button>
        </div>
      )}

      {/* Meetings List */}
      {!isLoading && !isError && meetingList.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[#ddd5c9] bg-[#fffdfa]">
          {meetingList.map((meeting) => (
            <Link
              key={meeting.meeting_id}
              href={`/project/${projectId}/meeting/${meeting.meeting_id}`}
              className="group block border-b border-[#e8e0d4] p-4 transition last:border-b-0 hover:bg-[#fbfaf7]"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded-lg bg-[#f4e8de] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9f3f1e]">
                      {meeting.meeting_platform || "Meeting"}
                    </span>
                    <span className="text-[#8a9587]">·</span>
                    <span className="text-[#756d63]">
                      {new Date(meeting.created_at).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-[#1c1b17] transition group-hover:text-[#9f3f1e]">
                    {meeting.shortname || "Meeting Record"}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#665f55]">
                    {meeting.description ??
                      "Transcript uploaded and processed."}
                  </p>
                  <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3">
                    <span className="rounded-md border border-[#e8e0d4] bg-[#fbfaf7] px-2.5 py-1 font-semibold text-[#665f55]">
                      Decisions captured
                    </span>
                    <span className="rounded-md border border-[#e8e0d4] bg-[#fbfaf7] px-2.5 py-1 font-semibold text-[#665f55]">
                      Actions extracted
                    </span>
                    <span className="rounded-md border border-[#e0b46f]/45 bg-[#fff5e5] px-2.5 py-1 font-bold text-[#9a5c10]">
                      Reviewable evidence
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="ops-status ops-status-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#208c55] animate-pulse" />
                    MOM ready
                  </span>
                  <span className="text-base text-[#8a9587] transition group-hover:translate-x-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <UploadMeetingModal
        projectId={projectId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
