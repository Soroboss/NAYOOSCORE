import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
};

export function StatCard({ title, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[#0B1D2A]">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="rounded-lg bg-[#00BFA6]/10 p-2">
          <Icon className="size-5 text-[#00BFA6]" />
        </div>
      </div>
    </div>
  );
}
