"use client";

import axios from "axios";
import { FormEvent, useState } from "react";
import { useUploadTranscript } from "@/hooks/useMeeting";

export default function UploadMeetingModal({
  projectId,
  isOpen,
  onClose,
}: {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const upload = useUploadTranscript(projectId);
  const [platform, setPlatform] = useState("Google Meet");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    try {
      await upload.mutateAsync({
        meeting_platform: platform,
        original_transcript: transcript.trim(),
      });
      setTranscript("");
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setErrorMessage(message || "Unable to process transcript. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101510]/55 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#dfe5dc] bg-white p-6 shadow-2xl shadow-[#20251f]/15 animate-in zoom-in-95 duration-200 sm:p-8"
        onSubmit={submit}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f5ee] text-[#59745b] shadow-xs">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#20251f]">
                Upload Meeting Transcript
              </h2>
              <p className="text-xs text-[#596257]">
                Ops Ninja will autonomously synthesize decisions, action items, and structured MOM.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-xs text-[#8a9587] transition hover:bg-[#f0f3ee] hover:text-[#20251f]"
            aria-label="Close modal"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input: Meeting Platform */}
        <div className="mt-7">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-[#59745b]"
            htmlFor="meeting-platform"
          >
            Meeting Platform
          </label>
          <select
            className="mt-2 w-full cursor-pointer rounded-lg border border-[#dfe5dc] bg-[#fafaf8] px-4 py-3 text-sm text-[#20251f] transition focus:border-[#59745b] focus:bg-white focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none"
            id="meeting-platform"
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
          >
            <option value="Google Meet">Google Meet</option>
            <option value="Zoom">Zoom</option>
            <option value="Microsoft Teams">Microsoft Teams</option>
            <option value="Slack Huddle">Slack Huddle</option>
            <option value="In-person / Other">In-person / Other</option>
          </select>
        </div>

        {/* Input: Transcript Body */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label
              className="block text-xs font-bold uppercase tracking-wider text-[#59745b]"
              htmlFor="meeting-transcript"
            >
              Raw Transcript <span className="text-[#c2491d]">*</span>
            </label>
            <span className="text-[11px] text-[#8a9587]">
              Supports speaker tags & timestamps
            </span>
          </div>
          <textarea
            className="mt-2 min-h-48 w-full rounded-lg border border-[#dfe5dc] bg-[#fafaf8] p-4 text-xs font-mono leading-relaxed text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:bg-white focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none"
            id="meeting-transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder={`Example:
[00:02:15] Alex Rivera: We agreed to finalize the Cognito OAuth flow before Friday.
[00:03:40] Elena Rostova: Let's make sure we log an issue in Jira under PROJ-Orca.`}
            required
            rows={7}
          />
        </div>

        {(upload.isError || errorMessage) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {errorMessage || "Unable to process transcript. Please try again."}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#f0f3ee] pt-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            className="secondary-action"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="primary-action"
            type="submit"
            disabled={upload.isPending}
          >
            {upload.isPending ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing & Indexing…</span>
              </>
            ) : (
              <span>Synthesize & Save MOM</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
