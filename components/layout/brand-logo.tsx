import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_TAGLINE } from "@/lib/constants";

type BrandLogoProps = {
  className?: string;
  showTagline?: boolean;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { width: 120, height: 80 },
  md: { width: 180, height: 120 },
  lg: { width: 260, height: 173 },
};

export function BrandLogo({
  className,
  showTagline = false,
  variant = "dark",
  size = "md",
}: BrandLogoProps) {
  const dim = sizes[size];

  return (
    <Link href="/" className={cn("inline-flex flex-col items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="Nayooscore"
        width={dim.width}
        height={dim.height}
        className="h-auto w-auto object-contain"
        priority
      />
      {showTagline && variant === "dark" && (
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {APP_TAGLINE}
        </p>
      )}
    </Link>
  );
}
