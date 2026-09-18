function lastMondayOfMay(year) {
  const d = new Date(Date.UTC(year, 5, 0));
  const dow = d.getUTCDay();
  const offset = dow === 0 ? 6 : dow - 1;
  return d.getUTCDate() - offset;
}

function firstMondayOfSeptember(year) {
  const d = new Date(Date.UTC(year, 8, 1));
  const dow = d.getUTCDay();
  const add = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
  return 1 + add;
}

function fourthThursdayOfNovember(year) {
  const d = new Date(Date.UTC(year, 10, 1));
  const dow = d.getUTCDay();
  const firstThu = 1 + ((4 - dow + 7) % 7);
  return firstThu + 21;
}

function republicHolidays(year) {
  const rows = [
    { name: "New Year's Day", month: 1, date: 1 },
    { name: 'Memorial Day', month: 5, date: lastMondayOfMay(year) },
    { name: 'Independence Day', month: 7, date: 4 },
    { name: 'Labor Day', month: 9, date: firstMondayOfSeptember(year) },
    { name: 'Thanksgiving', month: 11, date: fourthThursdayOfNovember(year) },
    { name: 'Christmas Day', month: 12, date: 25 },
  ];
  return rows.map((r) => {
    const dow = new Date(Date.UTC(year, r.month - 1, r.date)).getUTCDay();
    return { ...r, year, dow };
  });
}

function mondayOf(ymd) {
  const date = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.date));
  const back = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - back);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    date: date.getUTCDate(),
    dow: 1,
  };
}

function holidayThisServiceWeek(ymd) {
  const monday = mondayOf(ymd);
  const holidays = republicHolidays(ymd.year).concat(republicHolidays(monday.year));
  for (let i = 0; i < 5; i += 1) {
    const d = new Date(Date.UTC(monday.year, monday.month - 1, monday.date + i));
    const cur = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, date: d.getUTCDate(), dow: d.getUTCDay() };
    const hit = holidays.find((h) => h.year === cur.year && h.month === cur.month && h.date === cur.date && h.dow >= 1 && h.dow <= 5);
    if (hit) return hit;
  }
  return null;
}

function addDays(ymd, days) {
  const d = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.date + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, date: d.getUTCDate(), dow: d.getUTCDay() };
}

function holidayLastServiceWeek(ymd) {
  return holidayThisServiceWeek(addDays(ymd, -7));
}

function yardTrimmingsSeason(ymd, town) {
  const md = ymd.month * 100 + ymd.date;
  if (town === 'Loveland') return md >= 330 && md <= 1204;
  return md >= 401 && md <= 1130;
}

function actualPickupDow(regular, ymd) {
  const hol = holidayThisServiceWeek(ymd);
  if (!hol || hol.dow < 1 || hol.dow > 5) return regular;
  if (regular < hol.dow) return regular;
  return regular + 1;
}

function isPickupDay(regular, ymd) {
  return ymd.dow === actualPickupDow(regular, ymd);
}

function cartDayKind(todayDow, pickupDow) {
  if (pickupDow == null) return 'pick';
  if (todayDow === pickupDow) return 'out-today';
  return 'weekday';
}

