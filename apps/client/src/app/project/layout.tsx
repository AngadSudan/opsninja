import WorkspaceLayout from "@/component/WorkspaceLayout";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
