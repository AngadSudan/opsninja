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
  const { isAuthenticated } = useAuth();

  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.98]";

  const variantStyles = {
    small:
      "rounded-md bg-[#20251f] px-4 py-2 text-xs sm:text-sm text-white shadow-none hover:bg-[#343e33]",
    large:
      "rounded-md bg-[#20251f] px-5 py-3 text-sm sm:text-base font-bold text-white shadow-none hover:bg-[#323c31]",
    outline:
      "rounded-md border border-[#20251f]/20 bg-white/80 px-4 py-2 text-xs sm:text-sm text-[#20251f] backdrop-blur hover:bg-white hover:border-[#20251f]/40",
    white:
      "rounded-md bg-white px-5 py-3 text-sm sm:text-base font-bold text-[#20251f] shadow-none hover:bg-[#fafaf8]",
  };

  if (isAuthenticated) {
    return (
      <Link
        href="/home"
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      >
        <span>Open workspace</span>
        <span className="ml-1.5 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => redirectToCognito()}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <span>{variant === "large" || variant === "white" ? "Create your workspace" : "Get started"}</span>
      <span className="ml-1.5 transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </button>
  );
}
