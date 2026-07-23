const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MAX_MONTHS_IN_RANGE = 60;

export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}`;
}

export function ukDateToMonthKey(ukDate: string): string {
  const [day, month, year] = ukDate.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return `${MONTH_LABELS[month - 1]}-${String(year).slice(-2)}`;
}

export function generateMonthRange(start: string, end: string): string[] {
  if (!start || !end) return [];

  const [startYear, startMonth] = start.split('-').map(Number);
  const [endYear, endMonth] = end.split('-').map(Number);
  let cursor = new Date(startYear, startMonth - 1, 1);
  const last = new Date(endYear, endMonth - 1, 1);

  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) {
    return [];
  }

  const months: string[] = [];
  while (cursor <= last && months.length < MAX_MONTHS_IN_RANGE) {
    months.push(toMonthKey(cursor));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return months;
}
