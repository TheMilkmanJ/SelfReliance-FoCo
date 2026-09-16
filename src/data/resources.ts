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

/** Shown first on the Have a disability? tab. */
export const DISABILITY_PINNED_IDS = [
  'and-med-9',
  'uchealth-family-medicine-center',
  'get-foco-recreation-pass',
  'lions-club-eyeglasses',
  'get-foco',
  'fc-adaptive-recreation',
] as const;

const DISABILITY_ALWAYS = new Set<string>([
  ...DISABILITY_PINNED_IDS,
  'salud-family-health-fort-collins',
  'sunrise-community-health-loveland',
  'ensight-skills-center',
  'transfort',
  'transfort-dial-a-ride',
  'colt-loveland',
  'saint-senior-transport',
  'medicaid-nemt-transdev',
  'ride-noco',
  'the-peak-estes-park',
  'poudre-express',
  'bustang-north',
  'bats-berthoud',
  'colorado-dvr-loveland',
  'spirit-crossing-clubhouse',
  'social-security-fort-collins',
  'ssa-disability-benefits',
  'colorado-peak',
  'larimer-human-services-benefits',
  'meals-on-wheels-fort-collins',
  'meals-on-wheels-loveland',
  'dental-lifeline-colorado',
  'larimer-veterans-service-office',
  'colorado-ctp-deaf',
  'relay-colorado',
  'colorado-talking-book-library',
  'hearts-and-horses',
  'disability-law-colorado',
  'colorado-cross-disability-coalition',
  'assistive-technology-colorado',
  'fc-ada-coordinator',
  'colorado-disabled-parking',
  'medicaid-buy-in',
  'home-care-allowance',
  'brain-injury-alliance-colorado',
  'nami-larimer',
  'special-olympics-colorado',
  'rocky-mountain-ada-center',
  'dav-van-larimer',
  'ticket-to-work',
  'colorado-housing-search',
  'colorado-legal-services-fort-collins',
  'colorado-able',
  'hcbs-waivers-colorado',
  'medicare-extra-help',
  'loveland-adaptive-recreation',
  'childrens-speech-reading-center',
  'parent-to-parent-colorado',
  'autism-society-colorado',
  'colorado-center-for-the-blind',
  'nfb-newsline-colorado',
  'aftersight',
  'bookshare',
  'easterseals-colorado-loveland',
  'psd-swap',
  'thompson-swap',
  'jan-job-accommodation-network',
  'colorado-civil-rights-division',
  'ada-info-line',
  'hud-housing-discrimination',
  'csu-student-disability-center',
  'frcc-disability-support',
  'csu-ram-scholars',
  'csu-ccp',
  'in-pathways-inclusive-higher-ed',
]);

const SENIOR_ONLY_IDS = new Set([
  'catholic-charities-senior-services',
  'uchealth-aspen-club',
  'fort-collins-senior-center',
  'chilson-senior-center-loveland',
]);

const DISABILITY_TAG =
  /\b(disability|disabled|paratransit|ssdi|eyeglasses|low vision|adaptive|idd|vocational rehab|independent living|special education|child find|early intervention|developmental)\b|^ssi$/;

/** Listings useful if you or someone you help has a disability. */
export function isDisabilityResource(resource: Resource): boolean {
  if (resource.certGroup) return false;
  if (DISABILITY_ALWAYS.has(resource.id)) return true;
  if (SENIOR_ONLY_IDS.has(resource.id)) return false;
  if (resource.category === 'special_needs') return true;
  if (resource.category === 'seniors_disability') return true;
  return resource.tags.some((tag) => DISABILITY_TAG.test(tag.toLowerCase()));
}

export type DisabilityChipId =
  | 'all'
  | 'med9'
  | 'glasses'
  | 'deaf'
  | 'rec'
  | 'rides'
  | 'jobs'
  | 'kids'
  | 'rights';

export const DISABILITY_CHIPS: Array<{ id: DisabilityChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'med9', label: 'Med-9 & cash', icon: 'card-outline' },
  { id: 'glasses', label: 'Glasses & vision', icon: 'eye-outline' },
  { id: 'deaf', label: 'Deaf & phones', icon: 'call-outline' },
  { id: 'rec', label: 'Rec & pools', icon: 'water-outline' },
  { id: 'rides', label: 'Rides', icon: 'bus-outline' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase-outline' },
  { id: 'kids', label: 'Kids', icon: 'hand-left-outline' },
  { id: 'rights', label: 'Rights', icon: 'shield-checkmark-outline' },
];

