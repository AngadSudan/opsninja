"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/component/UserMenu";

function BrandLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-xs"
      >
        <rect width="32" height="32" rx="8" fill="#2d382c" />
        <path
          d="M8 22L16 10L24 22H8Z"
          fill="#59745b"
          fillOpacity="0.45"
        />
        <path
          d="M10 21L16 12L22 21H10Z"
          stroke="#b7d0b7"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="18" r="2.2" fill="#16a34a" />
      </svg>
    </div>
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
    <div className="flex min-h-screen bg-[#f8f9f7]">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/10 bg-[#1c221b] px-3 py-4 text-[#e9eee7] transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href="/home"
          className="flex items-center gap-3 px-2 pb-5 text-base font-extrabold text-white tracking-tight"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BrandLogo />
          <div className="flex flex-col">
            <span className="leading-none">Ops Ninja</span>
            <span className="mt-1 text-[10px] font-semibold text-[#8ca38a]">
              Operational Memory
            </span>
          </div>
        </Link>

        <nav className="grid gap-1" aria-label="Workspace">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                item.active
                  ? "bg-[#59745b] text-white shadow-md shadow-[#59745b]/20"
                  : "text-[#aeb9ac] hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 px-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9eaa9b]">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
              <span>Vault Active</span>
            </div>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#b7d0b7]">
              E2EE
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#7a8678]">
            AI Meeting Gatekeeper v2.4
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#dfe5dc] bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe5dc] text-[#596257] lg:hidden"
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#59745b]">
                Ops Ninja Workspace
              </p>
              <h2 className="text-sm font-bold text-[#20251f]">
                {getSectionTitle()}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
