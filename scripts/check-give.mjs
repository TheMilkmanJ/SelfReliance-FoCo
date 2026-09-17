import { readFileSync } from 'node:fs';

const { resources } = JSON.parse(readFileSync(new URL('../src/data/resources.json', import.meta.url), 'utf8'));
const ids = new Set(resources.map((r) => r.id));

const GIVE_NEED_IDS = {
  need: [
    'people-helping-people',
    'noco-community-store',
    'clothe-the-people-fort-collins',
    'kids-closet-fort-collins',
    'salvation-army-care-closet',
    'st-johns-clothing-closet',
    'st-johns-lutheran-pantry',
    'hns-clothing-boutique',
    'hns-berthoud-clothing',
    'salvation-army-loveland-clothing',
    'food-bank-larimer-fort-collins',
    'food-bank-larimer-loveland',
    'foco-cafe',
    'food-not-bombs-fort-collins',
    'four-paws-pet-pantry',
    'animal-friends-kibble',
  ],
  donate: [
    'people-helping-people',
    'habitat-restore-fort-collins',
    'habitat-restore-loveland',
    'goodwill-fort-collins',
    'goodwill-loveland',
    'arc-thrift-fort-collins',
    'arc-thrift-loveland',
    'eco-thrift-fort-collins',
    'food-bank-larimer-fort-collins',
    'food-bank-larimer-loveland',
    'four-paws-pet-pantry',
  ],
  volunteer: [
    'people-helping-people',
    'foco-cafe',
    'food-not-bombs-fort-collins',
    'noco-community-store',
    'clothe-the-people-fort-collins',
    'salvation-army-care-closet',
    'noco-friends-of-ferals',
  ],
};

const missing = [];
for (const [kind, list] of Object.entries(GIVE_NEED_IDS)) {
  for (const id of list) {
    if (!ids.has(id)) missing.push(`${kind}: ${id}`);
  }
}

if (!ids.has('people-helping-people')) missing.push('listing people-helping-people');

if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}

const php = resources.find((r) => r.id === 'people-helping-people');
if (php.phone !== '970-391-9039') {
  console.error('People Helping People phone should be 970-391-9039');
  process.exit(1);
}
if (!/Suzanne|Suze/.test(php.description)) {
  console.error('People Helping People should name Suzanne Barslund');
  process.exit(1);
}

console.log('OK: give / need / volunteer ids');