export function matchesDisabilityChip(resource: Resource, chip: DisabilityChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'med9') {
    return (
      resource.id === 'and-med-9' ||
      resource.id === 'uchealth-family-medicine-center' ||
      resource.id === 'salud-family-health-fort-collins' ||
      resource.id === 'sunrise-community-health-loveland' ||
      resource.id === 'colorado-peak' ||
      resource.id === 'larimer-human-services-benefits' ||
      resource.id === 'medicaid-buy-in' ||
      resource.id === 'home-care-allowance' ||
      resource.id === 'hcbs-waivers-colorado' ||
      resource.id === 'colorado-able' ||
      resource.id === 'medicare-extra-help' ||
      resource.tags.includes('med-9') ||
      resource.tags.includes('and')
    );
  }
  if (chip === 'glasses') {
    return (
      resource.id === 'lions-club-eyeglasses' ||
      resource.id === 'ensight-skills-center' ||
      resource.id === 'uchealth-family-medicine-center' ||
      resource.id === 'colorado-talking-book-library' ||
      resource.id === 'colorado-center-for-the-blind' ||
      resource.id === 'nfb-newsline-colorado' ||
      resource.id === 'aftersight' ||
      resource.id === 'bookshare' ||
      resource.tags.includes('eyeglasses') ||
      resource.tags.includes('vision') ||
      resource.tags.includes('blind')
    );
  }
  if (chip === 'deaf') {
    return (
      resource.id === 'colorado-ctp-deaf' ||
      resource.id === 'relay-colorado' ||
      resource.tags.includes('deaf') ||
      resource.tags.includes('hard of hearing') ||
      resource.tags.includes('deafblind')
    );
  }
  if (chip === 'rec') {
    return (
      resource.id === 'get-foco' ||
      resource.id === 'get-foco-recreation-pass' ||
      resource.id === 'fc-adaptive-recreation' ||
      resource.id === 'loveland-adaptive-recreation' ||
      resource.id === 'hearts-and-horses' ||
      resource.id === 'special-olympics-colorado' ||
      resource.tags.includes('therapy pool')
    );
  }
  if (chip === 'rides') return resource.category === 'transportation';
  if (chip === 'jobs') {
    return (
      resource.category === 'employment' ||
      resource.id === 'colorado-dvr-loveland' ||
      resource.id === 'ticket-to-work' ||
      resource.id === 'medicaid-buy-in' ||
      resource.id === 'psd-swap' ||
      resource.id === 'thompson-swap' ||
      resource.id === 'jan-job-accommodation-network' ||
      resource.id === 'csu-ccp'
    );
  }
  if (chip === 'kids') return resource.category === 'special_needs';
  if (chip === 'rights') {
    return (
      resource.category === 'legal' ||
      resource.id === 'fc-ada-coordinator' ||
      resource.id === 'disability-law-colorado' ||
      resource.id === 'colorado-cross-disability-coalition' ||
      resource.id === 'rocky-mountain-ada-center' ||
      resource.id === 'colorado-civil-rights-division' ||
      resource.id === 'ada-info-line' ||
      resource.id === 'hud-housing-discrimination'
    );
  }
  return true;
}

export function sortDisabilityResources(list: Resource[]): Resource[] {
  const pinned: readonly string[] = DISABILITY_PINNED_IDS;
  const rank = (id: string) => {
    const i = pinned.indexOf(id);
    return i === -1 ? 1000 : i;
  };
  return list.slice().sort((a, b) => {
    const pinned = rank(a.id) - rank(b.id);
    if (pinned !== 0) return pinned;
    return a.name.localeCompare(b.name);
  });
}

/** Certificate listings where the site and the credential on the card are free (exams that cost money are not tagged this way). */
export function isFreeCertificate(resource: Resource): boolean {
  return Boolean(resource.certGroup) && resource.tags.includes('free');
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
    const certLabel = r.certGroup ? CERT_GROUP_MAP[r.certGroup].label : '';
    const catLabel = CATEGORY_MAP[r.category]?.label ?? r.category.replace(/_/g, ' ');
    const hay = normalize(
      [r.name, r.description, r.area, r.address ?? '', r.tags.join(' '), catLabel, certLabel].join(' '),
    );
    return terms.every((t) => hay.includes(t));
  });
}
