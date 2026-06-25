"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { formatCategoryLabel } from "@/lib/default-categories";
import type { CategoryItem, MoneyItem } from "@/lib/types";

type UnpaidItemsProps = {
  categories?: CategoryItem[];
  items: MoneyItem[];
  onTogglePaid: (id: string) => void;
};

export function UnpaidItems({ categories = [], items, onTogglePaid }: UnpaidItemsProps) {
  const unpaidBills = items.filter((item) => (
    (item.type ?? "bill") === "bill" && item.isPaid !== true
  )).sort((first, second) => second.amount - first.amount);

  return (
    <section className="rounded-2xl bg-white/85 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-paw-plum">Unpaid Items</h2>
        <Link
          href="/bills?type=bill"
          className="rounded-full bg-paw-blush px-3 py-1.5 text-xs font-bold text-paw-purple transition hover:bg-paw-lavender"
        >
          Manage Bills
        </Link>
      </div>

      {unpaidBills.length === 0 ? (
        <p className="text-sm font-semibold text-paw-plum/70">All bills paid</p>
      ) : (
        <ul className="grid gap-2">
          {unpaidBills.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-paw-cream p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label={`Mark ${item.name} paid`}
                  onClick={() => onTogglePaid(item.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-paw-lilac bg-white text-paw-purple transition hover:bg-paw-blush"
                  type="button"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-paw-plum">{item.name}</p>
                  {item.category ? (
                    <p className="truncate text-xs font-semibold text-paw-plum/70">
                      {formatCategoryLabel(categories.find((category) => category.name === item.category) ?? { name: item.category })}
                    </p>
                  ) : null}
                </div>
              </div>

              <p className="shrink-0 text-sm font-bold text-paw-purple">
                {formatMoney(item.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
