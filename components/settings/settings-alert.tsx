import type { ReactNode } from "react";

export function SettingsAlert({
  variant,
  children,
}: {
  variant: "warning" | "error";
  children: ReactNode;
}) {
  const styles =
    variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}
