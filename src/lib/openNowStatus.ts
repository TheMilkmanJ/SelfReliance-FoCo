import type { AreaFilter } from '../data/resources';
import type { DaySchedule, HourWindow, OpenPlace } from '../data/openNowTypes';
import { translate, type Translate } from '../i18n/translate';
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

function windowEndLabel(start: string, end: string, nowMinutes: number, t: Translate): string {
  const s = minutesFromHHMM(start);
  const e = minutesFromHHMM(end);
  const time = formatMinutes(e);
  if (e <= s && nowMinutes >= s) return t('open.status.overnight', { time });
  return time;
}

const englishT: Translate = (key, vars) => translate('en', key, vars);

export function statusFor(place: OpenPlace, now: DenverNow, t: Translate = englishT): PlaceStatus {
  if (place.alwaysOpen) {
    return { kind: 'open', label: t(place.confirm ? 'open.status.usually247' : 'open.status.now'), sort: 0 };
  }

  const today = windowsOf(place.schedule?.[now.day]);
  if (today === 'missing') {
    return { kind: 'unknown', label: t(place.confirm ? 'open.status.confirm' : 'open.status.seeHours'), sort: 3 };
  }
  if (today === 'closed') {
    return { kind: 'closed', label: t('open.status.closedToday'), sort: 4 };
  }
  if (today === 'all-day') {
    return { kind: 'open', label: t(place.confirm ? 'open.status.openTodayConfirm' : 'open.status.allDay'), sort: 0 };
  }

  for (const w of today) {
    if (windowContains(now.minutes, w.start, w.end)) {
      const until = windowEndLabel(w.start, w.end, now.minutes, t);
      return {
        kind: 'open',
        label: t(place.confirm ? 'open.status.untilConfirm' : 'open.status.until', { until }),
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
      label: t('open.status.opens', { time: formatMinutes(later.start) }),
      sort: 1,
    };
  }

  return { kind: 'closed', label: t('open.status.closedForToday'), sort: 4 };
}

export function matchesOpenTown(place: OpenPlace, town: AreaFilter): boolean {
  if (town === 'All') return true;
  if (place.area === town) return true;
  return place.area === 'Larimer County' || place.area === 'Colorado' || place.area === 'National';
}
