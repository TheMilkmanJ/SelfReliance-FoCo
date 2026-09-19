import { STRINGS } from '../i18n/translate';
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
  'transfort-trip-planner',
  'transfort-flex',
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
  'adult-protective-services-larimer',
  'va-clinic-fort-collins',
  'va-clinic-loveland',
  'dentaquest-health-first',
  'energy-resource-center-wap',
  'poudre-libraries-hotspots',
  'ncha-naloxone',
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
  'transfort-flex',
  'transfort-max',
  'transfort-trip-planner',
  'csu-ram-scholars',
  'csu-pride-resource-center',
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
  'wellington-public-library',
  'berthoud-community-library',
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
  'poudre-valley-early-head-start',
  'el-nidito-early-head-start',
  'larimer-ccap',
  'mcdonalds-archways-to-opportunity',
  'wioa-paid-certificates-larimer',
  'kind-kids-in-need-of-dentistry',
  'poudre-libraries-esl',
  'poudre-libraries-hotspots',
  'csu-early-childhood-center',
  'frcc-ccampis',
  'sava-center',
  'dentaquest-health-first',
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
      resource.id === 'poudre-valley-early-head-start' ||
      resource.id === 'el-nidito-early-head-start' ||
      resource.id === 'colorado-universal-preschool' ||
      resource.id === 'thompson-integrated-early-childhood' ||
      resource.id === 'larimer-ccap' ||
      resource.id === 'kind-kids-in-need-of-dentistry' ||
      resource.id === 'csu-early-childhood-center' ||
      resource.id === 'frcc-ccampis'
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
      resource.id === 'xfinity-internet-essentials' ||
      resource.id === 'frcc-ccampis'
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
      resource.id === 'kind-kids-in-need-of-dentistry' ||
      resource.id === 'sava-center' ||
      resource.id === 'dentaquest-health-first'
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
  'transfort-flex',
  'transfort-trip-planner',
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
  'poudre-valley-early-head-start',
  'el-nidito-early-head-start',
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
  'murphy-dmv-mail-letter',
  'colorado-necessary-documents',
  '211-heat-and-cold',
  'murphy-inclement-weather',
  'animal-friends-kibble',
  'four-paws-pet-pantry',
  'until-theyre-home',
  'people-helping-people',
  'homeward-alliance-wagees',
  'salvation-army-care-closet',
  'st-johns-clothing-closet',
  'hns-clothing-boutique',
  'sava-center',
  'ncha-naloxone',
  'poudre-libraries-hotspots',
  'public-defender-fort-collins',
  'colorado-parole-fort-collins',
  'cwise-parole-reentry',
  'larimer-community-corrections',
  'larimer-jail-visiting',
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
      resource.id === 'nococo-cahps' ||
      resource.id === 'sava-center' ||
      resource.id === 'salvation-army-care-closet'
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
      resource.id === 'kids-closet-fort-collins' ||
      resource.id === 'hns-clothing-boutique' ||
      resource.id === 'casa-larimer' ||
      resource.id === 'project-self-sufficiency' ||
      resource.id === 'poudre-valley-early-head-start' ||
      resource.id === 'el-nidito-early-head-start' ||
      resource.id === 'head-start-larimer'
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

/** Shown first on the Pregnancy & Birth tile. Existing WIC / NFP / Birthline stay in their own categories. */
export const PREGNANCY_PINNED_IDS = [
  'poudre-valley-prenatal',
  'wic-larimer',
  'uchealth-birth-center-pvh',
  'peaceful-birth-company',
  'true-north-birth-wellness',
  'nurse-family-partnership-larimer',
] as const;

const PREGNANCY_ALWAYS = new Set<string>([
  ...PREGNANCY_PINNED_IDS,
  'uchealth-birth-center-mcr',
  'banner-fort-collins-birth',
  'golden-hour-midwifery',
  'jodias-midwifery',
  'north-colorado-midwifery',
  'salud-mamas-prenatal',
  'colorado-medicaid-doula',
  'colorado-midwives-association',
  'maternal-mental-health-hotline',
  'birthline-loveland',
  'gabriel-house-marisol',
  'salud-family-health-fort-collins',
  'sunrise-community-health-loveland',
  'colorado-peak',
  'united-way-211',
  'kids-closet-fort-collins',
  'health-district-connections-sud',
  'summitstone-crisis',
]);

