"use client";

import { FormEvent, useState } from "react";
import { formatMoney } from "@/lib/format-money";
import { parseMoneyInput } from "@/lib/money";
import type { GoalItem, GoalLink } from "@/lib/types";

type UpcomingGoalsProps = {
  goals: GoalItem[];
  onAdd: (goal: Omit<GoalItem, "id">) => void;
  onAddLink: (id: string, link: Omit<GoalLink, "id">) => void;
  onAddSaved: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, goal: Omit<GoalItem, "id">) => void;
  onRemoveLink: (id: string, linkId: string) => void;
  onUpdateLink: (id: string, linkId: string, link: Omit<GoalLink, "id">) => void;
};

type GoalFormState = {
  name: string;
  targetAmount: string;
  savedAmount: string;
  dueDate: string;
};

type LinkFormState = {
  id: string;
  name: string;
  url: string;
};

const emptyForm: GoalFormState = {
  name: "",
  targetAmount: "",
  savedAmount: "",
  dueDate: ""
};

function getGoalForm(goal?: GoalItem): GoalFormState {
  if (!goal) {
    return emptyForm;
  }

  return {
    name: goal.name,
    targetAmount: String(goal.targetAmount),
    savedAmount: String(goal.savedAmount),
    dueDate: goal.dueDate ?? ""
  };
}

