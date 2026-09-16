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
  'uchealth-fmc-med9-resources',
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
      resource.id === 'uchealth-fmc-med9-resources' ||
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
      resource.id === 'uchealth-fmc-med9-resources' ||
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
      resource.id === 'uchealth-fmc-med9-resources' ||
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
  return sortPinnedResources(list, DISABILITY_PINNED_IDS);
}

/** Shown first on the Students tab. */
export const STUDENT_PINNED_IDS = [
  'fafsa',
  'front-range-community-college',
  'csu-rams-against-hunger',
  'psd-mckinney-vento',
  'poudre-libraries-adult-learning',
  'csu-student-disability-center',
  'transfort',
] as const;

const STUDENT_ALWAYS = new Set<string>([
  ...STUDENT_PINNED_IDS,
  'college-opportunity-fund',
  'colorado-opportunity-scholarship',
  'casfa',
  'colorado-asset',
  'csu-student-case-management',
  'csu-health-network',
  'csu-health-network-dental',
  'csu-student-legal-services',
  'csu-off-campus-life',
  'csu-career-center',
  'csu-financial-aid',
  'csu-psychological-services-center',
  'csu-access-center',
  'csu-academic-advancement-center',
  'csu-eoc',
  'csu-alvs',
  'csu-ramride',
  'csu-ram-scholars',
  'csu-ccp',
  'frcc-wolf-pantry',
  'frcc-financial-aid',
  'frcc-ged-testing',
  'frcc-disability-support',
  'frcc-counseling',
  'frcc-tutoring',
  'aims-loveland',
  'thompson-mckinney-vento',
  'estes-mckinney-vento',
  'psd-school-meals',
  'thompson-school-meals',
  'sun-bucks-summer-ebt',
  'mcbackpack',
  'boys-girls-clubs-larimer',
  'poudre-libraries',
  'poudre-libraries-job-center',
  'loveland-public-library',
  'estes-valley-library',
  'cultural-enrichment-center',
  'in-pathways-inclusive-higher-ed',
  'psd-swap',
  'thompson-swap',
  'psd-child-find',
  'thompson-child-find',
  'bookshare',
  'hunger-free-colorado',
  'larimer-workforce-center',
  'junior-league-career-closet',
  'xfinity-internet-essentials',
  'colorado-universal-preschool',
  'thompson-integrated-early-childhood',
  'head-start-larimer',
  'larimer-ccap',
  'mcdonalds-archways-to-opportunity',
  'wioa-paid-certificates-larimer',
  'kind-kids-in-need-of-dentistry',
]);

const STUDENT_TAG =
  /\b(student|students|college|fafsa|casfa|ged|k-12|mckinney-vento|school meals|high school|work-study|scholarship|tuition)\b/;

/** Listings useful to college, GED, and K–12 students (and the people helping them). */
export function isStudentResource(resource: Resource): boolean {
  if (STUDENT_ALWAYS.has(resource.id)) return true;
  if (resource.certGroup) return false;
  if (resource.category === 'education') return true;
  return resource.tags.some((tag) => STUDENT_TAG.test(tag.toLowerCase()));
}

export type StudentChipId = 'all' | 'college' | 'k12' | 'money' | 'food' | 'jobs' | 'health';

export const STUDENT_CHIPS: Array<{ id: StudentChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'college', label: 'College', icon: 'school-outline' },
  { id: 'k12', label: 'K–12', icon: 'book-outline' },
  { id: 'money', label: 'Money', icon: 'card-outline' },
  { id: 'food', label: 'Food', icon: 'nutrition-outline' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase-outline' },
  { id: 'health', label: 'Health', icon: 'medkit-outline' },
];

function hasAnyTag(resource: Resource, tags: string[]): boolean {
  const set = new Set(resource.tags.map((t) => t.toLowerCase()));
  return tags.some((t) => set.has(t));
}

