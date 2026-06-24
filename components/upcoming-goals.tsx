"use client";

import { FormEvent, useState } from "react";
import { formatMoney } from "@/lib/format-money";
import type { GoalItem } from "@/lib/types";

type UpcomingGoalsProps = {
  goals: GoalItem[];
  onAdd: (goal: Omit<GoalItem, "id">) => void;
  onAddSaved: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, goal: Omit<GoalItem, "id">) => void;
};

type GoalFormState = {
  name: string;
  targetAmount: string;
  savedAmount: string;
  dueDate: string;
  link: string;
  note: string;
};

const emptyForm: GoalFormState = {
  name: "",
  targetAmount: "",
  savedAmount: "",
  dueDate: "",
  link: "",
  note: ""
};

function getGoalForm(goal?: GoalItem): GoalFormState {
  if (!goal) {
    return emptyForm;
  }

  return {
    name: goal.name,
    targetAmount: String(goal.targetAmount),
    savedAmount: String(goal.savedAmount),
    dueDate: goal.dueDate ?? "",
    link: goal.link ?? "",
    note: goal.note ?? ""
  };
}

function formatDueDate(dueDate?: string) {
  if (!dueDate) {
    return null;
  }

  const [year, month, day] = dueDate.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(year, month - 1, day));
}

export function UpcomingGoals({
  goals,
  onAdd,
  onAddSaved,
  onDelete,
  onEdit
}: UpcomingGoalsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>(emptyForm);
  const [savedInputs, setSavedInputs] = useState<Record<string, string>>({});

  function updateForm(field: keyof GoalFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setIsAdding(false);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const targetAmount = Number(form.targetAmount);
    const savedAmount = Number(form.savedAmount || 0);

    if (!name || Number.isNaN(targetAmount) || targetAmount <= 0 || Number.isNaN(savedAmount)) {
      return;
    }

    const goal = {
      name,
      targetAmount,
      savedAmount: Math.max(savedAmount, 0),
      dueDate: form.dueDate || undefined,
      link: form.link.trim() || undefined,
      note: form.note.trim() || undefined
    };

    if (editingId) {
      onEdit(editingId, goal);
    } else {
      onAdd(goal);
    }

    resetForm();
  }

  function startEdit(goal: GoalItem) {
    setEditingId(goal.id);
    setIsAdding(false);
    setForm(getGoalForm(goal));
  }

  return (
    <section className="rounded-2xl bg-white/85 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-paw-plum">Upcoming Goals</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="rounded-full bg-paw-blush px-3 py-1.5 text-xs font-bold text-paw-purple transition hover:bg-paw-lavender"
          type="button"
        >
          Add
        </button>
      </div>

      {(isAdding || editingId) ? (
        <form onSubmit={handleSubmit} className="mb-4 grid gap-2 rounded-xl bg-paw-cream p-3">
          <input
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
            className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
            placeholder="Goal name"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.targetAmount}
              onChange={(event) => updateForm("targetAmount", event.target.value)}
              className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
              inputMode="decimal"
              placeholder="Target"
              type="number"
            />
            <input
              value={form.savedAmount}
              onChange={(event) => updateForm("savedAmount", event.target.value)}
              className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
              inputMode="decimal"
              placeholder="Saved"
              type="number"
            />
          </div>
          <input
            value={form.dueDate}
            onChange={(event) => updateForm("dueDate", event.target.value)}
            className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
            type="date"
          />
          <input
            value={form.link}
            onChange={(event) => updateForm("link", event.target.value)}
            className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
            placeholder="Link"
          />
          <input
            value={form.note}
            onChange={(event) => updateForm("note", event.target.value)}
            className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
            placeholder="Note"
          />
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-xl bg-paw-purple px-3 py-2 text-sm font-bold text-white">
              Save
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl bg-paw-blush px-3 py-2 text-sm font-bold text-paw-purple"
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {goals.length === 0 ? (
        <p className="text-sm font-semibold text-paw-plum/70">No goals yet</p>
      ) : (
        <ul className="grid gap-3">
          {goals.map((goal) => {
            const progress = goal.targetAmount <= 0
              ? 0
              : Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            const dueDate = formatDueDate(goal.dueDate);

            return (
              <li key={goal.id} className="rounded-xl bg-paw-cream p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-paw-plum">{goal.name}</p>
                    <p className="text-xs font-semibold text-paw-purple">
                      {formatMoney(goal.savedAmount)} / {formatMoney(goal.targetAmount)}
                    </p>
                    {dueDate ? (
                      <p className="text-xs font-semibold text-paw-plum/70">Due {dueDate}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {goal.link ? (
                      <a
                        href={goal.link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white px-2 py-1 text-xs font-bold text-paw-purple"
                      >
                        Open Link
                      </a>
                    ) : null}
                    <button
                      onClick={() => startEdit(goal)}
                      className="rounded-full bg-paw-lavender px-2 py-1 text-xs font-bold text-paw-plum"
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(goal.id)}
                      className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-paw-purple"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs font-bold text-paw-purple">
                  {Math.round(progress)}%
                </p>

                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={savedInputs[goal.id] ?? ""}
                    onChange={(event) => setSavedInputs((current) => ({
                      ...current,
                      [goal.id]: event.target.value
                    }))}
                    className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
                    inputMode="decimal"
                    placeholder="Add saved amount"
                    type="number"
                  />
                  <button
                    onClick={() => {
                      const amount = Number(savedInputs[goal.id]);

                      if (!Number.isNaN(amount) && amount > 0) {
                        onAddSaved(goal.id, amount);
                        setSavedInputs((current) => ({ ...current, [goal.id]: "" }));
                      }
                    }}
                    className="rounded-xl bg-paw-purple px-3 py-2 text-sm font-bold text-white"
                    type="button"
                  >
                    Add
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