export type PregnancyChipId =
  | 'all'
  | 'hospital'
  | 'water'
  | 'hypno'
  | 'midwife'
  | 'doula'
  | 'prenatal'
  | 'supplies';

export const PREGNANCY_CHIPS: Array<{ id: PregnancyChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'hospital', label: 'Hospital', icon: 'medkit-outline' },
  { id: 'water', label: 'Water birth', icon: 'water-outline' },
  { id: 'hypno', label: 'HypnoBirthing', icon: 'moon-outline' },
  { id: 'midwife', label: 'Midwife / home', icon: 'home-outline' },
  { id: 'doula', label: 'Doula', icon: 'people-outline' },
  { id: 'prenatal', label: 'Prenatal & WIC', icon: 'nutrition-outline' },
  { id: 'supplies', label: 'Diapers & clothes', icon: 'shirt-outline' },
];

/** Pregnancy tile plus related desks (WIC, diapers) that stay in their original categories. */
export function isPregnancyResource(resource: Resource): boolean {
  if (resource.category === 'pregnancy') return true;
  return PREGNANCY_ALWAYS.has(resource.id);
}

export function matchesPregnancyChip(resource: Resource, chip: PregnancyChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'hospital') {
    return (
      resource.id === 'uchealth-birth-center-pvh' ||
      resource.id === 'uchealth-birth-center-mcr' ||
      resource.id === 'banner-fort-collins-birth' ||
      resource.id === 'poudre-valley-prenatal'
    );
  }
  if (chip === 'water') {
    return (
      resource.id === 'true-north-birth-wellness' ||
      resource.id === 'golden-hour-midwifery' ||
      hasAnyTag(resource, ['water birth', 'waterbirth'])
    );
  }
  if (chip === 'hypno') {
    return resource.id === 'peaceful-birth-company' || hasAnyTag(resource, ['hypnobirthing', 'hypnobabies']);
  }
  if (chip === 'midwife') {
    return (
      resource.id === 'true-north-birth-wellness' ||
      resource.id === 'golden-hour-midwifery' ||
      resource.id === 'jodias-midwifery' ||
      resource.id === 'north-colorado-midwifery' ||
      resource.id === 'colorado-midwives-association' ||
      hasAnyTag(resource, ['midwife', 'home birth'])
    );
  }
  if (chip === 'doula') {
    return (
      resource.id === 'peaceful-birth-company' ||
      resource.id === 'colorado-medicaid-doula' ||
      hasAnyTag(resource, ['doula'])
    );
  }
  if (chip === 'prenatal') {
    return (
      resource.id === 'poudre-valley-prenatal' ||
      resource.id === 'salud-mamas-prenatal' ||
      resource.id === 'wic-larimer' ||
      resource.id === 'nurse-family-partnership-larimer' ||
      resource.id === 'salud-family-health-fort-collins' ||
      resource.id === 'sunrise-community-health-loveland' ||
      resource.id === 'colorado-peak' ||
      resource.id === 'maternal-mental-health-hotline' ||
      resource.id === 'health-district-connections-sud' ||
      hasAnyTag(resource, ['prenatal', 'pregnancy', 'wic'])
    );
  }
  if (chip === 'supplies') {
    return (
      resource.id === 'wic-larimer' ||
      resource.id === 'birthline-loveland' ||
      resource.id === 'gabriel-house-marisol' ||
      resource.id === 'kids-closet-fort-collins' ||
      hasAnyTag(resource, ['diapers', 'baby supplies', 'maternity'])
    );
  }
  return true;
}

export function sortPregnancyResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, PREGNANCY_PINNED_IDS);
}

/** Shown first on Families & Kids. Head Start preschool stays on its original card. */
export const FAMILY_PINNED_IDS = [
  'poudre-valley-early-head-start',
  'el-nidito-early-head-start',
  'head-start-larimer',
] as const;

export function sortFamilyResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, FAMILY_PINNED_IDS);
}

/** Child Care tile also shows Early Head Start by id — do not recategorize those listings. */
const CHILDCARE_ALWAYS = new Set<string>([
  'poudre-valley-early-head-start',
  'el-nidito-early-head-start',
  'head-start-larimer',
]);

export function isChildcareResource(resource: Resource): boolean {
  if (resource.category === 'childcare') return true;
  return CHILDCARE_ALWAYS.has(resource.id);
}

