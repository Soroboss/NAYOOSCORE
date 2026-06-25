import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_TAGLINE } from "@/lib/constants";

type BrandLogoProps = {
  className?: string;
  showTagline?: boolean;
  /** Sur fond sombre — ajoute un halo blanc derrière le logo */
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
  const onDarkBackground = variant === "light";

  return (
    <Link href="/" className={cn("inline-flex flex-col items-center gap-2", className)}>
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-2xl",
          onDarkBackground &&
            "bg-gradient-to-b from-white via-white/90 to-white/25 px-4 py-3 shadow-[0_8px_32px_rgba(255,255,255,0.18)] ring-1 ring-white/30"
        )}
      >
        {onDarkBackground && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55)_0%,transparent_70%)]"
          />
        )}
        <Image
          src="/logo.png"
          alt="Nayooscore"
          width={dim.width}
          height={dim.height}
          className="relative z-10 h-auto w-auto object-contain"
          priority
        />
      </span>
      {showTagline && variant === "dark" && (
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {APP_TAGLINE}
        </p>
      )}
      {showTagline && onDarkBackground && (
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/80">
          {APP_TAGLINE}
        </p>
      )}
    </Link>
  );
}
