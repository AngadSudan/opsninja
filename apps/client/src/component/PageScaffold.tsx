"use client";

import Link from "next/link";
import BrandLogo from "@/component/BrandLogo";

type PageScaffoldProps = {
  title: string;
  description: string;
  eyebrow?: string;
  details?: Array<{
    label: string;
    value: string;
  }>;
};

export default function PageScaffold({
  title,
  description,
  eyebrow = "Ops Ninja",
  details = [],
}: PageScaffoldProps) {
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#20251f] flex flex-col justify-between selection:bg-[#59745b]/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#20251f]/8 bg-[#fafaf8]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5 text-base font-extrabold tracking-tight">
            <BrandLogo className="h-8 w-8" /> Ops Ninja
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="secondary-action px-4 py-2"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#e8eee5] text-2xl text-[#59745b] shadow-xs">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Zm0 4.5v4.25l2.75 1.65" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#59745b]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#20251f] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#596257] sm:text-base">
          {description}
        </p>

        {details.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="rounded-lg border border-[#dfe5dc] bg-white p-4 text-left shadow-sm"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a9587]">
                  {detail.label}
                </span>
                <strong className="mt-1 block text-sm text-[#20251f]">
                  {detail.value}
                </strong>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="primary-action"
          >
            Try reconnecting
          </button>
          <Link
            href="/"
            className="secondary-action"
          >
            Return to overview
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dfe5dc] py-6 text-center text-xs text-[#8a9587]">
        Ops Ninja · PWA Offline Resilience
      </footer>
    </main>
  );
}