export function sortChildcareResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, FAMILY_PINNED_IDS);
}

/** Shown first on the Voters tile. Transfort / COLT / SAINT stay in Rides. */
export const VOTING_PINNED_IDS = [
  'larimer-elections-office',
  'govote-colorado',
  'larimer-where-to-vote',
  'transfort',
  'colorado-ballottrax',
  'ride-noco',
] as const;

const VOTING_ALWAYS = new Set<string>([
  ...VOTING_PINNED_IDS,
  'colorado-sos-elections',
  'colorado-language-assistance-hotline',
  'larimer-military-overseas',
  'vote411-colorado',
  'lwv-larimer',
  'larimer-election-judges',
  'colorado-know-your-rights',
  'transfort-dial-a-ride',
  'transfort-trip-planner',
  'transfort-flex',
  'transfort-max',
  'transfort-routes-map',
  'colt-loveland',
  'saint-senior-transport',
  'the-peak-estes-park',
  'colorado-dmv-fort-collins',
  'colorado-dmv-loveland',
  'relay-colorado',
]);

export type VotingChipId =
  | 'all'
  | 'register'
  | 'drop'
  | 'inperson'
  | 'rides'
  | 'help'
  | 'military'
  | 'ballot';

export const VOTING_CHIPS: Array<{ id: VotingChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'register', label: 'Register', icon: 'create-outline' },
  { id: 'drop', label: 'Ballot boxes', icon: 'file-tray-outline' },
  { id: 'inperson', label: 'Vote in person', icon: 'business-outline' },
  { id: 'rides', label: 'Rides', icon: 'bus-outline' },
  { id: 'help', label: 'ADA & language', icon: 'accessibility-outline' },
  { id: 'military', label: 'Military / overseas', icon: 'globe-outline' },
  { id: 'ballot', label: "What's on the ballot", icon: 'newspaper-outline' },
];

export function isVotingResource(resource: Resource): boolean {
  if (resource.category === 'voting') return true;
  return VOTING_ALWAYS.has(resource.id);
}

export function matchesVotingChip(resource: Resource, chip: VotingChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'register') {
    return (
      resource.id === 'larimer-elections-office' ||
      resource.id === 'govote-colorado' ||
      resource.id === 'colorado-sos-elections' ||
      resource.id === 'colorado-dmv-fort-collins' ||
      resource.id === 'colorado-dmv-loveland'
    );
  }
  if (chip === 'drop') {
    return resource.id === 'larimer-where-to-vote' || resource.id === 'larimer-elections-office';
  }
  if (chip === 'inperson') {
    return (
      resource.id === 'larimer-where-to-vote' ||
      resource.id === 'larimer-elections-office' ||
      resource.id === 'govote-colorado'
    );
  }
  if (chip === 'rides') {
    return (
      resource.id === 'transfort' ||
      resource.id === 'transfort-dial-a-ride' ||
      resource.id === 'transfort-trip-planner' ||
      resource.id === 'transfort-flex' ||
      resource.id === 'transfort-max' ||
      resource.id === 'transfort-routes-map' ||
      resource.id === 'colt-loveland' ||
      resource.id === 'saint-senior-transport' ||
      resource.id === 'ride-noco' ||
      resource.id === 'the-peak-estes-park' ||
      resource.id === 'larimer-where-to-vote'
    );
  }
  if (chip === 'help') {
    return (
      resource.id === 'larimer-elections-office' ||
      resource.id === 'colorado-language-assistance-hotline' ||
      resource.id === 'colorado-know-your-rights' ||
      resource.id === 'transfort-dial-a-ride' ||
      resource.id === 'saint-senior-transport' ||
      resource.id === 'relay-colorado'
    );
  }
  if (chip === 'military') {
    return resource.id === 'larimer-military-overseas' || resource.id === 'colorado-sos-elections';
  }
  if (chip === 'ballot') {
    return (
      resource.id === 'vote411-colorado' ||
      resource.id === 'lwv-larimer' ||
      resource.id === 'govote-colorado' ||
      resource.id === 'colorado-know-your-rights'
    );
  }
  return true;
}

export function sortVotingResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, VOTING_PINNED_IDS);
}

/** Shown first on the Language tile. Immigrant legal desks stay on Immigrants. */
export const LANGUAGE_PINNED_IDS = [
  'irc-northern-colorado',
  'ianc-fort-collins',
  'csu-isss',
  'poudre-libraries-esl',
  'colorado-language-assistance-hotline',
] as const;

