"use client";

import { FormEvent, useState } from "react";
import { useCreateProject } from "@/hooks/useProject";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateProjectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createProject = useCreateProject();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    await createProject.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      created_by: user.user_id,
    });
    setName("");
    setDescription("");
    onClose();
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
        className="w-full max-w-lg rounded-lg border border-[#dfe5dc] bg-white p-6 shadow-2xl shadow-[#20251f]/15 animate-in zoom-in-95 duration-200 sm:p-8"
        onSubmit={submit}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f5ee] text-[#59745b] shadow-xs">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#20251f]">
                Create Project
              </h2>
              <p className="text-xs text-[#596257]">
                Establish a durable home for meetings and action items.
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

        {/* Input: Project Name */}
        <div className="mt-7">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-[#59745b]"
            htmlFor="project-name"
          >
            Project Name <span className="text-[#c2491d]">*</span>
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-[#dfe5dc] bg-[#fafaf8] px-4 py-3 text-sm text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:bg-white focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none"
            id="project-name"
            placeholder="E.g., Core Architecture, Q4 Launch, Client Sync..."
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Input: Project Description */}
        <div className="mt-5">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-[#59745b]"
            htmlFor="project-description"
          >
            Description <span className="text-[10px] font-normal text-[#8a9587]">(Optional)</span>
          </label>
          <textarea
            className="mt-2 min-h-24 w-full rounded-lg border border-[#dfe5dc] bg-[#fafaf8] px-4 py-3 text-sm leading-relaxed text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:bg-white focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none"
            id="project-description"
            placeholder="Outline the core purpose, key stakeholders, and goals of this project..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
        </div>

        {createProject.isError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            Unable to create the project. Please check your inputs and try again.
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
            disabled={createProject.isPending}
          >
            {createProject.isPending ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating…</span>
              </>
            ) : (
              <span>Create Project</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
