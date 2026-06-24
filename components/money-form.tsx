"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatCategoryLabel } from "@/lib/default-categories";
import { parseMoneyInput } from "@/lib/money";
import type { CategoryItem, MoneyItem } from "@/lib/types";

type MoneyFormProps = {
  buttonLabel: string;
  categories?: CategoryItem[];
  includeCategory?: boolean;
  initialType?: "bill" | "expense";
  nameLabel: string;
  onAdd: (item: Omit<MoneyItem, "id">) => void;
};

export function MoneyForm({
  buttonLabel,
  categories = [],
  includeCategory = false,
  initialType = "bill",
  nameLabel,
  onAdd
}: MoneyFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState<"bill" | "expense">(initialType);
  const [recurringInterval, setRecurringInterval] = useState("");

  useEffect(() => {
    if (includeCategory) {
      setItemType(initialType);
    }
  }, [includeCategory, initialType]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedAmount = parseMoneyInput(amount);
    const parsedRecurringInterval = recurringInterval ? Number(recurringInterval) : null;

    if (
      !trimmedName ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      (parsedRecurringInterval !== null &&
        (Number.isNaN(parsedRecurringInterval) || parsedRecurringInterval <= 0))
    ) {
      return;
    }

    onAdd({
      name: trimmedName,
      amount: parsedAmount,
      category: category.trim() || undefined,
      type: includeCategory ? itemType : undefined,
      recurringInterval: includeCategory ? parsedRecurringInterval : null
    });

    setName("");
    setAmount("");
    setCategory("");
    setItemType(initialType);
    setRecurringInterval("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/85 p-4 shadow-soft">
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-semibold text-paw-plum">
          {nameLabel}
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
            placeholder="Name"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-paw-plum">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
            inputMode="decimal"
            placeholder="0.00"
            type="text"
          />
        </label>

        {includeCategory ? (
          <>
            <label className="grid gap-1 text-sm font-semibold text-paw-plum">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
              >
                <option value="">No category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.name}>
                    {formatCategoryLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-semibold text-paw-plum">
              Type
              <select
                value={itemType}
                onChange={(event) => setItemType(event.target.value as "bill" | "expense")}
                className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
              >
                <option value="bill">Bill</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-semibold text-paw-plum">
              Repeat Interval
              <input
                value={recurringInterval}
                onChange={(event) => setRecurringInterval(event.target.value)}
                className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
                inputMode="numeric"
                min="1"
                placeholder="Optional, e.g. 1 for monthly"
                step="1"
                type="number"
              />
            </label>
          </>
        ) : null}

        <button className="rounded-xl bg-paw-purple px-4 py-3 font-bold text-white shadow-soft transition hover:bg-paw-plum">
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
