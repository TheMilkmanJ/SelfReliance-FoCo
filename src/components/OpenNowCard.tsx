import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { OpenPlace } from '../data/openNowTypes';
import { call } from '../lib/actions';
import { MAX_FONT, useLargePrint } from '../lib/fontScale';
import type { PlaceStatus } from '../lib/openNowStatus';
import { cardShadow, radius, spacing, useTheme } from '../theme';

type Props = {
  place: OpenPlace;
  status: PlaceStatus;
  onPress: () => void;
};

export function OpenNowCard({ place, status, onPress }: Props) {
  const { colors, isDark } = useTheme();
  const largePrint = useLargePrint();
  const statusColor =
    status.kind === 'open' ? colors.green : status.kind === 'later' ? '#b45309' : colors.muted;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card },
        cardShadow(isDark),
        pressed && { opacity: 0.9 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}. ${status.label}. ${place.who}. ${place.description}`}
    >
      <View style={[styles.badge, { backgroundColor: `${statusColor}22` }]}>
        <Text style={[styles.badgeText, { color: statusColor }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {status.label}
        </Text>
      </View>
      <Text style={[styles.name, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
        {place.name}
      </Text>
      <Text style={[styles.meta, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
        {place.who}
        {place.area === 'Larimer County' || place.area === 'Colorado' || place.area === 'National'
          ? ''
          : ` · ${place.area}`}
      </Text>
      <Text
        style={[styles.hours, { color: colors.body }]}
        numberOfLines={largePrint ? 4 : 2}
        maxFontSizeMultiplier={MAX_FONT.chrome}
      >
        {place.hoursNote}
      </Text>
      {place.phone ? (
        <Pressable
          onPress={() => call(place.phone as string)}
          style={[styles.call, { backgroundColor: colors.green }]}
          accessibilityRole="button"
          accessibilityLabel={`Call ${place.name} at ${place.phone}`}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callText} maxFontSizeMultiplier={MAX_FONT.chrome}>
            {place.phone}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', lineHeight: 26 },
  meta: { fontSize: 14 },
  hours: { fontSize: 15, lineHeight: 21 },
  call: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  callText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
