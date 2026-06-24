"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { formatCategoryLabel } from "@/lib/default-categories";
import type { CategoryItem } from "@/lib/types";
import { useBudgetStorage } from "@/lib/use-budget-storage";

export function SettingsPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useBudgetStorage();
  const [emoji, setEmoji] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setEmoji("");
    setName("");
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const category = {
      emoji: emoji.trim() || undefined,
      name: trimmedName
    };

    if (editingId) {
      updateCategory(editingId, category);
    } else {
      addCategory(category);
    }

    resetForm();
  }

  function startEdit(category: CategoryItem) {
    setEditingId(category.id);
    setEmoji(category.emoji ?? "");
    setName(category.name);
  }

  return (
    <AppShell>
      <div className="grid gap-4">
        <section className="rounded-2xl bg-white/85 p-4 shadow-soft">
          <h2 className="mb-3 text-sm font-bold text-paw-plum">Categories</h2>

          <form onSubmit={handleSubmit} className="grid gap-2">
            <div className="grid grid-cols-[5rem_1fr] gap-2">
              <input
                value={emoji}
                onChange={(event) => setEmoji(event.target.value)}
                className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 text-center outline-none focus:border-paw-purple"
                placeholder="Emoji"
              />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
                placeholder="Category name"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-xl bg-paw-purple px-4 py-3 text-sm font-bold text-white">
                {editingId ? "Save Category" : "Add Category"}
              </button>
              <button
                onClick={resetForm}
                className="rounded-xl bg-paw-blush px-4 py-3 text-sm font-bold text-paw-purple"
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>

        <ul className="grid gap-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white/85 p-4 shadow-soft"
            >
              <span className="truncate text-sm font-bold text-paw-plum">
                {formatCategoryLabel(category)}
              </span>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(category)}
                  className="rounded-full bg-paw-lavender px-3 py-2 text-sm font-bold text-paw-plum"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="rounded-full bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
