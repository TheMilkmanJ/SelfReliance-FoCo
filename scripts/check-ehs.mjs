import { readFileSync } from 'node:fs';

const { resources } = JSON.parse(readFileSync(new URL('../src/data/resources.json', import.meta.url), 'utf8'));
const byId = new Map(resources.map((r) => [r.id, r]));

const missing = [];
for (const id of [
  'poudre-valley-early-head-start',
  'el-nidito-early-head-start',
  'head-start-larimer',
]) {
  if (!byId.has(id)) missing.push(id);
}
if (missing.length) {
  console.error('missing listings:\n' + missing.join('\n'));
  process.exit(1);
}

const ehs = byId.get('poudre-valley-early-head-start');
if (ehs.name !== 'Poudre Valley Early Head Start') {
  console.error(`EHS name should be "Poudre Valley Early Head Start", got "${ehs.name}"`);
  process.exit(1);
}
if (ehs.category !== 'family_children') {
  console.error('Poudre Valley Early Head Start must stay on family_children — do not recategorize');
  process.exit(1);
}
if (ehs.phone !== '970-490-3204') {
  console.error('EHS apply phone should be PSD Early Childhood 970-490-3204');
  process.exit(1);
}
if (!/Fullana|220 N Grant/.test(ehs.address ?? '')) {
  console.error('EHS apply desk should be Fullana Learning Center, 220 N Grant Ave');
  process.exit(1);
}
if (ehs.area !== 'Larimer County') {
  console.error('EHS area should be Larimer County');
  process.exit(1);
}

const nidito = byId.get('el-nidito-early-head-start');
if (nidito.category !== 'family_children') {
  console.error('El Nidito must stay on family_children — do not recategorize');
  process.exit(1);
}
if (nidito.phone !== '970-221-1615') {
  console.error('El Nidito classroom phone should be 970-221-1615');
  process.exit(1);
}
if (!/309 Hickory/.test(nidito.address ?? '')) {
  console.error('El Nidito should be 309 Hickory Street');
  process.exit(1);
}

const hs = byId.get('head-start-larimer');
if (hs.category !== 'family_children') {
  console.error('Head Start preschool must stay on family_children — do not recategorize');
  process.exit(1);
}

console.log('OK: Early Head Start listings');
