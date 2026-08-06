import { DaySlotCounts } from './requestTypes';

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateShort(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDayName(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'long' });
}

export function formatDateFull(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateRange(startDate: string, endDate: string) {
  return startDate === endDate
    ? formatDateFull(startDate)
    : `${formatDateFull(startDate)} – ${formatDateFull(endDate)}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekStart(dateStr: string): string {
  const day = parseDate(dateStr).getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(dateStr, diffToMonday);
}

export function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  if (!startStr || !endStr || end < start) return startStr ? [startStr] : [];
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(
      `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(cur.getDate()).padStart(2, '0')}`
    );
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function emptyCounts(): DaySlotCounts {
  return { inbound: 0, outbound: 0, twoWay: 0 };
}

export function rowTotal(c: DaySlotCounts) {
  return c.inbound + c.outbound + c.twoWay * 2;
}

export function slotBreakdownText(c: DaySlotCounts) {
  return `Inbound: ${c.inbound} · Outbound: ${c.outbound} · Two-way: ${c.twoWay}`;
}

export function formatHourRange(hour: number): string {
  const start = String(hour).padStart(2, '0');
  const end = String((hour + 1) % 24).padStart(2, '0');
  return `${start}:00 - ${end}:00`;
}

// Simulates an hourly breakdown of a day's slot counts — there is no real
// per-hour data source yet, so counts are spread across a fixed set of
// representative hours (same approach used by the FMT allocation table).
export function distributeDailySlotsToHours(counts: DaySlotCounts): Record<number, DaySlotCounts> {
  const hourly: Record<number, DaySlotCounts> = {};
  for (let h = 0; h < 24; h++) {
    hourly[h] = { inbound: 0, outbound: 0, twoWay: 0 };
  }

  const inboundHours = [8, 10, 12, 14, 16, 9, 11, 13, 15, 17];
  for (let i = 0; i < counts.inbound; i++) {
    hourly[inboundHours[i % inboundHours.length]].inbound++;
  }

  const outboundHours = [9, 11, 13, 15, 17, 8, 10, 12, 14, 16];
  for (let i = 0; i < counts.outbound; i++) {
    hourly[outboundHours[i % outboundHours.length]].outbound++;
  }

  const twoWayHours = [10, 14, 11, 15, 8, 12, 16];
  for (let i = 0; i < counts.twoWay; i++) {
    hourly[twoWayHours[i % twoWayHours.length]].twoWay++;
  }

  return hourly;
}
