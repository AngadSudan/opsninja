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

  const filteredProjects = (projects ?? []).filter((project) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="workspace-page">
      <section className="flex flex-col gap-6 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-3)]">Projects</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight">Project workspaces</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-2)]">
            Open the operational record for each client, product, or initiative.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="primary-action"
        >
          New project
        </button>
      </section>

      <div className="flex flex-col gap-4 border-b border-[var(--line)] py-5 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search projects"
          className="min-h-11 w-full max-w-md rounded-[5px] border border-[var(--line)] bg-white px-4 text-sm outline-none transition focus:border-[var(--orange)]"
        />
        <p className="text-sm font-semibold text-[var(--ink-3)]">
          {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {isLoading && (
        <div className="divide-y divide-[var(--line)]">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse bg-white/60" />
          ))}
        </div>
      )}

      {isError && (
        <div className="border-b border-[var(--line)] py-8 text-sm text-[var(--red)]">
          Projects could not be loaded. Please check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && filteredProjects.length === 0 && (
        <div className="border-b border-[var(--line)] py-14">
          <h2 className="text-2xl font-bold">
            {searchQuery ? "No matching projects" : "No projects yet"}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-2)]">
            {searchQuery
              ? `No projects matched "${searchQuery}".`
              : "Create your first project to start organizing meeting transcripts and operational records."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="primary-action mt-6"
            >
              Create first project
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && filteredProjects.length > 0 && (
        <div className="divide-y divide-[var(--line)]">
          {filteredProjects.map((project) => (
            <article
              key={project.project_id}
              className="group grid gap-5 py-6 md:grid-cols-[minmax(0,1fr)_18rem]"
            >
              <Link href={`/project/${project.project_id}`} className="min-w-0">
                <p className="text-sm text-[var(--ink-3)]">
                  Updated {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight group-hover:text-[var(--orange-dark)]">
                  {project.name}
                </h2>
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[var(--ink-2)]">
                  {project.description || "No description provided."}
                </p>
              </Link>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Link
                  href={`/project/${project.project_id}/meeting-summary`}
                  className="secondary-action min-h-10 px-3 py-2 text-xs"
                >
                  Meetings
                </Link>
                <Link
                  href={`/project/${project.project_id}/chat`}
                  className="secondary-action min-h-10 px-3 py-2 text-xs"
                >
                  Chat
                </Link>
                <button
                  type="button"
                  onClick={() => setProjectToDelete(project.project_id)}
                  className="min-h-10 rounded-[5px] px-3 py-2 text-xs font-bold text-[var(--red)] hover:bg-white"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete project?"
        message="This will permanently delete the project and all associated meeting transcripts, decisions, and chat records."
        confirmText="Delete project"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
