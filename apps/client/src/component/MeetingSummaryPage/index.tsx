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
          <span>←</span>
          <span>{project?.name || "Project"}</span>
        </Link>
        <span>/</span>
        <span className="text-[#20251f] font-bold">Meeting Records</span>
      </nav>

      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#dfe5dc] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#59745b]">
              Meeting Intelligence
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Meeting Records & Syntheses
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#596257]">
            Structured records give everyone the same starting point for
            decisions, dependencies, and next steps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#323c31] active:scale-[0.98]"
        >
          <span className="text-base leading-none">↑</span>
          <span>Upload transcript</span>
        </button>
      </section>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white p-8"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load meetings. Please check your connection and try again.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && meetingList.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#cbd9c8] bg-white p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f8ef] text-2xl text-[#2f7447] shadow-xs">
            ✓
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31]"
          >
            + Upload first transcript
          </button>
        </div>
      )}

      {/* Meetings List */}
      {!isLoading && !isError && meetingList.length > 0 && (
        <div className="divide-y divide-[#edf0eb] border border-[#dfe5dc] bg-white">
          {meetingList.map((meeting) => (
            <Link
              key={meeting.meeting_id}
              href={`/project/${projectId}/meeting/${meeting.meeting_id}`}
              className="group block p-4 transition hover:bg-[#f8faf7]"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded-lg bg-[#f0f5ee] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#59745b]">
                      {meeting.meeting_platform || "Meeting"}
                    </span>
                    <span className="text-[#8a9587]">·</span>
                    <span className="text-[#7a8678]">
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

                  <h2 className="mt-4 text-lg font-bold text-[#20251f] transition group-hover:text-[#59745b]">
                    {meeting.shortname || "Meeting Record"}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#596257]">
                    {meeting.description ??
                      "Transcript uploaded and processed."}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf6ec] px-3.5 py-1 text-xs font-bold text-[#347146] border border-[#16a34a]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                    MOM ready
                  </span>
                  <span className="text-base text-[#8a9587] transition group-hover:translate-x-1">
                    →
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
