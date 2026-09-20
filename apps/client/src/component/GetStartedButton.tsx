"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToCognito } from "@/lib/auth";

interface GetStartedButtonProps {
  variant?: "small" | "large" | "outline" | "white";
  className?: string;
}

export default function GetStartedButton({
  variant = "small",
  className = "",
}: GetStartedButtonProps) {
  const { isAuthenticated, isLoading } = useAuth();

  const baseStyles =
    "inline-flex min-h-11 items-center justify-center rounded-[5px] font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--orange)] disabled:opacity-50";

  const variantStyles = {
    small:
      "bg-[var(--ink)] px-4 py-2 text-sm text-white hover:bg-[var(--orange)]",
    large:
      "bg-[var(--ink)] px-6 py-3 text-base text-white hover:bg-[var(--orange)]",
    outline:
      "border border-[var(--line)] bg-transparent px-4 py-2 text-sm text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-white",
    white:
      "bg-white px-6 py-3 text-base text-[var(--ink)] hover:bg-[var(--page)]",
  };

  if (isAuthenticated) {
    return (
      <Link
        href="/home"
        className={`${baseStyles} ${variantStyles[variant]} ${className} !text-white hover:!text-white`}
      >
        Open workspace
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => redirectToCognito()}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {isLoading ? "Checking access" : "Open workspace"}
    </button>
  );
}
