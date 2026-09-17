import { readFileSync } from 'node:fs';

const { resources } = JSON.parse(readFileSync(new URL('../src/data/resources.json', import.meta.url), 'utf8'));
const byId = new Map(resources.map((r) => [r.id, r]));

const missing = [];
for (const id of [
  'irc-northern-colorado',
  'ianc-fort-collins',
  'csu-isss',
  'csu-place-english',
  'poudre-libraries-esl',
  'poudre-libraries-adult-learning',
  'colorado-language-assistance-hotline',
  'fuerza-latina-immigrant-hotline',
  'fuerza-latina',
  'colorado-immigrant-rights-coalition',
  'relay-colorado',
  'united-way-211',
]) {
  if (!byId.has(id)) missing.push(id);
}
if (missing.length) {
  console.error('missing language extras:\n' + missing.join('\n'));
  process.exit(1);
}

const stay = {
  'irc-northern-colorado': 'immigrant_refugee',
  'ianc-fort-collins': 'immigrant_refugee',
  'csu-isss': 'education',
  'csu-place-english': 'education',
  'poudre-libraries-esl': 'immigrant_refugee',
  'poudre-libraries-adult-learning': 'education',
  'fuerza-latina-immigrant-hotline': 'immigrant_refugee',
  'colorado-language-assistance-hotline': 'voting',
  'fuerza-latina': 'employment',
  'colorado-immigrant-rights-coalition': 'immigrant_refugee',
  'relay-colorado': 'phone',
  'united-way-211': 'crisis',
};

for (const [id, category] of Object.entries(stay)) {
  const row = byId.get(id);
  if (row.category !== category) {
    console.error(`${id} must stay on ${category} — do not recategorize (got ${row.category})`);
    process.exit(1);
  }
}

for (const id of ['alianza-norco', 'cws-fort-collins', 'catholic-charities-immigration']) {
  const row = byId.get(id);
  if (!row) {
    console.error(`expected ${id} to stay in the directory`);
    process.exit(1);
  }
  if (row.category !== 'immigrant_refugee') {
    console.error(`${id} should stay on immigrant_refugee`);
    process.exit(1);
  }
}

if (resources.some((r) => r.category === 'language')) {
  console.error('no listing should use category language — Language is extras-by-ID');
  process.exit(1);
}

console.log('OK: Language extras stay on original categories');
