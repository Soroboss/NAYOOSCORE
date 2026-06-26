type UsageMeterProps = {
  label: string;
  current: number;
  max: number | null;
  percent: number;
  ok: boolean;
};

export function UsageMeter({ label, current, max, percent, ok }: UsageMeterProps) {
  const displayMax = max ?? "∞";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[#0B1D2A]">{label}</span>
        <span className={ok ? "text-muted-foreground" : "font-medium text-amber-600"}>
          {current} / {displayMax}
        </span>
      </div>
      {max != null && (
        <div className="h-2 overflow-hidden rounded-full bg-[#F5F7FA]">
          <div
            className={`h-full rounded-full transition-all ${
              ok ? "bg-[#00BFA6]" : "bg-amber-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {max == null && (
        <p className="text-xs text-muted-foreground">Illimité sur votre plan</p>
      )}
    </div>
  );
}
