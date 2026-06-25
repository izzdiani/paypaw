"use client";

import { formatMonthLabel } from "@/lib/month-label";

type MonthlyNotesProps = {
  activeMonth: string;
  notes: string;
  onChange: (notes: string) => void;
};

export function MonthlyNotes({ activeMonth, notes, onChange }: MonthlyNotesProps) {
  return (
    <section className="rounded-2xl bg-white/85 p-3 shadow-soft">
      <label className="grid gap-2 text-sm font-bold text-paw-plum">
        {formatMonthLabel(activeMonth)} Notes
        <textarea
          value={notes}
          onChange={(event) => onChange(event.target.value)}
          className="h-24 resize-none rounded-xl border border-paw-lavender bg-paw-cream px-3 py-2 text-sm font-semibold text-paw-plum outline-none focus:border-paw-purple"
          placeholder="Add reminders or money notes for this month."
        />
      </label>
    </section>
  );
}