function formatDueDate(dueDate?: string) {
  if (!dueDate) {
    return null;
  }

  const [year, month, day] = dueDate.split("-").map(Number);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

function getProgress(goal: GoalItem) {
  if (goal.targetAmount <= 0) {
    return 0;
  }

  return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
}

export function UpcomingGoals({
  goals,
  onAdd,
  onAddLink,
  onAddSaved,
  onDelete,
  onEdit,
  onRemoveLink,
  onUpdateLink
}: UpcomingGoalsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>(emptyForm);
  const [links, setLinks] = useState<LinkFormState[]>([]);
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [savedInputs, setSavedInputs] = useState<Record<string, string>>({});

  const editingGoal = goals.find((goal) => goal.id === editingId);

  function updateForm(field: keyof GoalFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setLinks([]);
    setNewLink({ name: "", url: "" });
    setIsAdding(false);
    setEditingId(null);
  }

  function startAdd() {
    setIsAdding(true);
    setEditingId(null);
    setForm(emptyForm);
    setLinks([]);
    setNewLink({ name: "", url: "" });
  }

  function startEdit(goal: GoalItem) {
    setEditingId(goal.id);
    setIsAdding(false);
    setForm(getGoalForm(goal));
    setLinks(goal.links.map((link) => ({ ...link })));
    setNewLink({ name: "", url: "" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const targetAmount = parseMoneyInput(form.targetAmount);
    const savedAmount = form.savedAmount ? parseMoneyInput(form.savedAmount) : 0;

    if (!name || Number.isNaN(targetAmount) || targetAmount <= 0 || Number.isNaN(savedAmount)) {
      return;
    }

    const goal = {
      name,
      targetAmount,
      savedAmount: Math.max(savedAmount, 0),
      dueDate: form.dueDate || undefined,
      links: links
        .map((link, index) => ({
          id: link.id,
          name: link.name.trim() || `Link ${index + 1}`,
          url: link.url.trim()
        }))
        .filter((link) => link.url)
    };

    if (editingId) {
      onEdit(editingId, goal);
    } else {
      onAdd(goal);
    }

    resetForm();
  }

  function saveExistingLink(link: LinkFormState) {
    if (!editingId) {
      return;
    }

    onUpdateLink(editingId, link.id, {
      name: link.name,
      url: link.url
    });
  }

  function removeExistingLink(linkId: string) {
    if (!editingId) {
      return;
    }

    onRemoveLink(editingId, linkId);
    setLinks((current) => current.filter((link) => link.id !== linkId));
  }

  function addLinkToEditor() {
    const name = newLink.name.trim();
    const url = newLink.url.trim();

    if (!url) {
      return;
    }

    if (editingId) {
      onAddLink(editingId, { name, url });
      const goalLink = {
        id: crypto.randomUUID(),
        name: name || `Link ${links.length + 1}`,
        url
      };
      setLinks((current) => [...current, goalLink]);
    } else {
      setLinks((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          name: name || `Link ${current.length + 1}`,
          url
        }
      ]);
    }

    setNewLink({ name: "", url: "" });
  }

  function addSavedAmount(goalId: string) {
    const amount = parseMoneyInput(savedInputs[goalId] ?? "");

    if (!Number.isNaN(amount) && amount > 0) {
      onAddSaved(goalId, amount);
      setSavedInputs((current) => ({ ...current, [goalId]: "" }));
    }
  }

  return (
    <section className="rounded-2xl bg-white/85 p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-paw-plum">Upcoming Goals</h2>
        <button
          onClick={startAdd}
          className="rounded-full bg-paw-blush px-3 py-1.5 text-xs font-bold text-paw-purple transition hover:bg-paw-lavender"
          type="button"
        >
          Add
        </button>
      </div>

      {(isAdding || editingId) ? (
        <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-xl bg-paw-cream p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-paw-plum">
              {editingId ? "Edit Goal" : "Add Goal"}
            </h3>
            <button
              onClick={resetForm}
              className="text-lg font-bold text-paw-plum/70"
              type="button"
              aria-label="Close goal editor"
            >
              x
            </button>
          </div>

          <label className="grid gap-1 text-xs font-bold text-paw-plum">
            Goal name
            <input
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
              placeholder="Naim's Birthday"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs font-bold text-paw-plum">
              Target amount
              <input
                value={form.targetAmount}
                onChange={(event) => updateForm("targetAmount", event.target.value)}
                className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
                inputMode="decimal"
                placeholder="100.00"
                type="text"
              />
            </label>
            <label className="grid gap-1 text-xs font-bold text-paw-plum">
              Saved amount
              <input
                value={form.savedAmount}
                onChange={(event) => updateForm("savedAmount", event.target.value)}
                className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
                inputMode="decimal"
                placeholder="0.00"
                type="text"
              />
            </label>
          </div>

          <label className="grid gap-1 text-xs font-bold text-paw-plum">
            Due date
            <input
              value={form.dueDate}
              onChange={(event) => updateForm("dueDate", event.target.value)}
              className="rounded-xl border border-paw-lavender bg-white px-3 py-2 text-sm outline-none focus:border-paw-purple"
              type="date"
            />
          </label>

          <div className="grid gap-2">
            <p className="text-xs font-bold text-paw-plum">Links</p>
            {links.length > 0 ? (
              <ul className="grid gap-2">
                {links.map((link) => (
                  <li key={link.id} className="grid gap-2 rounded-xl bg-white p-2">
                    <input
                      value={link.name}
                      onChange={(event) => setLinks((current) => current.map((item) => (
                        item.id === link.id ? { ...item, name: event.target.value } : item
                      )))}
                      onBlur={() => saveExistingLink(link)}
                      className="rounded-lg border border-paw-lavender bg-paw-cream px-2 py-2 text-sm outline-none focus:border-paw-purple"
                      placeholder="Link name"
                    />
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        value={link.url}
                        onChange={(event) => setLinks((current) => current.map((item) => (
                          item.id === link.id ? { ...item, url: event.target.value } : item
                        )))}
                        onBlur={() => saveExistingLink(link)}
                        className="rounded-lg border border-paw-lavender bg-paw-cream px-2 py-2 text-sm outline-none focus:border-paw-purple"
                        placeholder="https://example.com"
                        type="url"
                      />
                      <button
                        onClick={() => editingId ? removeExistingLink(link.id) : setLinks((current) => current.filter((item) => item.id !== link.id))}
                        className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-semibold text-paw-plum/60">No links yet</p>
            )}

            <div className="grid gap-2 rounded-xl bg-white p-2">
              <input
                value={newLink.name}
                onChange={(event) => setNewLink((current) => ({ ...current, name: event.target.value }))}
                className="rounded-lg border border-paw-lavender bg-paw-cream px-2 py-2 text-sm outline-none focus:border-paw-purple"
                placeholder="Link name"
              />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={newLink.url}
                  onChange={(event) => setNewLink((current) => ({ ...current, url: event.target.value }))}
                  className="rounded-lg border border-paw-lavender bg-paw-cream px-2 py-2 text-sm outline-none focus:border-paw-purple"
                  placeholder="https://example.com"
                  type="url"
                />
                <button
                  onClick={addLinkToEditor}
                  className="rounded-lg bg-paw-blush px-3 py-2 text-xs font-bold text-paw-purple"
                  type="button"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {editingId ? (
              <button
                onClick={() => {
                  onDelete(editingId);
                  resetForm();
                }}
                className="rounded-xl bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
                type="button"
              >
                Delete Goal
              </button>
            ) : (
              <button
                onClick={resetForm}
                className="rounded-xl bg-paw-blush px-3 py-2 text-sm font-bold text-paw-purple"
                type="button"
              >
                Cancel
              </button>
            )}
            <button className="rounded-xl bg-paw-purple px-3 py-2 text-sm font-bold text-white">
              Save Changes
            </button>
          </div>
        </form>
      ) : null}

      {goals.length === 0 ? (
        <p className="text-sm font-semibold text-paw-plum/70">No goals yet</p>
      ) : (
        <ul className="grid gap-2">
          {goals.map((goal) => {
            const progress = getProgress(goal);
            const dueDate = formatDueDate(goal.dueDate);

            return (
              <li key={goal.id} className="rounded-xl bg-paw-cream p-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-paw-plum">{goal.name}</p>
                    <p className="text-xs font-semibold text-paw-purple">
                      {formatMoney(goal.savedAmount)} / {formatMoney(goal.targetAmount)}
                    </p>
                    {dueDate ? (
                      <p className="text-xs font-semibold text-paw-plum/70">Due: {dueDate}</p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => startEdit(goal)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-paw-plum shadow-sm transition hover:bg-paw-lavender"
                    type="button"
                  >
                    Edit
                  </button>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-paw-purple"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={savedInputs[goal.id] ?? ""}
                    onChange={(event) => setSavedInputs((current) => ({
                      ...current,
                      [goal.id]: event.target.value
                    }))}
                    className="rounded-xl border border-paw-lavender bg-white px-3 py-1.5 text-sm outline-none focus:border-paw-purple"
                    inputMode="decimal"
                    placeholder="Add amount"
                    type="text"
                  />
                  <button
                    onClick={() => addSavedAmount(goal.id)}
                    className="rounded-xl bg-paw-purple px-3 py-1.5 text-sm font-bold text-white"
                    type="button"
                  >
                    Add
                  </button>
                </div>

                {goal.links.length > 0 ? (
                  <ul className="mt-2 grid gap-1.5">
                    {goal.links.map((link) => (
                      <li key={link.id} className="rounded-xl bg-white px-2.5 py-1.5">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs font-bold text-paw-purple"
                        >
                          {link.name}
                        </a>
                        <p className="truncate text-xs font-semibold text-paw-plum/60">
                          {link.url}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
