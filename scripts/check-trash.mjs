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

function actualPickupDow(regular, ymd) {
  const hol = holidayThisServiceWeek(ymd);
  if (!hol || hol.dow < 1 || hol.dow > 5) return regular;
  if (regular < hol.dow) return regular;
  return regular + 1;
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

const xmas = republicHolidays(2026).find((h) => h.name === 'Christmas Day');
assert(xmas && xmas.dow === 5, 'Christmas 2026 Friday');
assert(actualPickupDow(5, { year: 2026, month: 12, date: 25, dow: 5 }) === 6, 'Christmas Friday → Saturday');
assert(actualPickupDow(4, { year: 2026, month: 12, date: 24, dow: 4 }) === 4, 'Christmas Eve Thursday unchanged');

console.log('OK: trash-day holiday bump');
