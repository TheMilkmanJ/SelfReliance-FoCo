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
  'larimer-clerk-marriage',
  'larimer-clerk-marriage-copy',
  'ssa-name-change',
  'colorado-dmv-fort-collins',
  'colorado-dmv-loveland',
  'social-security-fort-collins',
  'ssa-card-replacement',
  'colorado-self-help-court',
  'colorado-courts-divorce',
  'colorado-legal-services-fort-collins',
  'ask-a-lawyer-larimer',
  'larimer-bar-pro-bono',
  'larimer-child-support',
  'casa-larimer',
  'crossroads-safehouse',
  'alternatives-to-violence',
  'estes-valley-crisis-advocates',
  'project-self-sufficiency',
  'united-way-211',
]) {
  if (!byId.has(id)) missing.push(id);
}
assert(!missing.length, `missing marriage/divorce extras:\n${missing.join('\n')}`);

const stay = {
  'larimer-clerk-marriage': 'identification',
  'larimer-clerk-marriage-copy': 'identification',
  'ssa-name-change': 'identification',
  'colorado-dmv-fort-collins': 'identification',
  'colorado-dmv-loveland': 'identification',
  'ssa-card-replacement': 'identification',
  'social-security-fort-collins': 'benefits',
  'colorado-self-help-court': 'legal',
  'colorado-courts-divorce': 'legal',
  'colorado-legal-services-fort-collins': 'legal',
  'ask-a-lawyer-larimer': 'legal',
  'larimer-bar-pro-bono': 'legal',
  'csu-student-legal-services': 'legal',
  'larimer-child-support': 'family_children',
  'casa-larimer': 'family_children',
  'larimer-children-youth-family': 'family_children',
  'project-self-sufficiency': 'family_children',
  'crossroads-safehouse': 'crisis',
  'alternatives-to-violence': 'crisis',
  'estes-valley-crisis-advocates': 'crisis',
  'united-way-211': 'crisis',
};

for (const [id, category] of Object.entries(stay)) {
  const row = byId.get(id);
  assert(row, `expected ${id}`);
  assert(row.category === category, `${id} must stay on ${category} — do not recategorize (got ${row.category})`);
}

assert(
  !resources.some((r) => r.category === 'marriage' || r.category === 'divorce'),
  'no listing should use category marriage or divorce — those tiles are extras-by-ID',
);

const clerk = byId.get('larimer-clerk-marriage');
assert(/civil union/i.test(clerk.description) && clerk.phone === '970-498-7860', 'clerk marriage license facts');

const copy = byId.get('larimer-clerk-marriage-copy');
assert(copy.phone === '970-498-7860' && /certified/i.test(copy.description), 'certified marriage record');

const css = byId.get('larimer-child-support');
assert(css.phone === '970-498-7600' && /child-support/i.test(css.url), 'Larimer Child Support Services');

const crc = byId.get('colorado-self-help-court');
assert(crc.phone === '970-494-3581', 'Court Resource Center phone');
assert(/Resource Center/i.test(crc.name), 'official Court Resource Center name');

const forms = byId.get('colorado-courts-divorce');
assert(/divorce-and-separation/.test(forms.url), 'statewide divorce forms URL');

console.log('OK: Marriage and Divorce extras stay on original categories');
