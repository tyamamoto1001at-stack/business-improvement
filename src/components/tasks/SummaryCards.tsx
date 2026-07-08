import { Card } from "@/components/ui/Card";

function formatHours(value: number) {
  return `${Math.round(value * 10) / 10}h`;
}

export function SummaryCards({
  currentTotal,
  afterTotal,
}: {
  currentTotal: number;
  afterTotal: number;
}) {
  const diff = currentTotal - afterTotal;
  const isReduction = diff >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="px-5 py-4">
        <p className="text-xs font-medium text-navy-500">現状工数計(月間)</p>
        <p className="mt-1 font-ledger text-2xl font-bold text-navy-800">
          {formatHours(currentTotal)}
        </p>
      </Card>
      <Card className="px-5 py-4">
        <p className="text-xs font-medium text-navy-500">適用後工数計(月間)</p>
        <p className="mt-1 font-ledger text-2xl font-bold text-navy-800">
          {formatHours(afterTotal)}
        </p>
      </Card>
      <Card className="px-5 py-4">
        <p className="text-xs font-medium text-navy-500">
          {isReduction ? "削減見込み" : "増加見込み"}(月間)
        </p>
        <p
          className={`mt-1 font-ledger text-2xl font-bold ${
            isReduction ? "text-emerald-700" : "text-seal"
          }`}
        >
          {isReduction ? "-" : "+"}
          {formatHours(Math.abs(diff))}
        </p>
      </Card>
    </div>
  );
}
