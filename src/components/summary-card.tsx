export function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "positive" | "negative";
}) {
  return (
    <div className="ledger-card rounded-lg p-4">
      <p className="text-xs font-medium tracking-wide text-foreground/50">
        {label}
      </p>
      <p
        className={
          "mt-1 font-ledger text-2xl font-bold " +
          (accent === "positive"
            ? "text-policy-strengthen"
            : accent === "negative"
              ? "text-policy-abolish"
              : "text-navy-900")
        }
      >
        {value}
      </p>
    </div>
  );
}