const LANGUAGE_ALWAYS = new Set<string>([
  ...LANGUAGE_PINNED_IDS,
  'csu-place-english',
  'poudre-libraries-adult-learning',
  'fuerza-latina-immigrant-hotline',
  'fuerza-latina',
  'colorado-immigrant-rights-coalition',
  'relay-colorado',
  'united-way-211',
]);

export type LanguageChipId = 'all' | 'interpreters' | 'english' | 'spanish' | 'more';

export const LANGUAGE_CHIPS: Array<{ id: LanguageChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'interpreters', label: 'Interpreters', icon: 'chatbubbles-outline' },
  { id: 'english', label: 'English classes', icon: 'school-outline' },
  { id: 'spanish', label: 'Spanish help', icon: 'call-outline' },
  { id: 'more', label: 'Hindi, Chinese, more', icon: 'globe-outline' },
];

/** Language tile plus related desks that stay in their original categories. */
export function isLanguageResource(resource: Resource): boolean {
  if (resource.category === 'language') return true;
  return LANGUAGE_ALWAYS.has(resource.id);
}

export function matchesLanguageChip(resource: Resource, chip: LanguageChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'interpreters') {
    return (
      resource.id === 'irc-northern-colorado' ||
      resource.id === 'colorado-language-assistance-hotline' ||
      resource.id === 'relay-colorado' ||
      resource.id === 'csu-isss' ||
      resource.id === 'united-way-211' ||
      hasAnyTag(resource, ['interpreter', 'interpretation', 'language'])
    );
  }
  if (chip === 'english') {
    return (
      resource.id === 'poudre-libraries-esl' ||
      resource.id === 'irc-northern-colorado' ||
      resource.id === 'csu-place-english' ||
      resource.id === 'poudre-libraries-adult-learning' ||
      hasAnyTag(resource, ['esl', 'english', 'english classes'])
    );
  }
  if (chip === 'spanish') {
    return (
      resource.id === 'fuerza-latina-immigrant-hotline' ||
      resource.id === 'fuerza-latina' ||
      resource.id === 'colorado-language-assistance-hotline' ||
      resource.id === 'colorado-immigrant-rights-coalition' ||
      resource.id === 'united-way-211' ||
      hasAnyTag(resource, ['spanish'])
    );
  }
  if (chip === 'more') {
    return (
      resource.id === 'ianc-fort-collins' ||
      resource.id === 'csu-isss' ||
      resource.id === 'irc-northern-colorado' ||
      resource.id === 'colorado-language-assistance-hotline' ||
      resource.id === 'united-way-211' ||
      hasAnyTag(resource, ['hindi', 'indian', 'chinese', 'vietnamese', 'korean', 'arabic'])
    );
  }
  return true;
}

export function sortLanguageResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, LANGUAGE_PINNED_IDS);
}

/** Shown first on the Marriage tile. Clerk / DMV / SSA stay on Identification. */
export const MARRIAGE_PINNED_IDS = [
  'larimer-clerk-marriage',
  'larimer-clerk-marriage-copy',
  'ssa-name-change',
  'colorado-dmv-fort-collins',
  'social-security-fort-collins',
] as const;

const MARRIAGE_ALWAYS = new Set<string>([
  ...MARRIAGE_PINNED_IDS,
  'colorado-dmv-loveland',
  'ssa-card-replacement',
  'united-way-211',
]);

export type MarriageChipId = 'all' | 'license' | 'copy' | 'name';

export const MARRIAGE_CHIPS: Array<{ id: MarriageChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'license', label: 'Get a license', icon: 'create-outline' },
  { id: 'copy', label: 'Certified copy', icon: 'copy-outline' },
  { id: 'name', label: 'Change your name', icon: 'id-card-outline' },
];

export function isMarriageResource(resource: Resource): boolean {
  if (resource.category === 'marriage') return true;
  return MARRIAGE_ALWAYS.has(resource.id);
}

