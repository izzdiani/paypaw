"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { defaultCategories } from "@/lib/default-categories";
import { roundMoney } from "@/lib/money";
import { getSupabase } from "@/lib/supabase-client";
import type { BudgetData, BudgetMonth, CategoryItem, GoalItem, GoalLink, MoneyItem } from "@/lib/types";

const STORAGE_KEY = "paypaw-data";

type LegacyGoalItem = Omit<GoalItem, "links"> & {
  link?: string;
  note?: string;
  links?: Array<string | GoalLink>;
};

type LegacyBudgetMonth = BudgetMonth & {
  goals?: LegacyGoalItem[];
};

type LegacyBudgetData = Omit<BudgetData, "goals" | "months"> & {
  goals?: LegacyGoalItem[];
  months: Record<string, LegacyBudgetMonth>;
};

function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function createEmptyBudget(monthKey = getCurrentMonthKey()): BudgetData {
  return {
    activeMonth: monthKey,
    categories: defaultCategories,
    goals: [],
    months: {
      [monthKey]: {
        income: [],
        bills: [],
        notes: ""
      }
    }
  };
}

function getMonthDifference(fromMonth: string, toMonth: string) {
  const [fromYear, fromMonthNumber] = fromMonth.split("-").map(Number);
  const [toYear, toMonthNumber] = toMonth.split("-").map(Number);

  return (toYear - fromYear) * 12 + (toMonthNumber - fromMonthNumber);
}

function getPreviousMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  date.setMonth(date.getMonth() - 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeBill(bill: MoneyItem, monthKey: string): MoneyItem {
  const type = bill.type ?? "bill";
  const recurringInterval = bill.recurringInterval ?? (bill.isRecurring ? 1 : null);

  return {
    ...bill,
    type,
    isPaid: bill.isPaid ?? false,
    recurringInterval,
    lastAddedMonth: recurringInterval ? bill.lastAddedMonth ?? monthKey : null,
    recurringId: recurringInterval ? bill.recurringId ?? bill.id : null
  };
}

function copyIncomeItem(income: MoneyItem): MoneyItem {
  return {
    ...income,
    id: crypto.randomUUID()
  };
}

function copyBillItem(bill: MoneyItem, monthKey: string): MoneyItem {
  const type = bill.type ?? "bill";
  const recurringInterval = bill.recurringInterval ?? null;

  return {
    ...bill,
    id: crypto.randomUUID(),
    type,
    isPaid: false,
    recurringInterval,
    lastAddedMonth: recurringInterval ? bill.lastAddedMonth ?? monthKey : null,
    recurringId: recurringInterval ? bill.recurringId ?? bill.id : null,
    isRecurring: Boolean(recurringInterval)
  };
}

function copyRecurringBillForMonth(bill: MoneyItem, monthKey: string): MoneyItem {
  return {
    id: crypto.randomUUID(),
    name: bill.name,
    amount: roundMoney(bill.amount),
    category: bill.category,
    type: bill.type ?? "bill",
    dueDate: bill.dueDate,
    isRecurring: Boolean(bill.recurringInterval),
    recurringInterval: bill.recurringInterval,
    lastAddedMonth: monthKey,
    recurringId: bill.recurringId ?? bill.id,
    isPaid: false
  };
}

function getRecurringBillsForNewMonth(data: BudgetData, monthKey: string) {
  const latestRecurringBills = new Map<string, MoneyItem>();

  Object.entries(data.months).forEach(([sourceMonthKey, month]) => {
    if (sourceMonthKey >= monthKey) {
      return;
    }

    month.bills.forEach((bill) => {
      const normalizedBill = normalizeBill(bill, sourceMonthKey);
      const recurringInterval = normalizedBill.recurringInterval;
      const lastAddedMonth = normalizedBill.lastAddedMonth;

      if (!recurringInterval || !lastAddedMonth) {
        return;
      }

      const recurringId = normalizedBill.recurringId ?? normalizedBill.id;
      const existingBill = latestRecurringBills.get(recurringId);
      const existingLastAddedMonth = existingBill?.lastAddedMonth ?? "";

      if (!existingBill || lastAddedMonth > existingLastAddedMonth) {
        latestRecurringBills.set(recurringId, normalizedBill);
      }
    });
  });

  const dueBills = Array.from(latestRecurringBills.values()).filter((bill) => {
    if (!bill.recurringInterval || !bill.lastAddedMonth) {
      return false;
    }

    return getMonthDifference(bill.lastAddedMonth, monthKey) >= bill.recurringInterval;
  });
  return dueBills.map((bill) => copyRecurringBillForMonth(bill, monthKey));
}

function normalizeBudget(data: LegacyBudgetData): BudgetData {
  return {
    ...data,
    categories: data.categories?.length ? data.categories : defaultCategories,
    goals: collectGlobalGoals(data),
    months: Object.fromEntries(
      Object.entries(data.months).map(([monthKey, month]) => [
        monthKey,
        {
          income: month.income ?? [],
          bills: (month.bills ?? []).map((bill) => normalizeBill(bill, monthKey)),
          notes: month.notes ?? ""
        }
      ])
    )
  };
}

function normalizeGoal(goal: LegacyGoalItem): GoalItem {
  const links = goal.links?.length
    ? goal.links
    : goal.link
      ? [goal.link]
      : [];

  return {
    id: goal.id || crypto.randomUUID(),
    name: goal.name,
    targetAmount: roundMoney(goal.targetAmount),
    savedAmount: roundMoney(goal.savedAmount),
    dueDate: goal.dueDate,
    links: links
      .map((link, index) => normalizeGoalLink(link, index))
      .filter((link) => link.url)
  };
}

function collectGlobalGoals(data: LegacyBudgetData) {
  const goalsById = new Map<string, GoalItem>();
  const sourceGoals = [
    ...(data.goals ?? []),
    ...Object.values(data.months).flatMap((month) => month.goals ?? [])
  ];

  sourceGoals.forEach((goal) => {
    const normalizedGoal = normalizeGoal(goal);

    if (!goalsById.has(normalizedGoal.id)) {
      goalsById.set(normalizedGoal.id, normalizedGoal);
    }
  });

  return Array.from(goalsById.values());
}

function normalizeGoalLink(link: string | GoalLink, index: number): GoalLink {
  if (typeof link === "string") {
    const url = link.trim();

    return {
      id: crypto.randomUUID(),
      name: `Link ${index + 1}`,
      url
    };
  }

  const url = link.url.trim();
  const name = link.name.trim();

  return {
    id: link.id || crypto.randomUUID(),
    name: name || `Link ${index + 1}`,
    url
  };
}

function normalizeGoalLinks(links: GoalLink[] = []) {
  return links
    .map((link, index) => normalizeGoalLink(link, index))
    .filter((link) => link.url);
}

function ensureMonth(data: BudgetData, monthKey: string): BudgetData {
  if (data.months[monthKey]) {
    return data;
  }

  return {
    ...data,
    months: {
      ...data.months,
      [monthKey]: {
        income: [],
        bills: getRecurringBillsForNewMonth(data, monthKey),
        notes: ""
      }
    }
  };
}

function readBudget(): BudgetData {
  if (typeof window === "undefined") {
    return createEmptyBudget();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return createEmptyBudget();
  }

  try {
    const parsed = JSON.parse(saved) as LegacyBudgetData;
    const activeMonth = typeof parsed.activeMonth === "string"
      ? parsed.activeMonth
      : getCurrentMonthKey();
    const months = parsed.months && typeof parsed.months === "object"
      ? parsed.months
      : {};

    return ensureMonth(normalizeBudget({
      activeMonth,
      categories: parsed.categories?.length ? parsed.categories : defaultCategories,
      goals: parsed.goals ?? [],
      months
    }), activeMonth);
  } catch {
    return createEmptyBudget();
  }
}

function saveBudget(data: BudgetData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSavedLocalBudget() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

async function getCloudBudget(userId: string) {
  const supabase = await getSupabase();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("budget_data")
    .select("id,data")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as { id: string; data: LegacyBudgetData } | null;
}

async function createCloudBudget(userId: string, data: BudgetData) {
  const supabase = await getSupabase();

  if (!supabase) {
    return null;
  }

  const { data: row, error } = await supabase
    .from("budget_data")
    .insert({
      user_id: userId,
      data,
      updated_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return row.id as string;
}

async function saveCloudBudget(userId: string, data: BudgetData, rowId?: string | null) {
  const supabase = await getSupabase();

  if (!supabase) {
    return null;
  }

  if (rowId) {
    const { error } = await supabase
      .from("budget_data")
      .update({
        data,
        updated_at: new Date().toISOString()
      })
      .eq("id", rowId)
      .eq("user_id", userId);

    if (error) {
      console.error(error);
    }

    return rowId;
  }

  return createCloudBudget(userId, data);
}

export function useBudgetStorage() {
  const { isReady, user } = useAuth();
  const [budget, setBudget] = useState<BudgetData>(() => createEmptyBudget());
  const [cloudRowId, setCloudRowId] = useState<string | null>(null);
  const syncReadyRef = useRef(false);

  useEffect(() => {
    async function loadBudget() {
      const localBudget = readBudget();

      if (!isReady) {
        return;
      }

      if (!user) {
        syncReadyRef.current = false;
        setCloudRowId(null);
        setBudget(localBudget);
        saveBudget(localBudget);
        return;
      }

      const localRaw = getSavedLocalBudget();
      const cloudRow = await getCloudBudget(user.id);

      if (!cloudRow) {
        const rowId = await createCloudBudget(user.id, localBudget);
        setCloudRowId(rowId);
        syncReadyRef.current = true;
        setBudget(localBudget);
        saveBudget(localBudget);
        return;
      }

      const cloudBudget = ensureMonth(normalizeBudget(cloudRow.data), cloudRow.data.activeMonth);
      const hasDifferentLocalData = Boolean(localRaw && localRaw !== JSON.stringify(cloudBudget));

      if (hasDifferentLocalData) {
        const choice = window.prompt(
          "Use cloud data or upload this device data? Type cloud, upload, or cancel.",
          "cloud"
        );

        if (choice?.toLowerCase() === "upload") {
          await saveCloudBudget(user.id, localBudget, cloudRow.id);
          setCloudRowId(cloudRow.id);
          syncReadyRef.current = true;
          setBudget(localBudget);
          saveBudget(localBudget);
          return;
        }

        if (choice?.toLowerCase() === "cancel") {
          setCloudRowId(cloudRow.id);
          syncReadyRef.current = true;
          setBudget(localBudget);
          return;
        }
      }

      setCloudRowId(cloudRow.id);
      syncReadyRef.current = true;
      setBudget(cloudBudget);
      saveBudget(cloudBudget);
    }

    void loadBudget();
  }, [isReady, user]);

  const activeMonthData = budget.months[budget.activeMonth] ?? {
    income: [],
    bills: [],
    notes: ""
  };
  const categories = budget.categories?.length ? budget.categories : defaultCategories;

  const monthKeys = useMemo(() => Object.keys(budget.months).sort(), [budget.months]);

  const recurringBills = useMemo(() => {
    const billsByRecurringId = new Map<string, MoneyItem>();

    Object.values(budget.months).forEach((month) => {
      month.bills.forEach((bill) => {
        if (!bill.isRecurring) {
          return;
        }

        const recurringKey = bill.recurringId ?? bill.id;

        if (!billsByRecurringId.has(recurringKey)) {
          billsByRecurringId.set(recurringKey, bill);
        }
      });
    });

    return Array.from(billsByRecurringId.values());
  }, [budget.months]);

  const totals = useMemo(() => {
    const totalIncome = activeMonthData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalBills = activeMonthData.bills
      .filter((item) => (item.type ?? "bill") === "bill")
      .reduce((sum, item) => sum + item.amount, 0);
    const unpaidBills = activeMonthData.bills
      .filter((item) => (item.type ?? "bill") === "bill" && !item.isPaid)
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = activeMonthData.bills
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      totalIncome,
      totalBills,
      unpaidBills,
      totalExpenses,
      safeToSpend: totalIncome - unpaidBills - totalExpenses
    };
  }, [activeMonthData]);

  function updateBudget(getNextBudget: (current: BudgetData) => BudgetData) {
    setBudget((current) => {
      const nextBudget = getNextBudget(current);
      saveBudget(nextBudget);

      if (user && syncReadyRef.current) {
        void saveCloudBudget(user.id, nextBudget, cloudRowId).then((rowId) => {
          if (rowId && rowId !== cloudRowId) {
            setCloudRowId(rowId);
          }
        });
      }

      return nextBudget;
    });
  }

  function switchMonth(monthKey: string) {
    updateBudget((current) => {
      const nextBudget = ensureMonth(current, monthKey);

      return {
        ...nextBudget,
        activeMonth: monthKey
      };
    });
  }

  function copyLastMonth() {
    updateBudget((current) => {
      const activeMonthKey = current.activeMonth;
      const previousMonthKey = getPreviousMonthKey(activeMonthKey);
      const previousMonth = current.months[previousMonthKey];
      const nextBudget = ensureMonth(current, activeMonthKey);
      const activeMonth = nextBudget.months[activeMonthKey];

      if (!previousMonth) {
        return nextBudget;
      }

      return {
        ...nextBudget,
        months: {
          ...nextBudget.months,
          [activeMonthKey]: {
            income: [
              ...activeMonth.income,
              ...previousMonth.income.map(copyIncomeItem)
            ],
            bills: [
              ...activeMonth.bills,
              ...previousMonth.bills.map((bill) => copyBillItem(bill, activeMonthKey))
            ],
            notes: activeMonth.notes
          }
        }
      };
    });
  }

  function addIncome(item: Omit<MoneyItem, "id">) {
    updateBudget((current) => {
      const nextBudget = ensureMonth(current, current.activeMonth);
      const month = nextBudget.months[nextBudget.activeMonth];

      return {
        ...nextBudget,
        months: {
          ...nextBudget.months,
          [nextBudget.activeMonth]: {
            ...month,
            income: [...month.income, { ...item, amount: roundMoney(item.amount), id: crypto.randomUUID() }]
          }
        }
      };
    });
  }

  function addBill(item: Omit<MoneyItem, "id">) {
    updateBudget((current) => {
      const nextBudget = ensureMonth(current, current.activeMonth);
      const month = nextBudget.months[nextBudget.activeMonth];
      const id = crypto.randomUUID();
      const type = item.type ?? "bill";
      const recurringInterval = item.recurringInterval ?? null;

      return {
        ...nextBudget,
        months: {
          ...nextBudget.months,
          [nextBudget.activeMonth]: {
            ...month,
            bills: [
              ...month.bills,
              {
                ...item,
                id,
                type,
                amount: roundMoney(item.amount),
                recurringInterval,
                lastAddedMonth: recurringInterval ? nextBudget.activeMonth : null,
                recurringId: recurringInterval ? id : null,
                isRecurring: Boolean(recurringInterval),
                isPaid: false
              }
            ]
          }
        }
      };
    });
  }

  function updateBill(
    id: string,
    item: Pick<MoneyItem, "name" | "amount" | "category" | "type" | "recurringInterval">
  ) {
    updateBudget((current) => {
      const month = current.months[current.activeMonth];

      return {
        ...current,
        months: {
          ...current.months,
          [current.activeMonth]: {
            ...month,
            bills: month.bills.map((bill) => {
              if (bill.id !== id) {
                return bill;
              }

              return {
                ...bill,
                name: item.name,
                amount: roundMoney(item.amount),
                category: item.category,
                type: item.type ?? "bill",
                recurringInterval: item.recurringInterval ?? null,
                lastAddedMonth:
                  item.recurringInterval
                    ? bill.lastAddedMonth ?? current.activeMonth
                    : null,
                recurringId:
                  item.recurringInterval
                    ? bill.recurringId ?? bill.id
                    : null,
                isRecurring: Boolean(item.recurringInterval)
              };
            })
          }
        }
      };
    });
  }

  function toggleBillPaid(id: string) {
    updateBudget((current) => {
      const month = current.months[current.activeMonth];

      return {
        ...current,
        months: {
          ...current.months,
          [current.activeMonth]: {
            ...month,
            bills: month.bills.map((bill) => (
              bill.id === id
                ? { ...bill, isPaid: !bill.isPaid }
                : bill
            ))
          }
        }
      };
    });
  }

  function importBills(items: Omit<MoneyItem, "id">[]) {
    updateBudget((current) => {
      const nextBudget = ensureMonth(current, current.activeMonth);
      const month = nextBudget.months[nextBudget.activeMonth];

      return {
        ...nextBudget,
        months: {
          ...nextBudget.months,
          [nextBudget.activeMonth]: {
            ...month,
            bills: [
              ...month.bills,
              ...items.map((item) => {
                const id = crypto.randomUUID();
                const type = item.type ?? "bill";
                const recurringInterval = item.recurringInterval ?? null;

                return {
                  ...item,
                  id,
                  type,
                  amount: roundMoney(item.amount),
                  recurringInterval,
                  lastAddedMonth: recurringInterval ? nextBudget.activeMonth : null,
                  recurringId: recurringInterval ? id : null,
                  isRecurring: Boolean(recurringInterval),
                  isPaid: item.isPaid ?? false
                };
              })
            ]
          }
        }
      };
    });
  }

  function addCategory(category: Omit<CategoryItem, "id">) {
    updateBudget((current) => ({
      ...current,
      categories: [
        ...(current.categories?.length ? current.categories : defaultCategories),
        { ...category, id: crypto.randomUUID() }
      ]
    }));
  }

  function updateCategory(id: string, category: Omit<CategoryItem, "id">) {
    updateBudget((current) => ({
      ...current,
      categories: (current.categories?.length ? current.categories : defaultCategories).map((item) => (
        item.id === id ? { ...category, id } : item
      ))
    }));
  }

  function deleteCategory(id: string) {
    updateBudget((current) => ({
      ...current,
      categories: (current.categories?.length ? current.categories : defaultCategories).filter((item) => item.id !== id)
    }));
  }

  function addGoal(goal: Omit<GoalItem, "id">) {
    updateBudget((current) => ({
      ...current,
      goals: [
        ...current.goals,
        {
          ...goal,
          targetAmount: roundMoney(goal.targetAmount),
          savedAmount: roundMoney(goal.savedAmount),
          links: normalizeGoalLinks(goal.links),
          id: crypto.randomUUID()
        }
      ]
    }));
  }

  function updateGoal(id: string, goal: Omit<GoalItem, "id">) {
    updateBudget((current) => ({
      ...current,
      goals: current.goals.map((item) => (
        item.id === id
          ? {
            ...goal,
            id,
            targetAmount: roundMoney(goal.targetAmount),
            savedAmount: roundMoney(goal.savedAmount),
            links: normalizeGoalLinks(goal.links)
          }
          : item
      ))
    }));
  }

  function addGoalLink(id: string, link: Omit<GoalLink, "id">) {
    const trimmedUrl = link.url.trim();
    const trimmedName = link.name.trim();

    if (!trimmedUrl) {
      return;
    }

    const goalLink: GoalLink = {
      id: crypto.randomUUID(),
      name: trimmedName || "Link",
      url: trimmedUrl
    };

    updateBudget((current) => ({
      ...current,
      goals: current.goals.map((goal) => (
        goal.id === id
          ? { ...goal, links: [...goal.links, goalLink] }
          : goal
      ))
    }));
  }

  function updateGoalLink(id: string, linkId: string, link: Omit<GoalLink, "id">) {
    const trimmedUrl = link.url.trim();
    const trimmedName = link.name.trim();

    if (!trimmedUrl) {
      return;
    }

    updateBudget((current) => ({
      ...current,
      goals: current.goals.map((goal) => (
        goal.id === id
          ? {
            ...goal,
            links: goal.links.map((goalLink) => (
              goalLink.id === linkId
                ? {
                  id: linkId,
                  name: trimmedName || goalLink.name || "Link",
                  url: trimmedUrl
                }
                : goalLink
            ))
          }
          : goal
      ))
    }));
  }

  function removeGoalLink(id: string, linkId: string) {
    updateBudget((current) => ({
      ...current,
      goals: current.goals.map((goal) => (
        goal.id === id
          ? { ...goal, links: goal.links.filter((link) => link.id !== linkId) }
          : goal
      ))
    }));
  }

  function addGoalSavedAmount(id: string, amount: number) {
    updateBudget((current) => ({
      ...current,
      goals: current.goals.map((goal) => (
        goal.id === id
          ? { ...goal, savedAmount: roundMoney(Math.max(goal.savedAmount + amount, 0)) }
          : goal
      ))
    }));
  }

  function deleteGoal(id: string) {
    updateBudget((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== id)
    }));
  }

  function deleteMonth(monthKey: string) {
    updateBudget((current) => {
      const nextMonths = { ...current.months };

      delete nextMonths[monthKey];

      const remainingMonthKeys = Object.keys(nextMonths).sort();

      if (remainingMonthKeys.length === 0) {
        return {
          ...createEmptyBudget(),
          categories: current.categories,
          goals: current.goals
        };
      }

      if (current.activeMonth !== monthKey) {
        return {
          ...current,
          months: nextMonths
        };
      }

      const previousMonth = remainingMonthKeys.filter((key) => key < monthKey).at(-1);
      const nextMonth = remainingMonthKeys.find((key) => key > monthKey);

      return {
        activeMonth: previousMonth ?? nextMonth ?? remainingMonthKeys[0],
        categories: current.categories,
        goals: current.goals,
        months: nextMonths
      };
    });
  }

  function updateNotes(notes: string) {
    updateBudget((current) => {
      const nextBudget = ensureMonth(current, current.activeMonth);
      const month = nextBudget.months[nextBudget.activeMonth];

      return {
        ...nextBudget,
        months: {
          ...nextBudget.months,
          [nextBudget.activeMonth]: {
            ...month,
            notes
          }
        }
      };
    });
  }

  function deleteIncome(id: string) {
    updateBudget((current) => {
      const month = current.months[current.activeMonth];

      return {
        ...current,
        months: {
          ...current.months,
          [current.activeMonth]: {
            ...month,
            income: month.income.filter((item) => item.id !== id)
          }
        }
      };
    });
  }

  function deleteBill(id: string) {
    updateBudget((current) => {
      const month = current.months[current.activeMonth];

      return {
        ...current,
        months: {
          ...current.months,
          [current.activeMonth]: {
            ...month,
            bills: month.bills.filter((item) => item.id !== id)
          }
        }
      };
    });
  }

  return {
    activeMonth: budget.activeMonth,
    monthKeys,
    categories,
    recurringBills,
    incomes: activeMonthData.income,
    bills: activeMonthData.bills,
    goals: budget.goals,
    notes: activeMonthData.notes,
    ...totals,
    switchMonth,
    copyLastMonth,
    deleteMonth,
    addIncome,
    addBill,
    importBills,
    updateBill,
    toggleBillPaid,
    updateNotes,
    addGoal,
    updateGoal,
    addGoalLink,
    updateGoalLink,
    removeGoalLink,
    addGoalSavedAmount,
    deleteGoal,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteIncome,
    deleteBill
  };
}
