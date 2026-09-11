import { Alert, Linking, Platform } from 'react-native';

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mapsUrl(address: string): string {
  const q = encodeURIComponent(address);
  if (Platform.OS === 'ios') return `maps:0,0?q=${q}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
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

export function directions(address: string): Promise<void> {
  return open(mapsUrl(address));
}

export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
