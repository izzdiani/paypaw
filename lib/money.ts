export function parseMoneyInput(value: string) {
  const cleanedValue = value.replace(/[^\d.]/g, "");
  const parsedValue = Number(cleanedValue);

  if (Number.isNaN(parsedValue)) {
    return NaN;
  }

  return roundMoney(parsedValue);
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
