import { formatMoney } from "@/lib/format-money";

type SummaryCardProps = {
  label: string;
  amount: number;
  compact?: boolean;
  tone?: "purple" | "mint" | "blush" | "danger";
};

export function SummaryCard({ label, amount, compact = false, tone = "purple" }: SummaryCardProps) {
  const toneClass = {
    purple: "bg-paw-purple text-white",
    mint: "bg-paw-mint text-paw-plum",
    blush: "bg-paw-blush text-paw-plum",
    danger: "bg-red-100 text-red-800"
  }[tone];

  return (
    <section className={`rounded-2xl shadow-soft ${compact ? "p-3" : "p-5"} ${toneClass}`}>
      <p className={`${compact ? "text-xs" : "text-sm"} font-semibold opacity-80`}>{label}</p>
      <p className={`mt-1 font-bold ${compact ? "text-xl" : "text-3xl"}`}>{formatMoney(amount)}</p>
    </section>
  );
}
