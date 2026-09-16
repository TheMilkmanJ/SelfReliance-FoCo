import { Alert, Linking, Platform } from 'react-native';

export type TravelMode = 'transit' | 'walking' | 'driving';

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** True when the listing has a street number, not just a city name. */
export function hasStreetAddress(address: string): boolean {
  return /\d/.test(address);
}

export function mapsSearchUrl(address: string): string {
  const q = encodeURIComponent(address);
  if (Platform.OS === 'ios') return `maps:0,0?q=${q}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Opens Google Maps (or Apple Maps on iOS) with this address as the destination. */
export function mapsDirectionsUrl(address: string, mode?: TravelMode): string {
  const q = encodeURIComponent(address);
  if (Platform.OS === 'ios') {
    const flag = mode === 'transit' ? 'r' : mode === 'walking' ? 'w' : mode === 'driving' ? 'd' : '';
    return flag ? `maps:?daddr=${q}&dirflg=${flag}` : `maps:?daddr=${q}`;
  }
  const modeQ = mode ? `&travelmode=${mode}` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${q}${modeQ}`;
}

/** @deprecated Use mapsSearchUrl. Kept so older imports keep working. */
export function mapsUrl(address: string): string {
  return mapsSearchUrl(address);
}

export async function open(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open', 'Your phone could not open that link. Try copying it into your browser.');
  }
}

export function call(phone: string): Promise<void> {
  return open(telUrl(phone));
}

export function directions(address: string, mode?: TravelMode): Promise<void> {
  return open(mapsDirectionsUrl(address, mode));
}

export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
