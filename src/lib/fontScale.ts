import { useWindowDimensions } from 'react-native';

/** Android/iOS "Font size" / large print. 1 is default. */
export function useFontScale(): number {
  const { fontScale } = useWindowDimensions();
  return fontScale || 1;
}

/** Big enough that fixed-height rows and horizontal chip strips start to clip. */
export function useLargePrint(): boolean {
  return useFontScale() >= 1.25;
}

/** Caps for chrome (tabs, chips, search, header). Listing body text is left uncapped. */
export const MAX_FONT = {
  chrome: 1.4,
  title: 1.5,
} as const;
