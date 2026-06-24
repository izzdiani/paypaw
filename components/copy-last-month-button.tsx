"use client";

type CopyLastMonthButtonProps = {
  hasCurrentMonthData: boolean;
  onCopy: () => void;
};

export function CopyLastMonthButton({
  hasCurrentMonthData,
  onCopy
}: CopyLastMonthButtonProps) {
  function handleCopy() {
    if (
      hasCurrentMonthData &&
      !window.confirm("This month already has data. Copy last month anyway?")
    ) {
      return;
    }

    onCopy();
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full rounded-full bg-paw-blush px-4 py-2 text-sm font-bold text-paw-purple shadow-soft transition hover:bg-paw-lavender"
      type="button"
    >
      Copy Month
    </button>
  );
}