export function matchesMarriageChip(resource: Resource, chip: MarriageChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'license') return resource.id === 'larimer-clerk-marriage';
  if (chip === 'copy') return resource.id === 'larimer-clerk-marriage-copy' || resource.id === 'larimer-clerk-marriage';
  if (chip === 'name') {
    return (
      resource.id === 'ssa-name-change' ||
      resource.id === 'ssa-card-replacement' ||
      resource.id === 'social-security-fort-collins' ||
      resource.id === 'colorado-dmv-fort-collins' ||
      resource.id === 'colorado-dmv-loveland' ||
      resource.id === 'larimer-clerk-marriage-copy'
    );
  }
  return true;
}

export function sortMarriageResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, MARRIAGE_PINNED_IDS);
}

/** Shown first on the Divorce tile. Legal aid and crisis desks stay on Legal / Crisis. */
export const DIVORCE_PINNED_IDS = [
  'colorado-self-help-court',
  'colorado-courts-divorce',
  'colorado-legal-services-fort-collins',
  'larimer-child-support',
  'crossroads-safehouse',
] as const;

const DIVORCE_ALWAYS = new Set<string>([
  ...DIVORCE_PINNED_IDS,
  'ask-a-lawyer-larimer',
  'larimer-bar-pro-bono',
  'csu-student-legal-services',
  'casa-larimer',
  'larimer-children-youth-family',
  'project-self-sufficiency',
  'alternatives-to-violence',
  'estes-valley-crisis-advocates',
  'ssa-name-change',
  'colorado-dmv-fort-collins',
  'colorado-dmv-loveland',
  'ssa-card-replacement',
  'social-security-fort-collins',
  'united-way-211',
]);

export type DivorceChipId = 'all' | 'court' | 'lawyer' | 'kids' | 'safety' | 'name';

export const DIVORCE_CHIPS: Array<{ id: DivorceChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'court', label: 'Court forms', icon: 'document-text-outline' },
  { id: 'lawyer', label: 'A lawyer', icon: 'briefcase-outline' },
  { id: 'kids', label: 'Kids & support', icon: 'people-outline' },
  { id: 'safety', label: 'Leave safely', icon: 'shield-outline' },
  { id: 'name', label: 'Change your name', icon: 'id-card-outline' },
];

export function isDivorceResource(resource: Resource): boolean {
  if (resource.category === 'divorce') return true;
  return DIVORCE_ALWAYS.has(resource.id);
}

export function matchesDivorceChip(resource: Resource, chip: DivorceChipId): boolean {
  if (chip === 'all') return true;
  if (chip === 'court') {
    return resource.id === 'colorado-self-help-court' || resource.id === 'colorado-courts-divorce';
  }
  if (chip === 'lawyer') {
    return (
      resource.id === 'colorado-legal-services-fort-collins' ||
      resource.id === 'ask-a-lawyer-larimer' ||
      resource.id === 'larimer-bar-pro-bono' ||
      resource.id === 'csu-student-legal-services' ||
      resource.id === 'colorado-self-help-court'
    );
  }
  if (chip === 'kids') {
    return (
      resource.id === 'larimer-child-support' ||
      resource.id === 'casa-larimer' ||
      resource.id === 'larimer-children-youth-family' ||
      resource.id === 'project-self-sufficiency' ||
      resource.id === 'colorado-courts-divorce' ||
      resource.id === 'colorado-self-help-court'
    );
  }
  if (chip === 'safety') {
    return (
      resource.id === 'crossroads-safehouse' ||
      resource.id === 'alternatives-to-violence' ||
      resource.id === 'estes-valley-crisis-advocates' ||
      resource.id === 'united-way-211'
    );
  }
  if (chip === 'name') {
    return (
      resource.id === 'ssa-name-change' ||
      resource.id === 'ssa-card-replacement' ||
      resource.id === 'social-security-fort-collins' ||
      resource.id === 'colorado-dmv-fort-collins' ||
      resource.id === 'colorado-dmv-loveland' ||
      resource.id === 'colorado-self-help-court' ||
      resource.id === 'colorado-courts-divorce'
    );
  }
  return true;
}

export function sortDivorceResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, DIVORCE_PINNED_IDS);
}

/** Shown first on Faith & religion. Church pantries stay on Food / Clothes. */
export const RELIGION_PINNED_IDS = [
  'har-shalom',
  'chabad-northern-colorado',
  'temple-or-hadash',
  'csu-hillel',
  'islamic-center-fort-collins',
  'st-joseph-catholic-fort-collins',
] as const;

