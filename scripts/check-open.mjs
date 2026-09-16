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

console.log('OK: open-now overnight windows');
