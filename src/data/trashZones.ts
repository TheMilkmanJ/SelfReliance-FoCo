import type { ServiceDow } from '../lib/trashCalendar';
import { DOW_LABEL } from '../lib/trashCalendar';
import raw from './trashZones.json';

export type TrashTown = 'Fort Collins' | 'Loveland' | 'Estes Park' | 'Berthoud' | 'Wellington' | 'Unincorporated';

export type RecyclingKind = 'same-day-weekly' | 'every-other' | 'ask' | 'none';
export type YardKind = 'same-day-season' | 'in-trash' | 'ask' | 'none';

export type TrashRegion = {
  id: string;
  town: TrashTown;
  label: string;
  where: string;
  dow: ServiceDow | null;
  hauler: string;
  phone: string | null;
  lookupUrl: string | null;
  recycling: RecyclingKind;
  yard: YardKind;
  cartsBy: string | null;
};

/** Kept so older imports keep working. */
export type TrashZone = TrashRegion;

export const TOWN_ORDER: TrashTown[] = [
  'Fort Collins',
  'Loveland',
  'Estes Park',
  'Berthoud',
  'Wellington',
  'Unincorporated',
];

export const TRASH_REGIONS: TrashRegion[] = (raw.regions as TrashRegion[]).map((z) => ({
  id: z.id,
  town: z.town,
  label: z.label,
  where: z.where,
  dow: z.dow,
  hauler: z.hauler,
  phone: z.phone,
  lookupUrl: z.lookupUrl,
  recycling: z.recycling,
  yard: z.yard,
  cartsBy: z.cartsBy,
}));

export const FOCO_TRASH_ZONES: TrashRegion[] = TRASH_REGIONS.filter((z) => z.town === 'Fort Collins');

/** Calendar order. No neighborhood is pinned to the top. */
export const ZONE_DOW_ORDER: ServiceDow[] = [1, 2, 3, 4, 5];

/** Older builds stored this generic Friday blob separately from Highlander Heights. */
const REGION_ALIASES: Record<string, string> = {
  'east-college-north': 'highlander-heights',
};

export function regionById(id: string | null | undefined): TrashRegion | null {
  if (!id) return null;
  const resolved = REGION_ALIASES[id] ?? id;
  return TRASH_REGIONS.find((z) => z.id === resolved) ?? null;
}

/** @deprecated Use regionById. */
export function zoneById(id: string | null | undefined): TrashRegion | null {
  return regionById(id);
}

export function regionsForTown(town: TrashTown): TrashRegion[] {
  return TRASH_REGIONS.filter((z) => z.town === town);
}

export function zonesForDow(dow: ServiceDow): TrashRegion[] {
  return FOCO_TRASH_ZONES.filter((z) => z.dow === dow);
}

export function zoneDayLabel(zone: TrashRegion): string {
  return zone.dow ? `${zone.label} · ${DOW_LABEL[zone.dow]}` : zone.label;
}

export function townFromArea(area: string): TrashTown | null {
  if (area === 'Fort Collins' || area === 'Loveland' || area === 'Estes Park' || area === 'Berthoud' || area === 'Wellington') {
    return area;
  }
  return null;
}

export function areaFromTown(town: TrashTown): 'All' | Exclude<TrashTown, 'Unincorporated'> {
  if (town === 'Unincorporated') return 'All';
  return town;
}

export const DAY_STORAGE_KEY: Record<TrashTown, string> = {
  'Fort Collins': 'foco-trash-day',
  Loveland: 'foco-loveland-trash-day',
  'Estes Park': 'foco-estes-trash-day',
  Berthoud: 'foco-berthoud-trash-day',
  Wellington: 'foco-wellington-trash-day',
  Unincorporated: 'foco-uninc-trash-day',
};
