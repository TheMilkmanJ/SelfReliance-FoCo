import { RESOURCES, filterByArea, type AreaFilter } from './resources';
import type { Resource } from './types';

export type GiveNeedId = 'need' | 'donate' | 'volunteer';

export const GIVE_NEED_PIN = 'people-helping-people';

export const GIVE_NEED_CHIPS: {
  id: GiveNeedId;
  label: string;
  short: string;
  blurb: string;
}[] = [
  {
    id: 'need',
    label: 'I need something',
    short: 'Need',
    blurb: 'Free furniture, clothes, food, and pet food. Call before you go.',
  },
  {
    id: 'donate',
    label: 'I can donate',
    short: 'Donate',
    blurb: 'Who takes furniture, household goods, food, or pet food.',
  },
  {
    id: 'volunteer',
    label: 'I can volunteer',
    short: 'Volunteer',
    blurb: 'Desks that need hands: lift, sort, serve, or trap-neuter cats.',
  },
];

/** Curated desks that already do give / get / volunteer. Not a classifieds feed. */
export const GIVE_NEED_IDS: Record<GiveNeedId, readonly string[]> = {
  need: [
    'people-helping-people',
    'noco-community-store',
    'clothe-the-people-fort-collins',
    'kids-closet-fort-collins',
    'salvation-army-care-closet',
    'st-johns-clothing-closet',
    'st-johns-lutheran-pantry',
    'hns-clothing-boutique',
    'hns-berthoud-clothing',
    'salvation-army-loveland-clothing',
    'food-bank-larimer-fort-collins',
    'food-bank-larimer-loveland',
    'foco-cafe',
    'food-not-bombs-fort-collins',
    'four-paws-pet-pantry',
    'animal-friends-kibble',
  ],
  donate: [
    'people-helping-people',
    'habitat-restore-fort-collins',
    'habitat-restore-loveland',
    'goodwill-fort-collins',
    'goodwill-loveland',
    'arc-thrift-fort-collins',
    'arc-thrift-loveland',
    'eco-thrift-fort-collins',
    'food-bank-larimer-fort-collins',
    'food-bank-larimer-loveland',
    'four-paws-pet-pantry',
  ],
  volunteer: [
    'people-helping-people',
    'foco-cafe',
    'food-not-bombs-fort-collins',
    'noco-community-store',
    'clothe-the-people-fort-collins',
    'salvation-army-care-closet',
    'noco-friends-of-ferals',
  ],
};

const BY_ID = new Map(RESOURCES.map((r) => [r.id, r]));

export function giveNeedResources(kind: GiveNeedId, area: AreaFilter): Resource[] {
  const pool = GIVE_NEED_IDS[kind]
    .map((id) => BY_ID.get(id))
    .filter((r): r is Resource => Boolean(r));
  const inArea = filterByArea(pool, area);
  return inArea.slice().sort((a, b) => {
    if (a.id === GIVE_NEED_PIN) return -1;
    if (b.id === GIVE_NEED_PIN) return 1;
    return a.name.localeCompare(b.name);
  });
}
