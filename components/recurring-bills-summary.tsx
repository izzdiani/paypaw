import { formatMoney } from "@/lib/format-money";
import type { MoneyItem } from "@/lib/types";

type RecurringBillsSummaryProps = {
  bills: MoneyItem[];
};

export function RecurringBillsSummary({ bills }: RecurringBillsSummaryProps) {
  return (
    <section className="rounded-2xl bg-white/85 p-4 shadow-soft">
      <h2 className="text-sm font-bold text-paw-plum">Recurring Bills</h2>

      {bills.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-paw-plum/70">
          No recurring bills yet
        </p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {bills.map((bill) => (
            <li
              key={bill.recurringId ?? bill.id}
              className="text-sm font-semibold text-paw-plum"
            >
              {bill.name} — {formatMoney(bill.amount)} — every{" "}
              {bill.recurringInterval ?? 1} month
              {(bill.recurringInterval ?? 1) === 1 ? "" : "s"}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