function effectiveServiceDow(override, mapped) {
  return override ?? mapped ?? null;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const h2026 = republicHolidays(2026);
assert(h2026.find((h) => h.name === 'Memorial Day' && h.date === 25 && h.dow === 1), 'Memorial 2026');
assert(h2026.find((h) => h.name === 'Independence Day' && h.dow === 6), 'July 4 2026 Saturday');
assert(h2026.find((h) => h.name === 'Thanksgiving' && h.date === 26 && h.dow === 4), 'Thanksgiving 2026');

const memorialWed = { year: 2026, month: 5, date: 27, dow: 3 };
assert(holidayThisServiceWeek(memorialWed)?.name === 'Memorial Day', 'holiday week');
assert(actualPickupDow(3, memorialWed) === 4, 'Wed route moves to Thursday');

const julyFri = { year: 2026, month: 7, date: 3, dow: 5 };
assert(holidayThisServiceWeek(julyFri) === null, 'Saturday July 4 does not delay weekdays');
assert(actualPickupDow(5, julyFri) === 5, 'Friday stays Friday');

const janThu = { year: 2026, month: 1, date: 1, dow: 4 };
assert(actualPickupDow(4, janThu) === 5, 'New Year Thursday → Friday');
assert(actualPickupDow(5, janThu) === 6, 'Friday → Saturday');
assert(actualPickupDow(3, janThu) === 3, 'Wednesday before holiday unchanged');

const labor = h2026.find((h) => h.name === 'Labor Day');
assert(labor && labor.date === 7 && labor.dow === 1, 'Labor Day 2026 Monday Sep 7');
assert(actualPickupDow(1, { year: 2026, month: 9, date: 7, dow: 1 }) === 2, 'Labor Day Monday route → Tuesday');
assert(actualPickupDow(4, { year: 2026, month: 9, date: 10, dow: 4 }) === 5, 'Labor week Thursday route not Thursday');
assert(actualPickupDow(4, { year: 2026, month: 9, date: 11, dow: 5 }) === 5, 'Labor week Thursday route → Friday Sep 11');
assert(actualPickupDow(5, { year: 2026, month: 9, date: 11, dow: 5 }) === 6, 'Labor week Friday route not Friday');
assert(actualPickupDow(5, { year: 2026, month: 9, date: 12, dow: 6 }) === 6, 'Labor week Friday route → Saturday Sep 12');

const thisThu = { year: 2026, month: 9, date: 17, dow: 4 };
assert(holidayThisServiceWeek(thisThu) === null, 'week of Sep 17 2026 is a normal week');
assert(actualPickupDow(4, thisThu) === 4, 'this week Thursday stays Thursday');
assert(actualPickupDow(5, { year: 2026, month: 9, date: 18, dow: 5 }) === 5, 'this week Friday stays Friday');
assert(holidayLastServiceWeek(thisThu)?.name === 'Labor Day', 'Sep 17 still remembers last week Labor Day');
assert(!isPickupDay(5, thisThu), 'Thursday is not a Friday route');
assert(cartDayKind(thisThu.dow, actualPickupDow(5, thisThu)) === 'weekday', 'Friday zone on Thursday is Friday pickup, not Not today');
assert(cartDayKind(5, 5) === 'out-today', 'Friday on a Friday route is Out today');
assert(cartDayKind(4, null) === 'pick', 'no weekday yet');
assert(
  cartDayKind(5, actualPickupDow(5, { year: 2026, month: 9, date: 11, dow: 5 })) === 'weekday',
  'Labor week Friday route labels Saturday pickup',
);
assert(actualPickupDow(5, { year: 2026, month: 9, date: 11, dow: 5 }) === 6, 'Labor week Friday → Saturday for the label');
assert(effectiveServiceDow(null, 3) === 3, 'Taft/Drake mapped Wednesday when no chip override');
assert(effectiveServiceDow(4, 3) === 4, 'weekday chip can override mapped day without dropping the location');
assert(
  cartDayKind(thisThu.dow, actualPickupDow(effectiveServiceDow(null, 3), thisThu)) === 'weekday',
  'Taft Hill / west Drake on Thu Sep 17 is Wednesday pickup, not Out today',
);
assert(isPickupDay(3, thisThu) === false, 'Wednesday route is not out on Thursday in a normal week');

const xmas = republicHolidays(2026).find((h) => h.name === 'Christmas Day');
assert(xmas && xmas.dow === 5, 'Christmas 2026 Friday');
assert(actualPickupDow(5, { year: 2026, month: 12, date: 25, dow: 5 }) === 6, 'Christmas Friday → Saturday');
assert(actualPickupDow(4, { year: 2026, month: 12, date: 24, dow: 4 }) === 4, 'Christmas Eve Thursday unchanged');

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const zoneFile = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/data/trashZones.json'), 'utf8'));
const regions = zoneFile.regions;
const hh = regions.find((z) => z.id === 'highlander-heights');
assert(hh && hh.dow === 5 && hh.town === 'Fort Collins', 'Highlander Heights is Friday on the 2026 map');
assert(
  cartDayKind(thisThu.dow, actualPickupDow(hh.dow, thisThu)) === 'weekday',
  'Highlander Heights What goes out on Thursday is Friday pickup, not Not today',
);
assert(/east of College/i.test(hh.where) && /Drake|Pitkin|Emigh/.test(hh.where), 'Highlander Heights covers east of College');
assert(!regions.some((z) => z.id === 'east-college-north'), 'generic Friday east blob is folded into Highlander Heights');
assert(regions.find((z) => z.id === 'old-town')?.dow === 4, 'Old Town is Thursday');
const i25 = regions.find((z) => z.id === 'i25-northeast');
assert(i25 && i25.dow === 5 && /I-25/.test(i25.label), 'I-25 / northeast Fort Collins is Friday');
assert(cartDayKind(thisThu.dow, actualPickupDow(i25.dow, thisThu)) === 'weekday', 'I-25 cards on Thu Sep 17 say Friday pickup');
const taft = regions.find((z) => z.id === 'taft-drake');
assert(taft && taft.dow === 3 && /Taft Hill/i.test(taft.label) && /Drake/i.test(taft.label), 'Taft Hill and west Drake is Wednesday');
assert(
  cartDayKind(thisThu.dow, actualPickupDow(taft.dow, thisThu)) === 'weekday',
  'Taft/Drake What goes out on Thursday says Wednesday pickup',
);
assert(regions.find((z) => z.id === 'south-harmony')?.dow === 1, 'South of Harmony is Monday');
assert(new Set(regions.map((z) => z.id)).size === regions.length, 'unique region ids');
assert([1, 2, 3, 4, 5].every((d) => regions.some((z) => z.town === 'Fort Collins' && z.dow === d)), 'all weekdays have a FoCo zone');
const towns = ['Fort Collins', 'Loveland', 'Estes Park', 'Berthoud', 'Wellington', 'Unincorporated'];
towns.forEach((town) => {
  assert(regions.some((z) => z.town === town), `${town} has trash regions`);
});
assert(regions.find((z) => z.id === 'loveland-centerra')?.dow === null, 'Loveland Centerra day is Recollect, not invented');
assert(regions.find((z) => z.id === 'wellington-old-town')?.town === 'Wellington', 'Old Town Wellington is listed');
assert(regions.find((z) => z.id === 'berthoud-mountain-high')?.phone === '970-834-1144', 'Mountain High phone');
assert(regions.find((z) => z.id === 'estes-superior')?.phone === '970-214-4902', 'Superior Trash phone');
assert(regions.find((z) => z.id === 'uninc-landfill')?.phone === '970-498-5760', 'Landfill office phone');
assert(yardTrimmingsSeason({ year: 2026, month: 4, date: 1, dow: 3 }, 'Loveland') === true, 'Loveland yard in April');
assert(yardTrimmingsSeason({ year: 2026, month: 12, date: 10, dow: 4 }, 'Loveland') === false, 'Loveland yard off after Dec 4');

console.log('OK: trash-day holiday bump');
