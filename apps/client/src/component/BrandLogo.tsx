import Image from "next/image";

export default function BrandLogo({
  className = "h-8 w-8",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[4px] ${className}`}>
      <Image
        src="/logo.png"
        alt="Ops Ninja"
        fill
        sizes="48px"
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}
