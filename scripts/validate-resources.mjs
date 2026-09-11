// Checks src/data/resources.json for shape problems before a build.
// Usage: node scripts/validate-resources.mjs
import { readFileSync } from 'node:fs';

const CATEGORIES = new Set([
  'food', 'housing', 'shelter', 'employment', 'benefits', 'utilities', 'health', 'transportation',
  'phone', 'legal', 'seniors_disability', 'family_children', 'veterans', 'education', 'crisis',
  'clothing',
]);
const AREAS = new Set([
  'Fort Collins', 'Loveland', 'Estes Park', 'Berthoud', 'Wellington', 'Larimer County',
  'Colorado (statewide)', 'National',
]);
const PHONE = /^(\d{3}-\d{3}-\d{4}|1-\d{3}-\d{3}-\d{4}|211|988|911)$/;

const { resources } = JSON.parse(readFileSync(new URL('../src/data/resources.json', import.meta.url), 'utf8'));
const problems = [];
const ids = new Set();

for (const r of resources) {
  const where = `[${r.id ?? '(no id)'}]`;
  if (!r.id || !/^[a-z0-9-]+$/.test(r.id)) problems.push(`${where} id must be kebab-case`);
  if (ids.has(r.id)) problems.push(`${where} duplicate id`);
  ids.add(r.id);
  if (!r.name?.trim()) problems.push(`${where} missing name`);
  if (!CATEGORIES.has(r.category)) problems.push(`${where} bad category "${r.category}"`);
  if (!r.description?.trim()) problems.push(`${where} missing description`);
  if (r.phone !== null && !PHONE.test(r.phone)) problems.push(`${where} phone "${r.phone}" should look like 970-555-0100`);
  if (r.url !== null && !/^https?:\/\//.test(r.url)) problems.push(`${where} url must start with http(s)://`);
  if (!AREAS.has(r.area)) problems.push(`${where} bad area "${r.area}"`);
  if (!Array.isArray(r.tags)) problems.push(`${where} tags must be an array`);
  for (const k of ['address', 'hours']) if (r[k] !== null && typeof r[k] !== 'string') problems.push(`${where} ${k} must be a string or null`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: ${resources.length} resources`);
