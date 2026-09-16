import { useEffect, useState } from 'react';

import type { DayKey } from '../data/openNowTypes';

const TZ = 'America/Denver';

const WEEKDAYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export type DenverNow = {
  day: DayKey;
  dow: number;
  year: number;
  month: number;
  date: number;
  minutes: number;
  weekdayLabel: string;
  dateLabel: string;
  timeLabel: string;
};

function partMap(date: Date, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...options }).formatToParts(date);
  const out: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') out[p.type] = p.value;
  }
  return out;
}

export function minutesFromHHMM(hhmm: string): number {
  const [hRaw, mRaw] = hhmm.split(':');
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function formatMinutes(total: number): string {
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const suffix = h24 >= 12 ? 'pm' : 'am';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function denverNow(date: Date = new Date()): DenverNow {
  const clock = partMap(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const display = partMap(date, {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h12',
    month: 'short',
    day: 'numeric',
  });
  const weekdayLabel = clock.weekday ?? 'Today';
  const dayIndex = WEEKDAY_LONG.indexOf(weekdayLabel as (typeof WEEKDAY_LONG)[number]);
  const day: DayKey = dayIndex >= 0 ? WEEKDAYS[dayIndex] : 'mon';
  const hour = Number(clock.hour);
  const minute = Number(clock.minute);
  const minutes = (Number.isFinite(hour) ? hour : 0) * 60 + (Number.isFinite(minute) ? minute : 0);
  const timeLabel = `${display.hour}:${(display.minute ?? '00').padStart(2, '0')} ${display.dayPeriod?.toLowerCase() ?? ''}`.trim();
  return {
    day,
    dow: dayIndex >= 0 ? dayIndex : 1,
    year: Number(clock.year),
    month: Number(clock.month),
    date: Number(clock.day),
    minutes,
    weekdayLabel,
    dateLabel: `${display.month} ${display.day}`,
    timeLabel,
  };
}

export function useDenverNow(tickMs = 30000): DenverNow {
  const [now, setNow] = useState(() => denverNow());
  useEffect(() => {
    const id = setInterval(() => setNow(denverNow()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return now;
}

export { TZ };
