import { CATEGORY_MAP } from './categories';
import { CERT_GROUP_MAP } from './certGroups';
import raw from './resources.json';
import type { Area, CategoryId, Resource } from './types';

const AREA_ORDER: Area[] = [
  'Fort Collins',
  'Loveland',
  'Estes Park',
  'Berthoud',
  'Wellington',
  'Larimer County',
  'Colorado (statewide)',
  'National',
];

export const RESOURCES: Resource[] = (raw as { resources: Resource[] }).resources
  .slice()
  .sort((a, b) => {
    const areaDiff = AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area);
    if (areaDiff !== 0) return areaDiff;
    return a.name.localeCompare(b.name);
  });

export type AreaFilter = Area | 'All';

/** City pick still includes county-wide, statewide, and national programs. */
export function matchesArea(resource: Resource, area: AreaFilter): boolean {
  if (area === 'All') return true;
  return (
    resource.area === area ||
    resource.area === 'Larimer County' ||
    resource.area === 'Colorado (statewide)' ||
    resource.area === 'National'
  );
}

export function filterByArea(pool: Resource[], area: AreaFilter): boolean {
  return pool.filter((r) => matchesArea(r, area));
}