export function matchesStudentChip(resource: Resource, chip: StudentChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'college') {
    return (
      hasAnyTag(resource, ['college', 'csu', 'frcc', 'aims', 'fafsa', 'casfa', 'cof']) ||
      resource.id.startsWith('csu-') ||
      resource.id.startsWith('frcc-') ||
      resource.id === 'front-range-community-college' ||
      resource.id === 'aims-loveland' ||
      resource.id === 'fafsa' ||
      resource.id === 'college-opportunity-fund' ||
      resource.id === 'colorado-opportunity-scholarship' ||
      resource.id === 'casfa' ||
      resource.id === 'colorado-asset' ||
      resource.id === 'in-pathways-inclusive-higher-ed' ||
      resource.id === 'transfort' ||
      resource.id === 'csu-ramride'
    );
  }
  if (chip === 'k12') {
    return (
      hasAnyTag(resource, [
        'k-12',
        'mckinney-vento',
        'school meals',
        'psd',
        'after school',
        'child find',
        'preschool',
        'youth',
      ]) ||
      resource.id === 'psd-mckinney-vento' ||
      resource.id === 'thompson-mckinney-vento' ||
      resource.id === 'estes-mckinney-vento' ||
      resource.id === 'psd-school-meals' ||
      resource.id === 'thompson-school-meals' ||
      resource.id === 'sun-bucks-summer-ebt' ||
      resource.id === 'mcbackpack' ||
      resource.id === 'boys-girls-clubs-larimer' ||
      resource.id === 'cultural-enrichment-center' ||
      resource.id === 'psd-swap' ||
      resource.id === 'thompson-swap' ||
      resource.id === 'psd-child-find' ||
      resource.id === 'thompson-child-find' ||
      resource.id === 'head-start-larimer' ||
      resource.id === 'colorado-universal-preschool' ||
      resource.id === 'thompson-integrated-early-childhood' ||
      resource.id === 'larimer-ccap' ||
      resource.id === 'kind-kids-in-need-of-dentistry'
    );
  }
  if (chip === 'money') {
    return (
      hasAnyTag(resource, [
        'financial aid',
        'fafsa',
        'casfa',
        'scholarship',
        'tuition',
        'cof',
        'pell',
        'work-study',
        'ccap',
      ]) ||
      resource.id === 'fafsa' ||
      resource.id === 'casfa' ||
      resource.id === 'college-opportunity-fund' ||
      resource.id === 'colorado-opportunity-scholarship' ||
      resource.id === 'colorado-asset' ||
      resource.id === 'csu-financial-aid' ||
      resource.id === 'frcc-financial-aid' ||
      resource.id === 'mcdonalds-archways-to-opportunity' ||
      resource.id === 'wioa-paid-certificates-larimer' ||
      resource.id === 'larimer-ccap' ||
      resource.id === 'xfinity-internet-essentials'
    );
  }
  if (chip === 'food') {
    return (
      resource.category === 'food' ||
      hasAnyTag(resource, ['pantry', 'school meals', 'snap', 'meals', 'free lunch'])
    );
  }
  if (chip === 'jobs') {
    return (
      resource.category === 'employment' ||
      hasAnyTag(resource, ['jobs', 'resume', 'internships', 'career']) ||
      resource.id === 'csu-career-center' ||
      resource.id === 'poudre-libraries-job-center' ||
      resource.id === 'larimer-workforce-center' ||
      resource.id === 'junior-league-career-closet' ||
      resource.id === 'psd-swap' ||
      resource.id === 'thompson-swap' ||
      resource.id === 'csu-ccp' ||
      resource.id === 'wioa-paid-certificates-larimer'
    );
  }
  if (chip === 'health') {
    return (
      resource.category === 'health' ||
      resource.category === 'dental' ||
      hasAnyTag(resource, ['counseling', 'clinic', 'health', 'dental']) ||
      resource.id === 'csu-health-network' ||
      resource.id === 'csu-health-network-dental' ||
      resource.id === 'csu-psychological-services-center' ||
      resource.id === 'frcc-counseling' ||
      resource.id === 'kind-kids-in-need-of-dentistry'
    );
  }
  return true;
}

