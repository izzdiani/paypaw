"use client";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

type MonthSelectorProps = {
  activeMonth: string;
  monthKeys: string[];
  onChange: (monthKey: string) => void;
  onDeleteMonth: (monthKey: string) => void;
};

function getYearFromMonthKey(monthKey: string) {
  return Number(monthKey.split("-")[0]);
}

function getMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function MonthSelector({
  activeMonth,
  monthKeys,
  onChange,
  onDeleteMonth
}: MonthSelectorProps) {
  const activeYear = getYearFromMonthKey(activeMonth);
  const budgetMonths = new Set(monthKeys);

  function handleDeleteMonth() {
    if (window.confirm("Delete this month? This cannot be undone.")) {
      onDeleteMonth(activeMonth);
    }
  }

  function moveYear(direction: -1 | 1) {
    const nextYear = activeYear + direction;
    const currentMonth = Number(activeMonth.split("-")[1]) - 1;

    onChange(getMonthKey(nextYear, currentMonth));
  }

  return (
    <section className="rounded-2xl bg-white/85 p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          aria-label="Previous year"
          onClick={() => moveYear(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-paw-blush text-xl font-bold text-paw-purple transition hover:bg-paw-lavender"
          type="button"
        >
          &lt;
        </button>

        <div className="rounded-full bg-paw-purple px-6 py-2 text-center text-base font-bold text-white">
          {activeYear}
        </div>

        <button
          aria-label="Next year"
          onClick={() => moveYear(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-paw-blush text-xl font-bold text-paw-purple transition hover:bg-paw-lavender"
          type="button"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => {
          const monthKey = getMonthKey(activeYear, index);
          const isActive = monthKey === activeMonth;
          const hasBudget = budgetMonths.has(monthKey);

          return (
            <button
              key={monthKey}
              onClick={() => onChange(monthKey)}
              className={`flex min-h-16 flex-col items-center justify-center rounded-2xl text-sm font-bold transition ${
                isActive
                  ? "bg-paw-purple text-white shadow-soft"
                  : hasBudget
                    ? "bg-paw-blush text-paw-plum hover:bg-paw-lavender"
                    : "bg-paw-cream text-paw-plum hover:bg-paw-blush"
              }`}
              type="button"
            >
              <span>{month}</span>
              <span
                className={`mt-2 h-1.5 w-1.5 rounded-full ${
                  hasBudget && !isActive ? "bg-paw-purple" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <button
        onClick={handleDeleteMonth}
        className="mt-3 w-full rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-200"
        type="button"
      >
        Delete Month
      </button>
    </section>
  );
}
