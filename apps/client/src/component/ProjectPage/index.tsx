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
      <section className="flex flex-col gap-4 border-b border-[#ddd5c9] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c3562c]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9f3f1e]">
              Project workspaces
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#20251f] sm:text-3xl">
            Projects & Vaults
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#665f55]">
            Scan project state, open the latest operational record, and move from meeting evidence to reviewed execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1c1b17] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2b2923] active:scale-[0.98]"
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
            className="w-full rounded-lg border border-[#ddd5c9] bg-white px-4 py-3 text-sm text-[#1c1b17] placeholder:text-[#8a8175] transition focus:border-[#c3562c] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c3562c]/10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-xs font-semibold text-[#8a9587] hover:text-[#20251f]"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <span className="rounded-md border border-[#208c55]/20 bg-[#e9f6ef] px-3.5 py-1.5 text-xs font-bold text-[#1e7048]">
          {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} indexed
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="overflow-hidden border border-[#dfe5dc] bg-white">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse bg-white p-6" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Projects could not be loaded. Please check your connection and try again.
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !isError && filteredProjects.length === 0 && (
        <div className="rounded-lg border border-dashed border-[#cbd9c8] bg-white p-10 text-center sm:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#f4f8f2] text-2xl text-[#59745b]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.1l2 2H18.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
            </svg>
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
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#20251f] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#323c31]"
            >
              + Create your first project
            </button>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !isError && filteredProjects.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[#ddd5c9] bg-[#fffdfa]">
          {filteredProjects.map((project) => (
            <div
              key={project.project_id}
              className="group relative flex flex-col justify-between gap-4 border-b border-[#e8e0d4] p-4 transition last:border-b-0 hover:bg-[#fbfaf7] md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f4e8de] text-sm font-bold text-[#9f3f1e]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.1l2 2H18.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
                    </svg>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs text-[#8a8175]">
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
                    className="mt-3 block"
                >
                  <h2 className="text-lg font-bold text-[#1c1b17] transition group-hover:text-[#9f3f1e]">
                    {project.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#665f55]">
                    {project.description || "No description provided."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="ops-status ops-status-success">Vault indexed</span>
                    <span className="ops-status ops-status-pending">Approvals tracked</span>
                    <span className="ops-status ops-status-muted">Jira / Slack ready</span>
                  </div>
                </Link>
              </div>

              {/* Subpage links footer */}
              <div className="flex shrink-0 items-center justify-between gap-4 md:min-w-64">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/project/${project.project_id}/meeting-summary`}
                    className="rounded-md border border-[#ddd5c9] bg-[#f8f6f1] px-2.5 py-1 text-[11px] font-semibold text-[#665f55] transition hover:bg-white hover:text-[#1c1b17]"
                  >
                    Meetings
                  </Link>
                  <Link
                    href={`/project/${project.project_id}/chat`}
                    className="rounded-md border border-[#ddd5c9] bg-[#f8f6f1] px-2.5 py-1 text-[11px] font-semibold text-[#9f3f1e] transition hover:bg-white hover:text-[#1c1b17]"
                  >
                    Chat
                  </Link>
                </div>

                <Link
                  href={`/project/${project.project_id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#9f3f1e] transition group-hover:translate-x-0.5"
                >
                  Open
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
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
