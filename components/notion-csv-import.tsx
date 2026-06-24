"use client";

import { ChangeEvent, useRef, useState } from "react";
import { formatMoney } from "@/lib/format-money";
import { formatMonthLabel } from "@/lib/month-label";
import type { CategoryItem, MoneyItem } from "@/lib/types";

type ImportItem = Omit<MoneyItem, "id"> & {
  name: string;
  amount: number;
  type: "bill" | "expense";
};

type NotionCsvImportProps = {
  activeMonth: string;
  categories: CategoryItem[];
  currentBills: MoneyItem[];
  onImport: (items: ImportItem[]) => void;
};

const billKeywords = [
  "rent",
  "wifi",
  "internet",
  "phone",
  "insurance",
  "loan",
  "mortgage",
  "netflix",
  "spotify",
  "google",
  "subscription",
  "electricity",
  "water",
  "utilities"
];

const categoryKeywords: Record<string, string[]> = {
  Housing: ["rent", "house", "room"],
  Bills: ["wifi", "internet", "phone", "google", "netflix", "spotify", "subscription", "electricity", "water", "utilities"],
  Food: ["groceries", "food", "eating", "restaurant", "lunch", "dinner"],
  Transport: ["fuel", "petrol", "grab", "toll", "parking", "car"],
  Education: ["school", "class", "book", "course", "tuition"],
  Selfcare: ["self care", "skincare", "hair", "makeup"],
  Gift: ["birthday", "bday", "anniversary", "gift"],
  Debt: ["loan", "debt", "paylater", "installment"]
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = "";
  let isInsideQuotes = false;

  for (const character of line) {
    if (character === "\"") {
      isInsideQuotes = !isInsideQuotes;
    } else if (character === "," && !isInsideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += character;
    }
  }

  values.push(currentValue.trim());

  return values;
}

function guessType(name: string): "bill" | "expense" {
  const normalizedName = name.toLowerCase();

  return billKeywords.some((keyword) => normalizedName.includes(keyword))
    ? "bill"
    : "expense";
}

function getCategoryFromCsv(name: string, remarks: string, categories: CategoryItem[]) {
  const normalizedRemarks = remarks.trim().toLowerCase();
  const matchingRemarkCategory = categories.find((category) => (
    category.name.toLowerCase() === normalizedRemarks
  ));

  if (matchingRemarkCategory) {
    return matchingRemarkCategory.name;
  }

  const normalizedName = name.toLowerCase();
  const matchedCategoryName = Object.entries(categoryKeywords).find(([, keywords]) => (
    keywords.some((keyword) => normalizedName.includes(keyword))
  ))?.[0];

  return categories.find((category) => category.name === matchedCategoryName)?.name
    ?? categories.find((category) => category.name === "Bills")?.name;
}

function parseCsv(text: string, categories: CategoryItem[]): ImportItem[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());

  return lines.slice(1).flatMap((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const name = row.name?.trim();
    const amount = Number(row.amount);

    if (!name || Number.isNaN(amount)) {
      return [];
    }

    return [{
      name,
      amount,
      category: getCategoryFromCsv(name, row.remarks ?? "", categories),
      type: guessType(name),
      isPaid: row.status?.trim().toLowerCase() === "paid",
      recurringInterval: null,
      lastAddedMonth: null,
      recurringId: null,
      isRecurring: false
    }];
  });
}

export function NotionCsvImport({
  activeMonth,
  categories,
  currentBills,
  onImport
}: NotionCsvImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [showDuplicateOptions, setShowDuplicateOptions] = useState(false);

  const currentNames = new Set(currentBills.map((bill) => bill.name.trim().toLowerCase()));
  const hasDuplicates = items.some((item) => currentNames.has(item.name.trim().toLowerCase()));

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setItems(parseCsv(String(reader.result ?? ""), categories));
      setShowDuplicateOptions(false);
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  function updateItemType(index: number, type: "bill" | "expense") {
    setItems((currentItems) => currentItems.map((item, itemIndex) => (
      itemIndex === index
        ? {
            ...item,
            type,
            recurringInterval: type === "expense" ? null : item.recurringInterval,
            isRecurring: type === "bill" && Boolean(item.recurringInterval)
          }
        : item
    )));
  }

  function importItems(skipDuplicates: boolean) {
    const itemsToImport = skipDuplicates
      ? items.filter((item) => !currentNames.has(item.name.trim().toLowerCase()))
      : items;

    onImport(itemsToImport);
    setItems([]);
    setShowDuplicateOptions(false);
  }

  return (
    <section className="grid gap-3">
      <input
        ref={fileInputRef}
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-full bg-paw-blush px-4 py-2 text-sm font-bold text-paw-purple shadow-soft transition hover:bg-paw-lavender"
        type="button"
      >
        Import CSV
      </button>

      {items.length > 0 ? (
        <div className="grid gap-3 rounded-2xl bg-white/85 p-4 shadow-soft">
          <p className="text-sm font-bold text-paw-plum">
            Import {items.length} items into {formatMonthLabel(activeMonth)}
          </p>

          <ul className="grid gap-2">
            {items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="grid gap-2 rounded-xl bg-paw-cream p-3 sm:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-paw-plum">{item.name}</p>
                  <p className="text-sm font-semibold text-paw-purple">{formatMoney(item.amount)}</p>
                </div>

                <select
                  value={item.type}
                  onChange={(event) => updateItemType(index, event.target.value as "bill" | "expense")}
                  className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm font-bold text-paw-plum outline-none focus:border-paw-purple"
                >
                  <option value="bill">Bill</option>
                  <option value="expense">Expense</option>
                </select>
              </li>
            ))}
          </ul>

          {hasDuplicates && showDuplicateOptions ? (
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-paw-plum">
                Some items already exist in this month.
              </p>
              <button
                onClick={() => importItems(true)}
                className="rounded-xl bg-paw-purple px-4 py-3 text-sm font-bold text-white"
                type="button"
              >
                Skip Duplicates
              </button>
              <button
                onClick={() => importItems(false)}
                className="rounded-xl bg-paw-blush px-4 py-3 text-sm font-bold text-paw-purple"
                type="button"
              >
                Import All
              </button>
              <button
                onClick={() => {
                  setItems([]);
                  setShowDuplicateOptions(false);
                }}
                className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-paw-plum"
                type="button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setItems([]);
                  setShowDuplicateOptions(false);
                }}
                className="rounded-xl bg-paw-blush px-4 py-3 text-sm font-bold text-paw-purple"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (hasDuplicates) {
                    setShowDuplicateOptions(true);
                    return;
                  }

                  importItems(false);
                }}
                className="rounded-xl bg-paw-purple px-4 py-3 text-sm font-bold text-white"
                type="button"
              >
                Import
              </button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
