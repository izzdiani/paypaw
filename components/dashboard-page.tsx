"use client";

import { AppShell } from "@/components/app-shell";
import { CopyLastMonthButton } from "@/components/copy-last-month-button";
import { MonthSelector } from "@/components/month-selector";
import { MonthlyNotes } from "@/components/monthly-notes";
import { NotionCsvImport } from "@/components/notion-csv-import";
import { SummaryCard } from "@/components/summary-card";
import { UnpaidItems } from "@/components/unpaid-items";
import { UpcomingGoals } from "@/components/upcoming-goals";
import { formatMoney } from "@/lib/format-money";
import { useBudgetStorage } from "@/lib/use-budget-storage";

export function DashboardPage() {
  const {
    activeMonth,
    monthKeys,
    incomes,
    bills,
    categories,
    goals,
    notes,
    totalIncome,
    totalBills,
    totalExpenses,
    safeToSpend,
    switchMonth,
    copyLastMonth,
    importBills,
    toggleBillPaid,
    updateNotes,
    addGoal,
    updateGoal,
    addGoalLink,
    updateGoalLink,
    addGoalSavedAmount,
    removeGoalLink,
    deleteGoal,
    deleteMonth
  } = useBudgetStorage();
  const hasCurrentMonthData = incomes.length > 0 || bills.length > 0;
  const unpaidBillCount = bills.filter((item) => (
    (item.type ?? "bill") === "bill" && item.isPaid !== true
  )).length;
  const expenseCount = bills.filter((item) => item.type === "expense").length;

  return (
    <AppShell>
      <div className="grid gap-4">
        <MonthSelector
          activeMonth={activeMonth}
          monthKeys={monthKeys}
          onChange={switchMonth}
          onDeleteMonth={deleteMonth}
        />
        <div className="grid grid-cols-2 gap-2">
          <CopyLastMonthButton
            hasCurrentMonthData={hasCurrentMonthData}
            onCopy={copyLastMonth}
          />
          <NotionCsvImport
            activeMonth={activeMonth}
            categories={categories}
            currentBills={bills}
            onImport={importBills}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            compact
            label={safeToSpend < 0 ? "Over budget" : "Safe To Spend"}
            amount={safeToSpend}
            tone={safeToSpend < 0 ? "danger" : "purple"}
          />
          <SummaryCard compact href="/income" label="Income" amount={totalIncome} tone="mint" />
          <SummaryCard compact href="/bills?type=bill" label="Bills" amount={totalBills} tone="blush" />
          <SummaryCard compact href="/bills?type=expense" label="Expenses" amount={totalExpenses} tone="blush" />
        </div>
        <MonthlyNotes activeMonth={activeMonth} notes={notes} onChange={updateNotes} />
        <UpcomingGoals
          goals={goals}
          onAdd={addGoal}
          onAddLink={addGoalLink}
          onAddSaved={addGoalSavedAmount}
          onDelete={deleteGoal}
          onEdit={updateGoal}
          onRemoveLink={removeGoalLink}
          onUpdateLink={updateGoalLink}
        />
        <section className="grid grid-cols-3 gap-2 rounded-2xl bg-white/85 p-3 text-center shadow-soft">
          <div className="rounded-xl bg-paw-cream p-2">
            <p className="text-lg font-bold text-paw-plum">{unpaidBillCount}</p>
            <p className="text-xs font-semibold text-paw-purple">Bills Unpaid</p>
          </div>
          <div className="rounded-xl bg-paw-cream p-2">
            <p className="text-lg font-bold text-paw-plum">{expenseCount}</p>
            <p className="text-xs font-semibold text-paw-purple">Expenses</p>
          </div>
          <div className="rounded-xl bg-paw-cream p-2">
            <p className="text-lg font-bold text-paw-plum">{formatMoney(safeToSpend)}</p>
            <p className="text-xs font-semibold text-paw-purple">Safe</p>
          </div>
        </section>
        <UnpaidItems categories={categories} items={bills} onTogglePaid={toggleBillPaid} />
      </div>
    </AppShell>
  );
}
