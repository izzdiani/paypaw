import type { CategoryItem } from "@/lib/types";

export const defaultCategories: CategoryItem[] = [
  { id: "housing", emoji: "🏠", name: "Housing" },
  { id: "bills", emoji: "📱", name: "Bills" },
  { id: "education", emoji: "🎓", name: "Education" },
  { id: "food", emoji: "🍔", name: "Food" },
  { id: "transport", emoji: "🚗", name: "Transport" },
  { id: "selfcare", emoji: "💄", name: "Selfcare" },
  { id: "gift", emoji: "🎁", name: "Gift" },
  { id: "debt", emoji: "🧾", name: "Debt" }
];

export function formatCategoryLabel(category: Pick<CategoryItem, "emoji" | "name">) {
  return `${category.emoji ? `${category.emoji} ` : ""}${category.name}`;
}
