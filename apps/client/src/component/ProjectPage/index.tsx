"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, useDeleteProject } from "@/hooks/useProject";
import CreateProjectModal from "@/component/CreateProjectModal";
import ConfirmDialog from "@/component/ConfirmDialog";

export default function ProjectPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const deleteProject = useDeleteProject();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDeleteProject = async () => {
    if (projectToDelete) {
      await deleteProject.mutateAsync(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const filteredProjects = (projects ?? []).filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="workspace-page space-y-6">
      {/* Header section */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#dfe5dc] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#59745b]">
              Shared Context
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Projects & Vaults
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#596257]">
            Every project maintains a durable, searchable vault of meeting transcripts, decisions, and human-approved follow-through.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#20251f]/15 transition hover:bg-[#323c31] active:scale-[0.98]"
          >
            <span className="text-base leading-none">+</span>
            <span>New project</span>
          </button>
        </div>
      </section>

      {/* Search & Stats Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or description..."
            className="w-full rounded-2xl border border-[#dfe5dc] bg-[#fafaf8] px-4 py-3 text-sm text-[#20251f] placeholder:text-[#8a9587] transition focus:border-[#59745b] focus:bg-white focus:ring-4 focus:ring-[#59745b]/10 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-xs font-semibold text-[#8a9587] hover:text-[#20251f]"
            >
              ✕
            </button>
          )}
        </div>

        <span className="rounded-full bg-[#f1f7ef] px-3.5 py-1.5 text-xs font-bold text-[#426347] border border-[#16a34a]/20">
          {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} indexed
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="overflow-hidden border border-[#dfe5dc] bg-white">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-3xl border border-[#dfe5dc] bg-white p-8"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Projects could not be loaded. Please check your connection and try again.
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !isError && filteredProjects.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#cbd9c8] bg-white p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f8f2] text-2xl text-[#59745b] shadow-xs">
            ▦
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#20251f]">
            {searchQuery ? "No matching projects" : "No projects yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#596257]">
            {searchQuery
              ? `No projects matched "${searchQuery}". Try a different keyword or clear the search.`
              : "Create your first project to start organizing meeting transcripts and generating actionable operational records."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#20251f] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31]"
            >
              + Create your first project
            </button>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !isError && filteredProjects.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.project_id}
              className="group relative flex flex-col justify-between border-b border-[#edf0eb] p-4 transition last:border-b-0 hover:bg-[#f8faf7] sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eaf2e8] text-sm font-bold text-[#59745b] shadow-xs">
                    ▰
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8a9587]">
                      {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProjectToDelete(project.project_id);
                      }}
                      className="rounded-lg p-1.5 text-[#a0a99f] opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      title="Delete project"
                      aria-label={`Delete project ${project.name}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <Link
                  href={`/project/${project.project_id}`}
                  className="mt-3 block sm:mt-0"
                >
                  <h2 className="text-lg font-bold text-[#20251f] transition group-hover:text-[#59745b]">
                    {project.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#596257]">
                    {project.description || "No description provided."}
                  </p>
                </Link>
              </div>

              {/* Subpage links footer */}
              <div className="mt-4 flex items-center justify-between sm:ml-8 sm:mt-0 sm:min-w-64">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/project/${project.project_id}/meeting-summary`}
                    className="rounded-lg bg-[#fafaf8] border border-[#dfe5dc] px-2.5 py-1 text-[11px] font-semibold text-[#596257] transition hover:bg-[#f0f5ee] hover:text-[#20251f]"
                  >
                    Meetings
                  </Link>
                  <Link
                    href={`/project/${project.project_id}/chat`}
                    className="rounded-lg bg-[#fafaf8] border border-[#dfe5dc] px-2.5 py-1 text-[11px] font-semibold text-[#59745b] transition hover:bg-[#f0f5ee] hover:text-[#20251f]"
                  >
                    Chat
                  </Link>
                </div>

                <Link
                  href={`/project/${project.project_id}`}
                  className="text-xs font-bold text-[#59745b] transition group-hover:translate-x-0.5"
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete Project?"
        message="This action will permanently delete the project and all its associated meeting transcripts, decisions, and chat records. This cannot be undone."
        confirmText="Delete Project"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
