"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function AuthSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function setupCookie() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/setup-cookie`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to setup cookie: ${response.statusText}`);
        }

        setStatus("success");
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      } catch (error) {
        console.error("Cookie setup error:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        setStatus("error");
      }
    }

    setupCookie();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3] px-5 py-10 text-[#20251f]">
      <section className="w-full max-w-md rounded-3xl border border-[#dfe5dc] bg-white p-8 text-center shadow-xl shadow-[#59745b]/10">
        <Link href="/" className="text-lg font-bold">
          Ops Ninja
        </Link>

        {status === "loading" && (
          <>
            <h1 className="mt-10 text-3xl font-bold tracking-tight">
              Setting up your workspace
            </h1>
            <p className="mt-3 leading-7 text-[#6a7368]">
              Completing authentication and setting up your session...
            </p>
            <div className="mt-7 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dfe5dc] border-t-[#20251f]" />
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="mt-10 text-3xl font-bold tracking-tight">
              Welcome!
            </h1>
            <p className="mt-3 leading-7 text-[#6a7368]">
              Your workspace is ready. Redirecting you now...
            </p>
            <div className="mt-7 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dfe5dc] border-t-[#20251f]" />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="mt-10 text-3xl font-bold tracking-tight text-[#c2491d]">
              Something went wrong
            </h1>
            <p className="mt-3 leading-7 text-[#6a7368]">{errorMessage}</p>
            <Link
              href="/"
              className="mt-7 inline-block rounded-xl bg-[#20251f] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#40503f]"
            >
              Return to home
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
