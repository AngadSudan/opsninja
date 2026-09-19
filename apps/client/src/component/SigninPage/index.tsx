"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToCognito } from "@/lib/auth";

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
      </svg>
    </div>
  );
}

export default function SigninPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/home");
      } else {
        redirectToCognito();
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaf8] px-5 py-10 text-[#20251f]">
      <section className="w-full max-w-md rounded-3xl border border-[#dfe5dc] bg-white p-8 text-center shadow-2xl shadow-[#20251f]/5">
        <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <BrandLogo /> Ops Ninja
        </Link>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-[#20251f]">
          Redirecting to authentication
        </h1>
        <p className="mt-2 text-xs leading-6 text-[#6a7368]">
          Connecting securely with Amazon Cognito to authenticate your workspace identity.
        </p>

        <div className="my-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#dfe5dc] border-t-[#20251f]" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => redirectToCognito()}
            className="w-full rounded-xl bg-[#20251f] py-2.5 text-xs font-bold text-white transition hover:bg-[#343e33]"
          >
            Click here if not redirected automatically
          </button>
          <Link
            href="/"
            className="block text-xs font-semibold text-[#59745b] hover:underline"
          >
            ← Return to overview
          </Link>
        </div>
      </section>
    </main>
  );
}
