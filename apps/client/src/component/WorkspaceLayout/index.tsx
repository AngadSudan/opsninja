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
      strokeWidth={2}
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

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard = pathname === "/home";
  const isProjects = pathname === "/projects" || pathname.startsWith("/project");
  const isIntegrations = pathname === "/integrations";

  const getSectionTitle = () => {
    if (isDashboard) return "Command Center";
    if (isProjects) return "Projects";
    if (isIntegrations) return "Integrations";
    return "Workspace";
  };

  const navLinks = [
    {
      href: "/home",
      label: "Command Center",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: isDashboard,
    },
    {
      href: "/projects",
      label: "Projects & Vaults",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      active: isProjects,
    },
    {
      href: "/integrations",
      label: "Connected Tools",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      active: isIntegrations,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3efe7] text-[#1c1b17]">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#101510]/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#121615] px-4 py-4 text-[#ede8dd] shadow-2xl shadow-black/20 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href="/home"
          className="flex items-center gap-3 px-1 pb-5 text-base font-extrabold text-white tracking-tight"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BrandLogo className="h-9 w-9" priority />
          <div className="flex flex-col">
            <span className="leading-none">Ops Ninja</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c98a64]">
              Operational Intelligence
            </span>
          </div>
        </Link>

        <div className="mb-4 border-y border-white/10 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#857f73]">
            Product loop
          </p>
          <div className="mt-2 grid gap-1 text-[11px] font-semibold text-[#c9c2b5]">
            <span>Meeting {">"} Context</span>
            <span>Decisions {">"} Human review</span>
            <span>Execution {">"} Persistent knowledge</span>
          </div>
        </div>

        <nav className="grid gap-1" aria-label="Workspace">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                item.active
                  ? "bg-[#c3562c] text-white"
                  : "text-[#bdb6aa] hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 px-2 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9eaa9b]">
              <span className="h-2 w-2 rounded-full bg-[#208c55] animate-pulse" />
              <span>Review gate active</span>
            </div>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-[#e0b46f]">
              APPROVAL
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#7a8678]">
            Every external action waits for a human.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#ddd5c9] bg-[#fffdfa]/92 px-4 backdrop-blur-xl sm:px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ddd5c9] bg-white text-[#706a60] transition hover:bg-[#f8f6f1] lg:hidden"
              aria-label="Open sidebar"
            >
              <MenuIcon open={mobileMenuOpen} />
            </button>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9f3f1e]">
                Ops Ninja Workspace
              </p>
              <h2 className="text-sm font-bold text-[#1c1b17]">
                {getSectionTitle()}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
