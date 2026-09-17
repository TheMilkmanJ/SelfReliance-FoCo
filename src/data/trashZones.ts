import type { ServiceDow } from '../lib/trashCalendar';
import { DOW_LABEL } from '../lib/trashCalendar';
import raw from './trashZones.json';

export type TrashZone = {
  id: string;
  label: string;
  where: string;
  dow: ServiceDow;
};

export const FOCO_TRASH_ZONES: TrashZone[] = (raw.zones as TrashZone[]).map((z) => ({
  id: z.id,
  label: z.label,
  where: z.where,
  dow: z.dow,
}));

/** Friday first so Highlander Heights sits at the top of the list. */
export const ZONE_DOW_ORDER: ServiceDow[] = [5, 4, 3, 2, 1];

export function zoneById(id: string | null | undefined): TrashZone | null {
  if (!id) return null;
  return FOCO_TRASH_ZONES.find((z) => z.id === id) ?? null;
}

export function zonesForDow(dow: ServiceDow): TrashZone[] {
  return FOCO_TRASH_ZONES.filter((z) => z.dow === dow);
}

export function zoneDayLabel(zone: TrashZone): string {
  return `${zone.label} · ${DOW_LABEL[zone.dow]}`;
}
