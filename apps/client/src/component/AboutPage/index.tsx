"use client";

import Link from "next/link";
import GetStartedButton from "@/component/GetStartedButton";

function BrandLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-sm"
      >
        <rect width="32" height="32" rx="9" fill="#20251f" />
        <path
          d="M8 22L16 10L24 22H8Z"
          fill="#59745b"
          fillOpacity="0.35"
        />
        <path
          d="M10 21L16 12L22 21H10Z"
          stroke="#b7d0b7"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="18" r="2.2" fill="#16a34a" />
        <path
          d="M7 16H25"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
}

export default function AboutPage() {
  const pillars = [
    {
      num: "01",
      title: "Keep the Signal",
      desc: "Decisions, dependencies, and commitments are distilled into an editable, high-density meeting record, never buried in unreadable 50-page raw transcripts.",
      tag: "Memory & Structure",
      highlight: "Structured MOMs",
    },
    {
      num: "02",
      title: "Connect the Context",
      desc: "Meeting intelligence is mapped into linked Obsidian knowledge graphs and indexed project memory so future architecture decisions rest on solid historical foundations.",
      tag: "Project Knowledge",
      highlight: "Bidirectional Graph",
    },
    {
      num: "03",
      title: "Protect the Handoff",
      desc: "Every external write to Jira, Slack, or GitHub is an inspectable, staged payload. An authorized human must review and approve it before execution leaves the vault.",
      tag: "Approval Gate",
      highlight: "Zero Blind Writes",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#fafaf8] text-[#20251f] selection:bg-[#59745b]/20 selection:text-[#20251f]">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-[500px] w-[1100px] bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(89,116,91,0.12),rgba(250,250,248,0))]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#20251f]/8 bg-[#fafaf8]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3 transition">
            <BrandLogo />
            <span className="text-base font-extrabold tracking-tight text-[#20251f]">
              Ops Ninja
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-[#596257]">
            <Link href="/" className="hover:text-[#20251f] transition">
              Overview
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#20251f] transition">
              Privacy
            </Link>
            <GetStartedButton variant="small" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-16 text-center lg:px-10 lg:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#59745b]/25 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3b4d3d] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
          <span>The Ops Ninja Operational Standard</span>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.03em] text-[#20251f] sm:text-5xl lg:text-6xl lg:leading-[1.1]">
          High-performance operations start with a record{" "}
          <span className="bg-gradient-to-r from-[#20251f] via-[#59745b] to-[#2d402f] bg-clip-text text-transparent">
            everyone can trust.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#596257] sm:text-lg">
          We built Ops Ninja because generic AI bots were polluting engineering
          backlogs with hallucinations. Ops Ninja gives teams the synthesis power
          of autonomous AI while keeping execution under strict human command.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <GetStartedButton variant="large" />
        </div>
      </section>

      {/* 3 Pillars Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.num}
              className="group relative flex flex-col rounded-3xl border border-[#dfe5dc] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-[#59745b]/40 hover:shadow-xl hover:shadow-[#59745b]/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-[#c2491d]">
                  {pillar.num}
                </span>
                <span className="rounded-full border border-[#dfe5dc] bg-[#f8faf7] px-2.5 py-1 text-[11px] font-bold text-[#59745b]">
                  {pillar.tag}
                </span>
              </div>
              <h2 className="mt-6 text-xl font-bold text-[#20251f]">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#596257]">
                {pillar.desc}
              </p>
              <div className="mt-auto pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#59745b]">
                  <span>{pillar.highlight}</span>
                  <span>→</span>
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Operational Philosophy Banner */}
        <div className="relative mt-14 overflow-hidden rounded-3xl bg-[#20251f] p-8 text-center text-white shadow-xl sm:p-14">
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#b7d0b7]">
              Deliberate By Design
            </span>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              No blind automations. No ghost tickets.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#c6d1c4]">
              Every Jira ticket, Slack announcement, and meeting action item passes
              through your approval gate first. You retain the cryptographic key
              to what leaves your operational vault.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-bold text-[#20251f] shadow-lg transition hover:bg-[#fafaf8] hover:-translate-y-0.5"
              >
                <span>Explore the approval gate demo</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Ambient lighting */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#59745b]/30 blur-3xl"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dfe5dc] bg-[#fafaf8] px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-[#7a8678]">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-5 w-5" />
            <span className="font-bold text-[#20251f]">Ops Ninja</span>
            <span>— The Human-in-the-Loop Operational Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#20251f]">
              Home
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#20251f]">
              Privacy
            </Link>
            <Link href="/home" className="hover:text-[#20251f]">
              Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
