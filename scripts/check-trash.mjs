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
  if (Number(todayDow) === Number(pickupDow)) return 'out-today';
  return 'weekday';
}

function effectiveServiceDow(override, mapped) {
  return mapped ?? override ?? null;
}

function mappedServiceDow(mapped, overrideForThisRegion, leftoverTownDay) {
  if (mapped != null) return mapped;
  return overrideForThisRegion ?? leftoverTownDay ?? null;
}

function usesHolidayBump(town, hauler, regionId) {
  if (regionId === 'uninc-landfill') return false;
  if (town === 'Fort Collins' || town === 'Loveland') return true;
  if (hauler && /Superior|Atlas Unlimited|United Waste/i.test(hauler)) return true;
  return false;
}

/** Same rules as TrashDayScreen: JSON map or per-neighborhood memory wins; town leftover only with no region. */
function regularFor(region, regionDays, sessionChip, leftoverTown) {
  const remembered = region ? regionDays[region.id] ?? null : null;
  const mapped = region?.dow ?? remembered ?? null;
  const leftover = !region ? leftoverTown : null;
  return mappedServiceDow(mapped, sessionChip, leftover);
}

function showChips(region, mapped) {
  return region?.id !== 'uninc-landfill' && mapped == null;
}

function chipForThisRegion(selectedRegionId, chipRegionId, chip) {
  if (chip == null) return null;
  if ((selectedRegionId ?? '') !== (chipRegionId ?? '')) return null;
  return chip;
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
assert(effectiveServiceDow(4, 3) === 3, 'mapped Wednesday wins over a Thursday chip');
assert(mappedServiceDow(1, null, 4) === 1, 'South of Harmony Monday wins over leftover Thursday from another FoCo area');
assert(mappedServiceDow(1, 2, 4) === 1, 'South of Harmony Monday ignores a Tuesday chip tap');
assert(mappedServiceDow(null, null, 4) === 4, 'towns without a map day still use the weekday chip');
assert(mappedServiceDow(3, null, 4) === 3, 'Taft/Drake mapped Wednesday ignores leftover Thursday');
assert(
  cartDayKind(thisThu.dow, actualPickupDow(mappedServiceDow(3, null, 4), thisThu)) === 'weekday',
  'Taft Hill / west Drake on Thu Sep 17 is Wednesday pickup, not Out today',
);
assert(
  cartDayKind(thisThu.dow, actualPickupDow(mappedServiceDow(1, null, 4), thisThu)) === 'weekday',
  'South of Harmony on Thu Sep 17 is Monday pickup, not Out today from leftover Thursday',
);
assert(
  cartDayKind(thisThu.dow, actualPickupDow(mappedServiceDow(5, 4, 4), thisThu)) === 'weekday',
  'Highlander Heights stays Friday even if a Thursday chip is tapped',
);
assert(
  cartDayKind(thisThu.dow, mappedServiceDow(null, null, null) == null ? null : 4) === 'pick',
  'no neighborhood and no chip this visit is Pick a day, not Out today',
);
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
const zoneTs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/data/trashZones.ts'), 'utf8');
assert(!/Friday first so Highlander/.test(zoneTs), 'Fort Collins list is not Friday-first for Highlander Heights');
assert(/ZONE_DOW_ORDER: ServiceDow\[\] = \[1, 2, 3, 4, 5\]/.test(zoneTs), 'weekdays are Monday–Friday, no pinned neighborhood');
assert(regions[0].id !== 'highlander-heights', 'Highlander Heights is not the hardcoded first default');
const firstFoco = regions.find((z) => z.town === 'Fort Collins');
assert(firstFoco && firstFoco.dow === 1, 'Fort Collins neighborhoods list Monday first, not Friday first');
const prefsTs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/lib/trashPrefs.ts'), 'utf8');
assert(!prefsTs.includes('highlander-heights'), 'remembered region helper does not default to Highlander Heights');
const enCopy = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/i18n/en.ts'), 'utf8');
assert(!enCopy.includes('Highlander'), 'menus do not name Highlander Heights as the default');
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
assert(regions.find((z) => z.id === 'south-harmony')?.dow === 1, 'South of Harmony is Monday on the 2026 map');
const south = regions.find((z) => z.id === 'south-harmony');
assert(
  cartDayKind(thisThu.dow, actualPickupDow(south.dow, thisThu)) === 'weekday',
  'South of Harmony What goes out on Thursday is Monday pickup, not Out today',
);
assert(/Monday on the 2026 map/i.test(south.where), 'South of Harmony copy says Monday');
const horsetooth = regions.find((z) => z.id === 'east-horsetooth');
assert(horsetooth && horsetooth.dow === 2, 'East of College around Horsetooth is Tuesday (north of Harmony)');
assert(
  cartDayKind(thisThu.dow, actualPickupDow(horsetooth.dow, thisThu)) === 'weekday',
  'Horsetooth Tuesday zone on Thursday is Tuesday pickup, not Out today',
);
const thisFri = { year: 2026, month: 9, date: 18, dow: 5 };
assert(mappedServiceDow(2, null, 5) === 2, 'Horsetooth Tuesday wins over leftover Friday from Highlander Heights');
assert(
  cartDayKind(thisFri.dow, actualPickupDow(mappedServiceDow(2, null, 5), thisFri)) === 'weekday',
  'Horsetooth on Fri Sep 18 is Tuesday pickup, not Out today from leftover Friday storage',
);
assert(
  cartDayKind(thisFri.dow, actualPickupDow(mappedServiceDow(2, 5, 5), thisFri)) === 'weekday',
  'Friday chip on Horsetooth is still Tuesday pickup, not Out today',
);
assert(
  chipForThisRegion('east-horsetooth', 'highlander-heights', 5) == null,
  'Highlander Friday chip does not apply after switching to Horsetooth',
);
assert(
  mappedServiceDow(2, chipForThisRegion('east-horsetooth', 'highlander-heights', 5), 5) === 2,
  'Horsetooth uses Tuesday when leftover Friday belongs to another neighborhood',
);
assert(
  cartDayKind(thisFri.dow, actualPickupDow(hh.dow, thisFri)) === 'out-today',
  'Highlander Heights on Friday is Out today',
);
assert(!enCopy.includes('Goes out {day}'), 'cart rows do not say Goes out weekday');
assert(!enCopy.includes('goes out {day}'), 'home tile and dropdown do not say goes out weekday');
assert(enCopy.includes("'trash.outToday': 'Out today'"), 'Out today is only on the pickup day');
assert(enCopy.includes("'trash.dayPickup': '{day}'"), 'other days show the weekday only');
assert(enCopy.includes("'trash.notToday': 'Usual pickup'"), 'hero says Usual pickup, not Not today, when the weekday is known');
assert(!enCopy.includes("'trash.notToday': 'Not today'"), 'Not today is not the kicker on a Tuesday route');
assert(!enCopy.includes("'{day} · out today'"), 'Out today is not prefixed with the weekday');
assert(new Set(regions.map((z) => z.id)).size === regions.length, 'unique region ids');
assert([1, 2, 3, 4, 5].every((d) => regions.some((z) => z.town === 'Fort Collins' && z.dow === d)), 'all weekdays have a FoCo zone');
const towns = ['Fort Collins', 'Loveland', 'Estes Park', 'Berthoud', 'Wellington', 'Unincorporated'];
towns.forEach((town) => {
  assert(regions.some((z) => z.town === town), `${town} has trash regions`);
});
assert(regions.find((z) => z.id === 'loveland-centerra')?.dow === null, 'Loveland Centerra day is Recollect, not invented');
assert(regions.find((z) => z.id === 'loveland-namaqua')?.dow === null, 'Loveland Namaqua day is Recollect, not invented');
assert(regions.find((z) => z.id === 'estes-downtown')?.dow === null, 'Estes day is on the bill, not invented');
assert(regions.find((z) => z.id === 'berthoud-united')?.dow === null, 'Berthoud day is on the bill, not invented');
assert(regions.find((z) => z.id === 'wellington-old-town')?.dow === null, 'Wellington day is on the bill, not invented');
assert(regions.find((z) => z.id === 'wellington-old-town')?.town === 'Wellington', 'Old Town Wellington is listed');
assert(regions.find((z) => z.id === 'berthoud-mountain-high')?.phone === '970-834-1144', 'Mountain High phone');
assert(regions.find((z) => z.id === 'estes-superior')?.phone === '970-214-4902', 'Superior Trash phone');
assert(regions.find((z) => z.id === 'uninc-landfill')?.phone === '970-498-5760', 'Landfill office phone');
assert(yardTrimmingsSeason({ year: 2026, month: 4, date: 1, dow: 3 }, 'Loveland') === true, 'Loveland yard in April');
assert(yardTrimmingsSeason({ year: 2026, month: 12, date: 10, dow: 4 }, 'Loveland') === false, 'Loveland yard off after Dec 4');

const screenTs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/screens/TrashDayScreen.tsx'), 'utf8');
assert(screenTs.includes('showWeekdayChips'), 'mapped neighborhoods hide weekday chips so Friday cannot mark Horsetooth Out today');
assert(screenTs.includes('mapped == null'), 'weekday chips hide once this neighborhood has a map day or a remembered day');
assert(screenTs.includes('if (region?.dow != null) return'), 'saveDay is a no-op on a mapped neighborhood');
assert(screenTs.includes('regionDays'), 'unmapped towns remember a weekday per neighborhood, not town-wide');
assert(screenTs.includes('!region ? days[town]'), 'town leftover Friday only applies when no neighborhood is selected');
assert(screenTs.includes('usesHolidayBump'), 'Loveland and documented haulers delay after holidays the same way FoCo does');
assert(screenTs.includes('rememberedDays={regionDays}'), 'neighborhood list gets remembered weekdays for grouping');
const selectTs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/components/TrashZoneSelect.tsx'), 'utf8');
assert(selectTs.includes("pointerEvents={closing ? 'none' : 'auto'}"), 'region list stays under the tap so it cannot hit Friday');
assert(selectTs.includes('rememberedDays'), 'every town groups by weekday once a neighborhood has a day');
assert(selectTs.includes("t('trash.pickDayGroup')"), 'neighborhoods without a day sit under Pick a day');
assert(!selectTs.includes("town === 'Fort Collins'"), 'weekday grouping is not Fort Collins-only');
assert(prefsTs.includes('foco-trash-region-day:'), 'remembered weekday is stored per neighborhood id');
assert(enCopy.includes("'trash.pickDayGroup': 'Pick a day'"), 'unknown rows are labeled Pick a day');
assert(enCopy.includes('Out today tracks it the same way as Fort Collins'), 'Loveland / Estes / Berthoud / Wellington copy says Out today tracks like FoCo');

const centerra = { id: 'loveland-centerra', dow: null };
const namaqua = { id: 'loveland-namaqua', dow: null };
assert(regularFor(centerra, {}, null, 5) == null, 'Centerra does not inherit leftover Friday from another Loveland pick');
assert(regularFor(centerra, { 'loveland-centerra': 2 }, null, 5) === 2, 'Centerra remembers Tuesday even if leftover storage is Friday');
assert(
  cartDayKind(thisFri.dow, actualPickupDow(regularFor(centerra, { 'loveland-centerra': 2 }, null, 5), thisFri)) === 'weekday',
  'Centerra Tuesday on Friday is Usual pickup, not Out today from leftover Friday',
);
assert(regularFor(namaqua, { 'loveland-centerra': 2 }, null, 5) == null, 'Namaqua does not inherit Centerra Tuesday');
assert(regularFor(null, { 'loveland-centerra': 2 }, null, 5) === 5, 'no neighborhood still uses the town leftover chip');
assert(showChips(centerra, null) === true, 'Centerra shows weekday chips until you pick a day');
assert(showChips(centerra, 2) === false, 'Centerra hides chips after Tuesday is remembered');
assert(showChips({ id: 'east-horsetooth', dow: 2 }, 2) === false, 'Horsetooth hides chips because the map day is Tuesday');
assert(showChips({ id: 'uninc-landfill', dow: null }, null) === false, 'landfill never shows weekday chips');
assert(usesHolidayBump('Fort Collins', 'Republic Services', 'south-harmony') === true, 'FoCo delays after holidays');
assert(usesHolidayBump('Loveland', 'City of Loveland Solid Waste', 'loveland-centerra') === true, 'Loveland city carts delay after holidays');
assert(usesHolidayBump('Estes Park', 'Waste Management', 'estes-wm') === false, 'WM Estes does not get a Republic bump invented');
assert(usesHolidayBump('Estes Park', 'Atlas Unlimited (Superior Trash)', 'estes-superior') === true, 'Superior / Atlas delays after holidays');
assert(usesHolidayBump('Berthoud', 'United Waste Systems', 'berthoud-united') === true, 'United Waste delays after holidays');
assert(usesHolidayBump('Unincorporated', 'Larimer County Landfill', 'uninc-landfill') === false, 'landfill has no curbside holiday bump');

console.log('OK: trash-day holiday bump');
