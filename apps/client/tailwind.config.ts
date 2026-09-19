import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/component/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: {
          bg: "#FAFAF8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F5F3",
        },
        border: {
          DEFAULT: "rgba(26, 29, 26, 0.10)",
          strong: "rgba(26, 29, 26, 0.20)",
        },
        text: {
          primary: "#1A1D1A",
          secondary: "rgba(26, 29, 26, 0.65)",
          muted: "rgba(26, 29, 26, 0.40)",
        },
        brand: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "rgba(37, 99, 235, 0.08)",
        },
        accent: {
          warm: "#C2491D",
          green: "#16A34A",
          "green-light": "rgba(22, 163, 74, 0.08)",
          amber: "#D97706",
          "amber-light": "rgba(217, 119, 6, 0.08)",
          sage: "#59745B",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        pill: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 2px 8px rgba(0,0,0,0.06)",
        lg: "0 4px 20px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        slideUp: "slideUp 0.2s ease-out",
        slideIn: "slideIn 0.2s ease-out",
        pulse: "pulse 1.5s ease-in-out infinite",
        spin: "spin 0.6s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
