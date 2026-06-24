"use client";

import { AppShell } from "@/components/app-shell";
import { CopyLastMonthButton } from "@/components/copy-last-month-button";
import { MonthSelector } from "@/components/month-selector";
import { NotionCsvImport } from "@/components/notion-csv-import";
import { SummaryCard } from "@/components/summary-card";
import { UnpaidItems } from "@/components/unpaid-items";
import { UpcomingGoals } from "@/components/upcoming-goals";
import { useBudgetStorage } from "@/lib/use-budget-storage";

export function DashboardPage() {
  const {
    activeMonth,
    monthKeys,
    incomes,
    bills,
    categories,
    goals,
    totalIncome,
    totalBills,
    totalExpenses,
    safeToSpend,
    switchMonth,
    copyLastMonth,
    importBills,
    toggleBillPaid,
    addGoal,
    updateGoal,
    addGoalSavedAmount,
    deleteGoal,
    deleteMonth
  } = useBudgetStorage();
  const hasCurrentMonthData = incomes.length > 0 || bills.length > 0;

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
          <SummaryCard compact label="Income" amount={totalIncome} tone="mint" />
          <SummaryCard compact label="Bills" amount={totalBills} tone="blush" />
          <SummaryCard compact label="Expenses" amount={totalExpenses} tone="blush" />
        </div>
        <UpcomingGoals
          goals={goals}
          onAdd={addGoal}
          onAddSaved={addGoalSavedAmount}
          onDelete={deleteGoal}
          onEdit={updateGoal}
        />
        <UnpaidItems categories={categories} items={bills} onTogglePaid={toggleBillPaid} />
      </div>
    </AppShell>
  );
}
