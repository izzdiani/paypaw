"use client";

import { FormEvent, useState } from "react";
import { formatMoney } from "@/lib/format-money";
import { formatCategoryLabel } from "@/lib/default-categories";
import type { CategoryItem, MoneyItem } from "@/lib/types";

type MoneyListProps = {
  categories?: CategoryItem[];
  emptyMessage: string;
  items: MoneyItem[];
  onDelete: (id: string) => void;
  onEdit?: (
    id: string,
    item: Pick<MoneyItem, "name" | "amount" | "category" | "type" | "recurringInterval">
  ) => void;
  onTogglePaid?: (id: string) => void;
};

export function MoneyList({
  categories = [],
  emptyMessage,
  items,
  onDelete,
  onEdit,
  onTogglePaid
}: MoneyListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState<"bill" | "expense">("bill");
  const [editRecurringInterval, setEditRecurringInterval] = useState("");

  function startEdit(item: MoneyItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditAmount(String(item.amount));
    setEditCategory(item.category ?? "");
    setEditType(item.type ?? "bill");
    setEditRecurringInterval(item.recurringInterval ? String(item.recurringInterval) : "");
  }

  function stopEdit() {
    setEditingId(null);
    setEditName("");
    setEditAmount("");
    setEditCategory("");
    setEditType("bill");
    setEditRecurringInterval("");
  }

  function handleSave(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();

    const parsedAmount = Number(editAmount);
    const parsedRecurringInterval = editRecurringInterval ? Number(editRecurringInterval) : null;
    const trimmedName = editName.trim();

    if (
      !onEdit ||
      !trimmedName ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      (parsedRecurringInterval !== null &&
        (Number.isNaN(parsedRecurringInterval) || parsedRecurringInterval <= 0))
    ) {
      return;
    }

    onEdit(id, {
      name: trimmedName,
      amount: parsedAmount,
      category: editCategory.trim() || undefined,
      type: editType,
      recurringInterval: editType === "bill" ? parsedRecurringInterval : null
    });
    stopEdit();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-paw-lilac bg-white/60 p-5 text-center text-sm font-semibold text-paw-plum">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl bg-white/85 p-4 shadow-soft"
        >
          {editingId === item.id ? (
            <form onSubmit={(event) => handleSave(event, item.id)} className="grid gap-3">
              <label className="grid gap-1 text-sm font-semibold text-paw-plum">
                Bill name
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-paw-plum">
                Amount
                <input
                  value={editAmount}
                  onChange={(event) => setEditAmount(event.target.value)}
                  className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  type="number"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-paw-plum">
                Category
                <select
                  value={editCategory}
                  onChange={(event) => setEditCategory(event.target.value)}
                  className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {formatCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-semibold text-paw-plum">
                Type
                <select
                  value={editType}
                  onChange={(event) => {
                    const nextType = event.target.value as "bill" | "expense";
                    setEditType(nextType);

                    if (nextType === "expense") {
                      setEditRecurringInterval("");
                    }
                  }}
                  className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
                >
                  <option value="bill">Bill</option>
                  <option value="expense">Expense</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm font-semibold text-paw-plum">
                Repeat Interval
                <input
                  value={editRecurringInterval}
                  onChange={(event) => setEditRecurringInterval(event.target.value)}
                  className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple disabled:opacity-50"
                  disabled={editType === "expense"}
                  inputMode="numeric"
                  min="1"
                  placeholder="Optional, e.g. 1 for monthly"
                  step="1"
                  type="number"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-xl bg-paw-purple px-4 py-3 text-sm font-bold text-white transition hover:bg-paw-plum">
                  Save
                </button>
                <button
                  onClick={stopEdit}
                  className="rounded-xl bg-paw-blush px-4 py-3 text-sm font-bold text-paw-purple transition hover:bg-paw-lavender"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl transition-all duration-200 ${
                item.isPaid ? "bg-green-50/80 p-2" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                {onTogglePaid ? (
                  <button
                    aria-label={item.isPaid ? "Mark bill unpaid" : "Mark bill paid"}
                    onClick={() => onTogglePaid(item.id)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-200 ${
                      item.isPaid
                        ? "scale-105 border-green-500 bg-green-500 text-white"
                        : "border-paw-lilac bg-paw-cream text-paw-purple hover:bg-paw-blush"
                    }`}
                    type="button"
                  >
                    {item.isPaid ? "✓" : ""}
                  </button>
                ) : null}

                <div className={`min-w-0 transition-opacity ${item.isPaid ? "opacity-55" : ""}`}>
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className={`truncate font-bold text-paw-plum ${item.isPaid ? "line-through" : ""}`}>
                      {item.name}
                    </p>
                    <span className="rounded-full bg-paw-blush px-2 py-0.5 text-xs font-bold text-paw-purple">
                      {(item.type ?? "bill") === "bill" ? "Bill" : "Expense"}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold text-paw-purple ${item.isPaid ? "line-through" : ""}`}>
                    {formatMoney(item.amount)}
                  </p>
                  {(item.type ?? "bill") === "bill" && item.recurringInterval ? (
                    <p className="mt-1 truncate text-xs font-semibold text-paw-purple">
                      Repeats every {item.recurringInterval} month{item.recurringInterval === 1 ? "" : "s"}
                    </p>
                  ) : null}
                {item.category ? (
                    <p className="mt-1 inline-flex w-fit max-w-full truncate rounded-full bg-paw-blush px-2 py-0.5 text-xs font-bold text-paw-purple">
                      {formatCategoryLabel(categories.find((category) => category.name === item.category) ?? { name: item.category })}
                    </p>
                ) : null}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {onEdit ? (
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded-full bg-paw-lavender px-3 py-2 text-sm font-bold text-paw-plum transition hover:bg-paw-lilac"
                    type="button"
                  >
                    Edit
                  </button>
                ) : null}
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded-full bg-paw-blush px-3 py-2 text-sm font-bold text-paw-purple transition hover:bg-paw-lavender"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
