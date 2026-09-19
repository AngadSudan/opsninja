"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function UserMenu() {
  const { user, isLoading, logout } = useAuth();
  const initials =
    user?.user_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (isLoading) {
    return (
      <span
        className="inline-flex h-9 w-9 animate-pulse rounded-full bg-[#f0f4ee]"
        aria-label="Loading user"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/signin"
        className="inline-flex min-h-9 items-center rounded-xl border border-[#dfe5dc] px-3.5 py-1.5 text-xs font-bold text-[#20251f] transition hover:bg-[#fafaf8]"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <strong className="block text-xs font-bold text-[#20251f]">
          {user.user_name}
        </strong>
        <span className="block text-[11px] text-[#8a9587]">
          {user.email || user.user_email || "Operator"}
        </span>
      </div>
      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#20251f] text-xs font-bold text-white shadow-sm transition hover:bg-[#343e33]"
        type="button"
        onClick={logout}
        title="Click to log out"
        aria-label="Log out"
      >
        {initials}
      </button>
    </div>
  );
}
