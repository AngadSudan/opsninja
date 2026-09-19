export default function BrandLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="9" fill="#20251f" />
        <path d="M8 22L16 10L24 22H8Z" fill="#59745b" fillOpacity="0.35" />
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