export function sortStudentResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, STUDENT_PINNED_IDS);
}

/** Shown first on the Homeless tab. */
export const HOMELESS_PINNED_IDS = [
  'murphy-center',
  'united-way-211',
  'fort-collins-rescue-mission',
  'catholic-charities-samaritan-house',
  'family-housing-network',
  'loveland-resource-center',
  'neighbor-to-neighbor-fort-collins',
] as const;

const HOMELESS_ALWAYS = new Set<string>([
  ...HOMELESS_PINNED_IDS,
  'outreach-fort-collins',
  'nococo-cahps',
  'murphy-center-gear',
  'summitstone-murphy-clinic',
  'matthews-house-landing',
  'matthews-house-fort-collins',
  'homeward-alliance-housing',
  'loveland-south-railroad-shelter',
  'family-promise-larimer',
  'harvest-farm-new-life',
  'homeward-alliance-family-services',
  'neighbor-to-neighbor-loveland',
  'volunteers-of-america-noco',
  'voa-ssvf-veterans-housing',
  'housing-catalyst',
  'colorado-housing-search',
  'larimer-csbg-housing-assistance',
  'crossroads-safehouse',
  'alternatives-to-violence',
  'estes-valley-crisis-advocates',
  'food-bank-larimer-fort-collins',
  'food-bank-larimer-loveland',
  'foco-cafe',
  'food-not-bombs-fort-collins',
  'vindeket-foods',
  'salvation-army-fort-collins',
  'house-of-neighborly-service-loveland',
  'lovelands-community-kitchen',
  'crossroads-ministry-estes-park',
  'hunger-free-colorado',
  'colorado-peak',
  'larimer-human-services-benefits',
  'transfort',
  'clothe-the-people-fort-collins',
  'kids-closet-fort-collins',
  'lifeline-phone-program',
  'leap-heating-assistance',
  'fort-collins-utilities-payment-assistance',
  'colorado-legal-services-fort-collins',
  'colorado-poverty-law-project',
  'psd-mckinney-vento',
  'thompson-mckinney-vento',
  'estes-mckinney-vento',
  'wioa-paid-certificates-larimer',
  'larimer-workforce-center',
  'junior-league-career-closet',
  'health-district-northern-larimer',
  'summitstone-crisis',
  'turning-point-fort-collins',
  'disabled-resource-services-fort-collins',
  'disabled-resource-services-loveland',
  'noco-community-store',
  'st-johns-lutheran-pantry',
  'wellington-food-pantry',
  'house-of-neighborly-service-berthoud',
]);

const HOMELESS_TAG =
  /\b(homeless|homelessness|overnight shelter|day shelter|eviction prevention|unhoused|coordinated entry)\b/;

/** Listings useful tonight or this week if you do not have a stable place to stay. */
export function isHomelessResource(resource: Resource): boolean {
  if (HOMELESS_ALWAYS.has(resource.id)) return true;
  if (resource.certGroup) return false;
  if (resource.category === 'shelter') return true;
  return resource.tags.some((tag) => HOMELESS_TAG.test(tag.toLowerCase()));
}

export type HomelessChipId = 'all' | 'shelter' | 'day' | 'food' | 'housing' | 'families' | 'youth';

export const HOMELESS_CHIPS: Array<{ id: HomelessChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'shelter', label: 'Overnight', icon: 'bed-outline' },
  { id: 'day', label: 'Day help', icon: 'sunny-outline' },
  { id: 'food', label: 'Food', icon: 'nutrition-outline' },
  { id: 'housing', label: 'Housing', icon: 'home-outline' },
  { id: 'families', label: 'Families', icon: 'people-outline' },
  { id: 'youth', label: 'Youth', icon: 'happy-outline' },
];

