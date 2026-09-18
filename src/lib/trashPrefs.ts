import AsyncStorage from '@react-native-async-storage/async-storage';

import { TRASH_REGIONS, regionById } from '../data/trashZones';
import type { ServiceDow } from './trashCalendar';

export const TRASH_REGION_KEY = 'foco-trash-region';
export const TRASH_ZONE_KEY = 'foco-trash-zone';
/** Per-neighborhood weekday for towns without a published map (Loveland, Estes, Berthoud, Wellington). */
export const REGION_DAY_PREFIX = 'foco-trash-region-day:';

export function regionDayStorageKey(id: string): string {
  return `${REGION_DAY_PREFIX}${id}`;
}

function parseDow(value: string | null): ServiceDow | null {
  const n = Number(value);
  if (n >= 1 && n <= 5) return n as ServiceDow;
  return null;
}

export async function loadRegionDay(id: string): Promise<ServiceDow | null> {
  return parseDow(await AsyncStorage.getItem(regionDayStorageKey(id)));
}

export async function saveRegionDay(id: string, day: ServiceDow): Promise<void> {
  await AsyncStorage.setItem(regionDayStorageKey(id), String(day));
}

/** Remembered weekdays keyed by neighborhood id. JSON map days are not stored here. */
export async function loadRegionDays(): Promise<Record<string, ServiceDow>> {
  const ids = TRASH_REGIONS.map((r) => r.id);
  const values = await Promise.all(ids.map((id) => AsyncStorage.getItem(regionDayStorageKey(id))));
  const out: Record<string, ServiceDow> = {};
  ids.forEach((id, i) => {
    const day = parseDow(values[i]);
    if (day) out[id] = day;
  });
  return out;
}

/** Last neighborhood the user picked. Never invents a default. */
export async function loadSavedTrashRegionId(): Promise<string | null> {
  const [regionSaved, zoneSaved] = await Promise.all([
    AsyncStorage.getItem(TRASH_REGION_KEY),
    AsyncStorage.getItem(TRASH_ZONE_KEY),
  ]);
  const stored = regionById(regionSaved) ?? regionById(zoneSaved);
  if (!stored) return null;
  if (regionSaved !== stored.id || zoneSaved !== stored.id) {
    await AsyncStorage.setItem(TRASH_REGION_KEY, stored.id);
    await AsyncStorage.setItem(TRASH_ZONE_KEY, stored.id);
  }
  return stored.id;
}

export async function saveTrashRegionId(id: string): Promise<void> {
  await AsyncStorage.setItem(TRASH_REGION_KEY, id);
  await AsyncStorage.setItem(TRASH_ZONE_KEY, id);
}

export async function clearSavedTrashRegion(): Promise<void> {
  await AsyncStorage.removeItem(TRASH_REGION_KEY);
  await AsyncStorage.removeItem(TRASH_ZONE_KEY);
}
