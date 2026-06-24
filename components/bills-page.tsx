"use client";

import { AppShell } from "@/components/app-shell";
import { MoneyForm } from "@/components/money-form";
import { MoneyList } from "@/components/money-list";
import { SummaryCard } from "@/components/summary-card";
import { formatMonthLabel } from "@/lib/month-label";
import { useBudgetStorage } from "@/lib/use-budget-storage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function BillsPage() {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type");
  const {
    activeMonth,
    bills,
    categories,
    totalBills,
    totalExpenses,
    addBill,
    updateBill,
    toggleBillPaid,
    deleteBill
  } = useBudgetStorage();
  const activeFilter = typeFilter === "expense" ? "expense" : typeFilter === "bill" ? "bill" : "all";
  const summaryLabel = activeFilter === "expense"
    ? "Total Expenses"
    : activeFilter === "bill"
      ? "Total Bills"
      : "Bills + Expenses";
  const summaryAmount = activeFilter === "expense"
    ? totalExpenses
    : activeFilter === "bill"
      ? totalBills
      : totalBills + totalExpenses;
  const formType = activeFilter === "expense" ? "expense" : "bill";
  const filterLinks = [
    { href: "/bills", label: "All", value: "all" },
    { href: "/bills?type=bill", label: "Bills", value: "bill" },
    { href: "/bills?type=expense", label: "Expenses", value: "expense" }
  ];
  const visibleBills = [...bills]
    .filter((item) => (
      activeFilter === "bill" || activeFilter === "expense"
        ? (item.type ?? "bill") === activeFilter
        : true
    ))
    .sort((first, second) => second.amount - first.amount);

  return (
    <AppShell>
      <div className="grid gap-4">
        <SummaryCard
          label={`${summaryLabel} - ${formatMonthLabel(activeMonth)}`}
          amount={summaryAmount}
          tone={activeFilter === "expense" ? "purple" : "blush"}
        />
        <nav className="grid grid-cols-3 rounded-2xl bg-white/80 p-1 shadow-soft">
          {filterLinks.map((item) => (
            <Link
              key={item.value}
              className={`rounded-xl px-3 py-2 text-center text-sm font-semibold transition ${
                activeFilter === item.value
                  ? "bg-paw-purple text-white"
                  : "text-paw-plum hover:bg-paw-blush"
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MoneyForm
          buttonLabel={formType === "expense" ? "Add Expense" : "Add Bill"}
          categories={categories}
          includeCategory
          initialType={formType}
          nameLabel={formType === "expense" ? "Expense name" : "Bill name"}
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
