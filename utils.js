export function getYesterday() {
  const today = new Date();

  today.setDate(today.getDate() - 1);

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getToday() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const formatRate = (rate, base, target) =>
  `${rate.toString()} ${target}/${base}`;

export const getTrendArrow = (currentRate, previousRate) => {
  if (currentRate > previousRate) return "↗";
  if (currentRate < previousRate) return "↘";
  return "→";
};
