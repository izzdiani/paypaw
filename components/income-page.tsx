"use client";

import { AppShell } from "@/components/app-shell";
import { MoneyForm } from "@/components/money-form";
import { MoneyList } from "@/components/money-list";
import { SummaryCard } from "@/components/summary-card";
import { formatMonthLabel } from "@/lib/month-label";
import { useBudgetStorage } from "@/lib/use-budget-storage";

export function IncomePage() {
  const { activeMonth, incomes, totalIncome, addIncome, deleteIncome } = useBudgetStorage();

  return (
    <AppShell>
      <div className="grid gap-4">
        <SummaryCard
          label={`Total Income - ${formatMonthLabel(activeMonth)}`}
          amount={totalIncome}
          tone="mint"
        />
        <MoneyForm buttonLabel="Add Income" nameLabel="Income name" onAdd={addIncome} />
        <MoneyList
          emptyMessage="No income yet."
          items={incomes}
          onDelete={deleteIncome}
        />
      </div>
    </AppShell>
  );
}
