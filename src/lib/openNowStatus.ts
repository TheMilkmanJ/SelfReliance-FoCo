import type { AreaFilter } from '../data/resources';
import type { DaySchedule, HourWindow, OpenPlace } from '../data/openNowTypes';
import { formatMinutes, minutesFromHHMM, type DenverNow } from './denverClock';

export type StatusKind = 'open' | 'later' | 'closed' | 'unknown';

export type PlaceStatus = {
  kind: StatusKind;
  label: string;
  sort: number;
};

function windowsOf(day: DaySchedule | undefined): HourWindow[] | 'closed' | 'all-day' | 'missing' {
  if (day == null) return 'missing';
  if (day === 'closed' || day === 'all-day') return day;
  return day;
}

export function windowContains(nowMinutes: number, start: string, end: string): boolean {
  const s = minutesFromHHMM(start);
  const e = minutesFromHHMM(end);
  if (e <= s) return nowMinutes >= s || nowMinutes < e;
  return nowMinutes >= s && nowMinutes < e;
}

function windowEndLabel(start: string, end: string, nowMinutes: number): string {
  const s = minutesFromHHMM(start);
  const e = minutesFromHHMM(end);
  if (e <= s && nowMinutes >= s) return `${formatMinutes(e)} (overnight)`;
  return formatMinutes(e);
}

export function statusFor(place: OpenPlace, now: DenverNow): PlaceStatus {
  if (place.alwaysOpen) {
    return { kind: 'open', label: place.confirm ? 'Usually 24/7 — still call' : 'Open now', sort: 0 };
  }

  const today = windowsOf(place.schedule?.[now.day]);
  if (today === 'missing') {
    return { kind: 'unknown', label: place.confirm ? 'Call to confirm' : 'See hours', sort: 3 };
  }
  if (today === 'closed') {
    return { kind: 'closed', label: 'Closed today', sort: 4 };
  }
  if (today === 'all-day') {
    return { kind: 'open', label: place.confirm ? 'Open today — call to confirm' : 'Open all day', sort: 0 };
  }

  for (const w of today) {
    if (windowContains(now.minutes, w.start, w.end)) {
      const until = windowEndLabel(w.start, w.end, now.minutes);
      return {
        kind: 'open',
        label: place.confirm ? `Open now — confirm · until ${until}` : `Open now · until ${until}`,
        sort: 0,
      };
    }
  }

  const later = today
    .map((w) => ({ w, start: minutesFromHHMM(w.start), end: minutesFromHHMM(w.end) }))
    .filter(({ start, end }) => (end <= start ? now.minutes < start : now.minutes < start))
    .sort((a, b) => a.start - b.start)[0];

  if (later) {
    return {
      kind: 'later',
      label: `Opens ${formatMinutes(later.start)}`,
      sort: 1,
    };
  }

  return { kind: 'closed', label: 'Closed for today', sort: 4 };
}

export function matchesOpenTown(place: OpenPlace, town: AreaFilter): boolean {
  if (town === 'All') return true;
  if (place.area === town) return true;
  return place.area === 'Larimer County' || place.area === 'Colorado' || place.area === 'National';
}
