import Image from "next/image";
import logo from "@/../public/logo.png";
export default function BrandLogo({
  className = "h-20 w-20",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[4px] ${className}`}
    >
      <Image
        src={logo}
        alt="Ops Ninja"
        fill
        sizes="96px"
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}
