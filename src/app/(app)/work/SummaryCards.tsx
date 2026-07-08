function formatHours(n: number) {
  return `${Math.round(n * 10) / 10}h`;
}

export function SummaryCards({
  currentTotal,
  plannedTotal,
}: {
  currentTotal: number;
  plannedTotal: number;
}) {
  const diff = plannedTotal - currentTotal;
  const isReduction = diff < 0;
  const isIncrease = diff > 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="ledger-card rounded-sm p-5">
        <p className="text-xs font-medium tracking-wide text-navy/60">現状工数計 (月間)</p>
        <p className="mt-2 font-serif text-3xl font-bold text-navy">{formatHours(currentTotal)}</p>
      </div>
      <div className="ledger-card rounded-sm p-5">
        <p className="text-xs font-medium tracking-wide text-navy/60">適用後工数計 (月間)</p>
        <p className="mt-2 font-serif text-3xl font-bold text-navy">{formatHours(plannedTotal)}</p>
      </div>
      <div className="ledger-card rounded-sm p-5">
        <p className="text-xs font-medium tracking-wide text-navy/60">削減 / 増加見込み</p>
        <p
          className={`mt-2 font-serif text-3xl font-bold ${
            isReduction ? "text-emerald-700" : isIncrease ? "text-rose-700" : "text-navy"
          }`}
        >
          {isReduction ? "▼" : isIncrease ? "▲" : "―"} {formatHours(Math.abs(diff))}
        </p>
      </div>
    </div>
  );
}