const RELIGION_ALWAYS = new Set<string>([
  ...RELIGION_PINNED_IDS,
  'jewish-family-service-colorado',
  'first-united-methodist-fort-collins',
  'heruka-kadampa-fort-collins',
  'sanatan-mandir-brighton',
  'colorado-singh-sabha',
  'foothills-unitarian-church',
  'fort-collins-interfaith-council',
  'st-johns-lutheran-pantry',
  'st-johns-clothing-closet',
  'kids-closet-fort-collins',
  'loveland-vineyard-pantry',
  'laporte-presbyterian-pantry',
  'adventist-community-services-loveland',
  'foothills-unitarian-mobile-pantry',
  'salvation-army-fort-collins',
  'salvation-army-loveland',
  'salvation-army-care-closet',
  'catholic-charities-samaritan-house',
  'catholic-charities-senior-services',
  'catholic-charities-immigration',
  'fort-collins-rescue-mission',
  'cws-fort-collins',
  'ianc-fort-collins',
  'family-housing-network',
  'united-way-211',
]);

export type ReligionChipId = 'all' | 'jewish' | 'christian' | 'muslim' | 'hindu' | 'buddhist' | 'sikh' | 'interfaith';

const RELIGION_BY_CHIP: Record<Exclude<ReligionChipId, 'all'>, ReadonlySet<string>> = {
  jewish: new Set([
    'har-shalom',
    'chabad-northern-colorado',
    'temple-or-hadash',
    'csu-hillel',
    'jewish-family-service-colorado',
  ]),
  christian: new Set([
    'st-joseph-catholic-fort-collins',
    'first-united-methodist-fort-collins',
    'st-johns-lutheran-pantry',
    'st-johns-clothing-closet',
    'kids-closet-fort-collins',
    'loveland-vineyard-pantry',
    'laporte-presbyterian-pantry',
    'adventist-community-services-loveland',
    'salvation-army-fort-collins',
    'salvation-army-loveland',
    'salvation-army-care-closet',
    'catholic-charities-samaritan-house',
    'catholic-charities-senior-services',
    'catholic-charities-immigration',
    'fort-collins-rescue-mission',
    'cws-fort-collins',
  ]),
  muslim: new Set(['islamic-center-fort-collins']),
  hindu: new Set(['sanatan-mandir-brighton', 'ianc-fort-collins']),
  buddhist: new Set(['heruka-kadampa-fort-collins']),
  sikh: new Set(['colorado-singh-sabha', 'ianc-fort-collins']),
  interfaith: new Set([
    'foothills-unitarian-church',
    'fort-collins-interfaith-council',
    'foothills-unitarian-mobile-pantry',
    'family-housing-network',
    'united-way-211',
  ]),
};

export const RELIGION_CHIPS: Array<{ id: ReligionChipId; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'jewish', label: 'Jewish', icon: 'star-outline' },
  { id: 'christian', label: 'Christian', icon: 'book-outline' },
  { id: 'muslim', label: 'Muslim', icon: 'moon-outline' },
  { id: 'hindu', label: 'Hindu', icon: 'sunny-outline' },
  { id: 'buddhist', label: 'Buddhist', icon: 'leaf-outline' },
  { id: 'sikh', label: 'Sikh', icon: 'ellipse-outline' },
  { id: 'interfaith', label: 'Interfaith', icon: 'globe-outline' },
];

export function isReligionResource(resource: Resource): boolean {
  if (resource.category === 'religion') return true;
  return RELIGION_ALWAYS.has(resource.id);
}

export function matchesReligionChip(resource: Resource, chip: ReligionChipId): boolean {
  if (chip === 'all') return true;
  return RELIGION_BY_CHIP[chip].has(resource.id);
}

export function sortReligionResources(list: Resource[]): Resource[] {
  return sortPinnedResources(list, RELIGION_PINNED_IDS);
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
    const catKeyName = `cat.${r.category}` as const;
    const catLabels = Object.values(STRINGS).flatMap((dict) => [
      dict[`${catKeyName}.label` as keyof typeof dict] ?? '',
      dict[`${catKeyName}.short` as keyof typeof dict] ?? '',
    ]);
    const hay = normalize(
      [
        r.name,
        r.description,
        r.area,
        r.address ?? '',
        r.tags.join(' '),
        catLabel,
        certLabel,
        ...catLabels,
      ].join(' '),
    );
    return terms.every((term) => hay.includes(term));
  });
}
