import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function minutesFromHHMM(hhmm) {
  const [hRaw, mRaw] = hhmm.split(':');
  return Number(hRaw) * 60 + Number(mRaw);
}

function windowContains(nowMinutes, start, end) {
  const s = minutesFromHHMM(start);
  const e = minutesFromHHMM(end);
  if (e <= s) return nowMinutes >= s || nowMinutes < e;
  return nowMinutes >= s && nowMinutes < e;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(windowContains(120, '19:00', '07:00'), '2am is inside 7pm-7am');
assert(windowContains(1200, '19:00', '07:00'), '8pm is inside 7pm-7am');
assert(!windowContains(720, '19:00', '07:00'), 'noon is not inside 7pm-7am');
assert(windowContains(11 * 60, '11:00', '14:00'), '11am lunch is open');
assert(!windowContains(14 * 60, '11:00', '14:00'), '2pm lunch has ended');
assert(windowContains(12 * 60 + 15, '10:00', '12:00') === false, 'Care Closet noon break');
assert(windowContains(12 * 60 + 30, '12:30', '14:00'), 'Care Closet after noon break');

const resources = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/data/resources.json'), 'utf8'),
).resources;
const byId = Object.fromEntries(resources.map((r) => [r.id, r]));
assert(byId['wellington-public-library']?.phone === '970-568-3040', 'Wellington Public Library');
assert(byId['berthoud-community-library']?.phone === '970-532-2757', 'Berthoud Community Library');
assert(byId['larimer-jail-visiting']?.phone === '970-498-5200', 'Larimer County Jail visiting');
assert(byId['wellington-public-library']?.dow == null, 'libraries are listings, not invented trash days');
assert(byId['larimer-jail-visiting']?.category === 'reentry', 'jail visiting stays on Reentry');

console.log('OK: open-now overnight windows');