export function matchesHomelessChip(resource: Resource, chip: HomelessChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'shelter') {
    return (
      resource.category === 'shelter' ||
      hasAnyTag(resource, ['overnight shelter', 'shelter']) ||
      resource.id === 'fort-collins-rescue-mission' ||
      resource.id === 'catholic-charities-samaritan-house' ||
      resource.id === 'loveland-south-railroad-shelter' ||
      resource.id === 'loveland-resource-center' ||
      resource.id === 'family-housing-network' ||
      resource.id === 'family-promise-larimer' ||
      resource.id === 'harvest-farm-new-life' ||
      resource.id === 'matthews-house-landing' ||
      resource.id === 'crossroads-safehouse' ||
      resource.id === 'alternatives-to-violence'
    );
  }
  if (chip === 'day') {
    return (
      hasAnyTag(resource, ['day shelter', 'showers', 'laundry', 'mail', 'outreach']) ||
      resource.id === 'murphy-center' ||
      resource.id === 'murphy-center-gear' ||
      resource.id === 'loveland-resource-center' ||
      resource.id === 'family-housing-network' ||
      resource.id === 'outreach-fort-collins' ||
      resource.id === 'matthews-house-fort-collins' ||
      resource.id === 'summitstone-murphy-clinic' ||
      resource.id === 'united-way-211' ||
      resource.id === 'nococo-cahps'
    );
  }
  if (chip === 'food') {
    return (
      resource.category === 'food' ||
      hasAnyTag(resource, ['pantry', 'meals', 'snap', 'kitchen'])
    );
  }
  if (chip === 'housing') {
    return (
      resource.category === 'housing' ||
      hasAnyTag(resource, ['rent help', 'eviction prevention', 'housing', 'coordinated entry']) ||
      resource.id === 'nococo-cahps' ||
      resource.id === 'homeward-alliance-housing' ||
      resource.id === 'neighbor-to-neighbor-fort-collins' ||
      resource.id === 'neighbor-to-neighbor-loveland' ||
      resource.id === 'voa-ssvf-veterans-housing' ||
      resource.id === 'housing-catalyst' ||
      resource.id === 'colorado-housing-search' ||
      resource.id === 'larimer-csbg-housing-assistance' ||
      resource.id === 'volunteers-of-america-noco'
    );
  }
  if (chip === 'families') {
    return (
      hasAnyTag(resource, ['families', 'kids', 'mckinney-vento']) ||
      resource.id === 'family-housing-network' ||
      resource.id === 'family-promise-larimer' ||
      resource.id === 'catholic-charities-samaritan-house' ||
      resource.id === 'homeward-alliance-family-services' ||
      resource.id === 'psd-mckinney-vento' ||
      resource.id === 'thompson-mckinney-vento' ||
      resource.id === 'estes-mckinney-vento' ||
      resource.id === 'crossroads-safehouse' ||
      resource.id === 'kids-closet-fort-collins'
    );
  }
  if (chip === 'youth') {
    return (
      resource.id === 'matthews-house-landing' ||
      resource.id === 'matthews-house-fort-collins' ||
      resource.id === 'turning-point-fort-collins' ||
      resource.id === 'psd-mckinney-vento' ||
      resource.id === 'thompson-mckinney-vento' ||
      resource.id === 'estes-mckinney-vento' ||
      resource.id === 'family-housing-network'
    );
  }
  return true;
}

export function sortHomelessResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, HOMELESS_PINNED_IDS);
}

function sortPinnedResources(list: Resource[], pinned: readonly string[]): Resource[] {
  const rank = (id: string) => {
    const i = pinned.indexOf(id);
    return i === -1 ? 1000 : i;
  };
  return list.slice().sort((a, b) => {
    const pin = rank(a.id) - rank(b.id);
    if (pin !== 0) return pin;
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
