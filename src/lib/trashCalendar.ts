import type { DenverNow } from './denverClock';

/** Monday=1 … Friday=5. Saturday=6 is only used after a Friday holiday delay. */
export type ServiceDow = 1 | 2 | 3 | 4 | 5;

export const SERVICE_DAYS: Array<{ id: ServiceDow; label: string }> = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
];

export const DOW_LABEL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Ymd = { year: number; month: number; date: number; dow: number };

function lastMondayOfMay(year: number): number {
  const d = new Date(Date.UTC(year, 5, 0)); // last day of May
  const dow = d.getUTCDay();
  const offset = dow === 0 ? 6 : dow - 1;
  return d.getUTCDate() - offset;
}

function firstMondayOfSeptember(year: number): number {
  const d = new Date(Date.UTC(year, 8, 1));
  const dow = d.getUTCDay();
  const add = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
  return 1 + add;
}

function fourthThursdayOfNovember(year: number): number {
  const d = new Date(Date.UTC(year, 10, 1));
  const dow = d.getUTCDay();
  const firstThu = 1 + ((4 - dow + 7) % 7);
  return firstThu + 21;
}

export type ObservedHoliday = { name: string; year: number; month: number; date: number; dow: number };

/** Republic Fort Collins: these six observed weekdays delay collection one day. */
export function republicHolidays(year: number): ObservedHoliday[] {
  const rows: Array<{ name: string; month: number; date: number }> = [
    { name: "New Year's Day", month: 1, date: 1 },
    { name: 'Memorial Day', month: 5, date: lastMondayOfMay(year) },
    { name: 'Independence Day', month: 7, date: 4 },
    { name: 'Labor Day', month: 9, date: firstMondayOfSeptember(year) },
    { name: 'Thanksgiving', month: 11, date: fourthThursdayOfNovember(year) },
    { name: 'Christmas Day', month: 12, date: 25 },
  ];
  return rows.map((r) => {
    const dow = new Date(Date.UTC(year, r.month - 1, r.date)).getUTCDay();
    return { name: r.name, year, month: r.month, date: r.date, dow };
  });
}

function mondayOf(ymd: Ymd): Ymd {
  const utc = Date.UTC(ymd.year, ymd.month - 1, ymd.date);
  const date = new Date(utc);
  const back = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - back);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    date: date.getUTCDate(),
    dow: 1,
  };
}

function sameDay(a: Ymd, b: ObservedHoliday): boolean {
  return a.year === b.year && a.month === b.month && a.date === b.date;
}

/** Weekday holiday in this Monday–Friday service week, if any. */
export function holidayThisServiceWeek(ymd: Ymd): ObservedHoliday | null {
  const monday = mondayOf(ymd);
  const years = [monday.year, ymd.year];
  const holidays = [...new Set(years)].flatMap(republicHolidays);
  for (let i = 0; i < 5; i += 1) {
    const d = new Date(Date.UTC(monday.year, monday.month - 1, monday.date + i));
    const cur: Ymd = {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      date: d.getUTCDate(),
      dow: d.getUTCDay(),
    };
    const hit = holidays.find((h) => sameDay(cur, h) && h.dow >= 1 && h.dow <= 5);
    if (hit) return hit;
  }
  return null;
}

/** Observed weekday holiday in the previous Monday–Friday service week, if any. */
export function holidayLastServiceWeek(ymd: Ymd): ObservedHoliday | null {
  return holidayThisServiceWeek(addDays(ymd, -7));
}

/** Actual pickup weekday (1–6) after a Republic one-day holiday bump. */
export function actualPickupDow(regular: ServiceDow, ymd: Ymd): number {
  const hol = holidayThisServiceWeek(ymd);
  if (!hol || hol.dow < 1 || hol.dow > 5) return regular;
  if (regular < hol.dow) return regular;
  return regular + 1;
}

export function isPickupDay(regular: ServiceDow, ymd: Ymd): boolean {
  return ymd.dow === actualPickupDow(regular, ymd);
}

/**
 * Weekday chip if the user picked one, otherwise the neighborhood's mapped day.
 * Picking a location writes the mapped day into the chip, so the two stay in sync
 * until the user taps a different weekday — and that tap must not clear the location.
 */
export function effectiveServiceDow(
  override: ServiceDow | null | undefined,
  mapped: ServiceDow | null | undefined,
): ServiceDow | null {
  return override ?? mapped ?? null;
}

/** Cart rows follow the actual pickup weekday. Out today only when that day is today. */
export function cartDayKind(todayDow: number, pickupDow: number | null): 'pick' | 'out-today' | 'weekday' {
  if (pickupDow == null) return 'pick';
  if (todayDow === pickupDow) return 'out-today';
  return 'weekday';
}

export function yardTrimmingsSeason(ymd: Ymd, town?: string): boolean {
  const md = ymd.month * 100 + ymd.date;
  if (town === 'Loveland') return md >= 330 && md <= 1204;
  return md >= 401 && md <= 1130;
}

export function addDays(ymd: Ymd, days: number): Ymd {
  const d = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.date + days));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    date: d.getUTCDate(),
    dow: d.getUTCDay(),
  };
}

export function formatYmd(ymd: Ymd): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${DOW_LABEL[ymd.dow]}, ${months[ymd.month - 1]} ${ymd.date}`;
}

export function fromDenverNow(now: DenverNow): Ymd {
  return { year: now.year, month: now.month, date: now.date, dow: now.dow };
}

export function nextPickup(regular: ServiceDow, from: Ymd): { when: Ymd; delayed: boolean; holiday: ObservedHoliday | null } {
  for (let i = 0; i < 8; i += 1) {
    const when = addDays(from, i);
    if (isPickupDay(regular, when)) {
      const delayed = actualPickupDow(regular, when) !== regular;
      return { when, delayed, holiday: delayed ? holidayThisServiceWeek(when) : null };
    }
  }
  return { when: from, delayed: false, holiday: null };
}
