const xofFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

export function formatXof(amount: number): string {
  return xofFormatter.format(amount);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0 %";
  return `${Math.round((value / total) * 100)} %`;
}
