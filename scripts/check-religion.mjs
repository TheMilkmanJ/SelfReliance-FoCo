import { readFileSync } from 'node:fs';

const { resources } = JSON.parse(readFileSync(new URL('../src/data/resources.json', import.meta.url), 'utf8'));
const byId = new Map(resources.map((r) => [r.id, r]));

function assert(cond, msg) {
  if (!cond) {
    console.error(msg);
    process.exit(1);
  }
}

const missing = [];
for (const id of [
  'har-shalom',
  'chabad-northern-colorado',
  'temple-or-hadash',
  'csu-hillel',
  'jewish-family-service-colorado',
  'islamic-center-fort-collins',
  'st-joseph-catholic-fort-collins',
  'first-united-methodist-fort-collins',
  'heruka-kadampa-fort-collins',
  'sanatan-mandir-brighton',
  'colorado-singh-sabha',
  'foothills-unitarian-church',
  'fort-collins-interfaith-council',
  'ianc-fort-collins',
  'cws-fort-collins',
  'st-johns-lutheran-pantry',
  'kids-closet-fort-collins',
  'family-housing-network',
  'united-way-211',
  'catholic-charities-samaritan-house',
]) {
  if (!byId.has(id)) missing.push(id);
}
assert(!missing.length, `missing religion listings:\n${missing.join('\n')}`);

const stay = {
  'ianc-fort-collins': 'immigrant_refugee',
  'cws-fort-collins': 'immigrant_refugee',
  'catholic-charities-immigration': 'immigrant_refugee',
  'st-johns-lutheran-pantry': 'food',
  'loveland-vineyard-pantry': 'food',
  'laporte-presbyterian-pantry': 'food',
  'adventist-community-services-loveland': 'food',
  'foothills-unitarian-mobile-pantry': 'food',
  'salvation-army-fort-collins': 'food',
  'kids-closet-fort-collins': 'clothing',
  'st-johns-clothing-closet': 'clothing',
  'family-housing-network': 'shelter',
  'fort-collins-rescue-mission': 'shelter',
  'catholic-charities-samaritan-house': 'shelter',
  'united-way-211': 'crisis',
};

for (const [id, category] of Object.entries(stay)) {
  const row = byId.get(id);
  assert(row, `expected ${id}`);
  assert(row.category === category, `${id} must stay on ${category} — do not recategorize (got ${row.category})`);
}

const har = byId.get('har-shalom');
assert(har.category === 'religion' && har.phone === '970-223-5191', 'Har Shalom office facts');
assert(/725 W Drake/i.test(har.address), 'Har Shalom address');

const chabad = byId.get('chabad-northern-colorado');
assert(chabad.phone === '970-407-1613', 'Chabad phone');

const icfc = byId.get('islamic-center-fort-collins');
assert(icfc.phone === '970-221-2425' && /925 W Lake/i.test(icfc.address), 'Islamic Center facts');

assert(!/tender gifts/i.test(JSON.stringify(resources)), 'do not add Tender Gifts');

console.log('OK: Faith & religion extras stay on original categories');
