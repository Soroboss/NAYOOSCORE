import type { ScoreBucket } from "@/lib/institution-context";

type ScoreDistributionChartProps = {
  buckets: ScoreBucket[];
  totalScored: number;
};

export function ScoreDistributionChart({
  buckets,
  totalScored,
}: ScoreDistributionChartProps) {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[#0B1D2A]">Répartition des scores</h3>
        <span className="text-xs text-muted-foreground">
          {totalScored} PME scorée{totalScored > 1 ? "s" : ""}
        </span>
      </div>
      {totalScored === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Aucun score calculé — lancez le scoring sur vos PME.
        </p>
      ) : (
        <div className="space-y-3">
          {buckets.map((bucket) => (
            <div key={bucket.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{bucket.label}</span>
                <span className="font-medium text-[#0B1D2A]">{bucket.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#F5F7FA]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(bucket.count / maxCount) * 100}%`,
                    backgroundColor: bucket.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
