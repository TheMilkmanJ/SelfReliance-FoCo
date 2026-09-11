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

export function filterByArea(pool: Resource[], area: AreaFilter): Resource[] {
  return pool.filter((r) => matchesArea(r, area));
}

export function countByCategory(pool: Resource[]): Record<CategoryId, number> {
  return pool.reduce(
    (acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<CategoryId, number>,
  );
}

export const RESOURCE_COUNT_BY_CATEGORY: Record<CategoryId, number> = countByCategory(RESOURCES);

export function byCategories(ids: CategoryId[]): Resource[] {
  return RESOURCES.filter((r) => ids.includes(r.category));
}

const CLOTHING_TAG = /cloth|closet|hygiene|diaper|maternity/;

/** Dedicated clothing programs plus pantries and closets that also hand out clothes. */
export function isClothingResource(resource: Resource): boolean {
  if (resource.category === 'clothing') return true;
  return resource.tags.some((tag) => CLOTHING_TAG.test(tag.toLowerCase()));
}

export function clothingResources(): Resource[] {
  return RESOURCES.filter(isClothingResource);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function searchResources(query: string, pool: Resource[] = RESOURCES): Resource[] {
  const q = normalize(query.trim());
  if (!q) return pool;
  const terms = q.split(/\s+/).filter(Boolean);
  return pool.filter((r) => {
    const hay = normalize(
      [r.name, r.description, r.area, r.address ?? '', r.tags.join(' '), r.category.replace('_', ' ')].join(' '),
    );
    return terms.every((t) => hay.includes(t));
  });
}
