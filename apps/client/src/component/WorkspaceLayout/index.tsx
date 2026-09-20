"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/component/UserMenu";
import BrandLogo from "@/component/BrandLogo";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

const primaryNav = [
  { href: "/home", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/integrations", label: "Integrations" },
];

function getProjectId(pathname: string) {
  const match = pathname.match(/^\/project\/([^/]+)/);
  return match?.[1];
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const projectId = getProjectId(pathname);

  const projectNav = projectId
    ? [
        { href: `/project/${projectId}`, label: "Overview" },
        { href: `/project/${projectId}/meeting-summary`, label: "Meetings" },
        { href: `/project/${projectId}/meeting-summary`, label: "Knowledge" },
        { href: `/project/${projectId}/meeting-summary`, label: "Actions" },
        { href: `/project/${projectId}/chat`, label: "Chat" },
      ]
    : [];

  const isActive = (href: string) => {
    if (href === "/home") return pathname === href;
    if (href === "/projects") return pathname === "/projects";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navContent = (
    <>
      <Link
        href="/home"
        className="flex min-h-12 items-center gap-3 border-b border-[var(--line)] px-5 py-4"
        onClick={() => setMobileMenuOpen(false)}
      >
        <BrandLogo className="h-8 w-8" priority />
        <span className="text-sm font-bold tracking-tight">Ops Ninja</span>
      </Link>

      <nav className="grid gap-1 px-3 py-4 text-sm" aria-label="Workspace">
        {primaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`rounded-[5px] px-3 py-2.5 font-semibold transition ${
              isActive(item.href)
                ? "bg-white text-[var(--orange-dark)]"
                : "text-[var(--ink-2)] hover:bg-white hover:text-[var(--ink)]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {projectNav.length > 0 && (
        <nav className="border-t border-[var(--line)] px-3 py-4 text-sm" aria-label="Project">
          <p className="px-3 pb-2 text-xs font-semibold text-[var(--ink-3)]">
            Project
          </p>
          <div className="grid gap-1">
            {projectNav.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-[5px] px-3 py-2.5 font-semibold transition ${
                  isActive(item.href)
                    ? "bg-white text-[var(--orange-dark)]"
                    : "text-[var(--ink-2)] hover:bg-white hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--line)] bg-[var(--page)] transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-[var(--line)] bg-[var(--page)]/92 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[5px] border border-[var(--line)] bg-white text-[var(--ink)] lg:hidden"
              aria-label="Open navigation"
            >
              <MenuIcon open={mobileMenuOpen} />
            </button>
            <Link href="/" className="hidden text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] sm:inline-flex">
              Marketing site
            </Link>
          </div>
          <UserMenu />
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
