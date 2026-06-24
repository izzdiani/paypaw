"use client";

import { AppShell } from "@/components/app-shell";
import { MoneyForm } from "@/components/money-form";
import { MoneyList } from "@/components/money-list";
import { SummaryCard } from "@/components/summary-card";
import { formatMonthLabel } from "@/lib/month-label";
import { useBudgetStorage } from "@/lib/use-budget-storage";
import { useSearchParams } from "next/navigation";

export function BillsPage() {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type");
  const {
    activeMonth,
    bills,
    categories,
    totalBills,
    addBill,
    updateBill,
    toggleBillPaid,
    deleteBill
  } = useBudgetStorage();
  const visibleBills = [...bills]
    .filter((item) => (
      typeFilter === "bill" || typeFilter === "expense"
        ? (item.type ?? "bill") === typeFilter
        : true
    ))
    .sort((first, second) => second.amount - first.amount);

  return (
    <AppShell>
      <div className="grid gap-4">
        <SummaryCard
          label={`Total Bills - ${formatMonthLabel(activeMonth)}`}
          amount={totalBills}
          tone="blush"
        />
        <MoneyForm
          buttonLabel="Add Bill"
          categories={categories}
          includeCategory
          nameLabel="Bill name"
          onAdd={addBill}
        />
        <MoneyList
          emptyMessage="No bills yet."
          categories={categories}
          items={visibleBills}
          onDelete={deleteBill}
          onEdit={updateBill}
          onTogglePaid={toggleBillPaid}
        />
      </div>
    </AppShell>
  );
}
