export type MoneyItem = {
  id: string;
  name: string;
  amount: number;
  category?: string;
  type?: "bill" | "expense";
  dueDate?: string;
  isRecurring?: boolean;
  recurringInterval?: number | null;
  lastAddedMonth?: string | null;
  recurringId?: string | null;
  isPaid?: boolean;
};

export type BudgetMonth = {
  income: MoneyItem[];
  bills: MoneyItem[];
  goals: GoalItem[];
  notes: string;
};

export type BudgetData = {
  activeMonth: string;
  categories: CategoryItem[];
  months: Record<string, BudgetMonth>;
};

export type CategoryItem = {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
};

export type GoalItem = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  dueDate?: string;
  links: GoalLink[];
};

export type GoalLink = {
  id: string;
  name: string;
  url: string;
};
