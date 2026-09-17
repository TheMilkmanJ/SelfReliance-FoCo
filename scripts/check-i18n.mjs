import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const langs = ['en', 'es', 'hi', 'zh', 'vi', 'ko', 'ar'];

function keys(name) {
  const text = readFileSync(join(dir, `../src/i18n/${name}.ts`), 'utf8');
  return new Set([...text.matchAll(/'([^']+)':/g)].map((m) => m[1]));
}

const en = keys('en');
let failed = false;
for (const lang of langs) {
  if (lang === 'en') continue;
  const k = keys(lang);
  const missing = [...en].filter((x) => !k.has(x)).sort();
  const extra = [...k].filter((x) => !en.has(x)).sort();
  if (missing.length || extra.length) {
    failed = true;
    if (missing.length) console.error(`${lang} missing:\n${missing.join('\n')}`);
    if (extra.length) console.error(`${lang} extra:\n${extra.join('\n')}`);
  }
}

if (failed) process.exit(1);
console.log(`OK: ${en.size} keys in ${langs.join(', ')}`);
