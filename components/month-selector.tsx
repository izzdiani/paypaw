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
    <section className="rounded-2xl bg-white/85 p-3 shadow-soft">
      <div className="mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          aria-label="Previous year"
          onClick={() => moveYear(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-paw-blush text-lg font-bold text-paw-purple transition hover:bg-paw-lavender"
          type="button"
        >
          &lt;
        </button>

        <div className="justify-self-center rounded-full bg-paw-purple px-5 py-1.5 text-center text-sm font-bold text-white">
          {activeYear}
        </div>

        <button
          aria-label="Next year"
          onClick={() => moveYear(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-paw-blush text-lg font-bold text-paw-purple transition hover:bg-paw-lavender"
          type="button"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {months.map((month, index) => {
          const monthKey = getMonthKey(activeYear, index);
          const isActive = monthKey === activeMonth;
          const hasBudget = budgetMonths.has(monthKey);

          return (
            <button
              key={monthKey}
              onClick={() => onChange(monthKey)}
              className={`relative flex h-9 items-center justify-center rounded-xl text-xs font-bold transition ${
                isActive
                  ? "bg-paw-purple text-white shadow-soft"
                  : hasBudget
                    ? "bg-paw-blush text-paw-plum hover:bg-paw-lavender"
                    : "bg-paw-cream text-paw-plum hover:bg-paw-blush"
              }`}
              type="button"
            >
              {month}
              {hasBudget && !isActive ? (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-paw-purple" />
              ) : null}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleDeleteMonth}
        className="mt-2 w-full rounded-xl bg-red-100 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200"
        type="button"
      >
        Delete Month
      </button>
    </section>
  );
}
