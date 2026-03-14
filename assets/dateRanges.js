export function startOfIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfIsoWeek(date = new Date()) {
  const start = startOfIsoWeek(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export function startOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0));
}

export function endOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999));
}

export function startOfQuarter(date = new Date()) {
  const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(Date.UTC(date.getFullYear(), quarterMonth, 1, 0, 0, 0, 0));
}

export function endOfQuarter(date = new Date()) {
  const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(Date.UTC(date.getFullYear(), quarterMonth + 3, 0, 23, 59, 59, 999));
}

export function inRange(date, start, end) {
  const d = new Date(date);
  return d >= start && d <= end;
}

export function isoWeekToDateRange(key) {
  const match = String(key || '').match(/(\d{4})-W(\d{1,2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const weekStart = startOfIsoWeek(jan4);
  weekStart.setUTCDate(weekStart.getUTCDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return { start: weekStart, end: weekEnd };
}
