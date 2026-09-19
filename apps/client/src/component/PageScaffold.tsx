"use client";

import Link from "next/link";

type PageScaffoldProps = {
  title: string;
  description: string;
  eyebrow?: string;
  details?: Array<{
    label: string;
    value: string;
  }>;
};

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
            <BrandLogo /> Ops Ninja
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="rounded-xl border border-[#dfe5dc] bg-white px-4 py-2 text-xs font-bold text-[#20251f] transition hover:border-[#9db29b] shadow-xs"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8eee5] text-2xl text-[#59745b] shadow-xs">
          ◎
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
                className="rounded-xl border border-[#dfe5dc] bg-white p-4 text-left shadow-sm"
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
            className="rounded-full bg-[#20251f] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#343e33]"
          >
            Try reconnecting
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#dfe5dc] bg-white px-5 py-2.5 text-xs font-bold text-[#596257] transition hover:border-[#9db29b]"
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
