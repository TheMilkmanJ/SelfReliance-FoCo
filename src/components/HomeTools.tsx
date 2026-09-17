import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

type Props = {
  onTrash: () => void;
  onOpenNow: () => void;
  onGiveNeed: () => void;
  onOfflineMaps: () => void;
};

export function HomeTools({ onTrash, onOpenNow, onGiveNeed, onOfflineMaps }: Props) {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onTrash}
        style={({ pressed }) => [styles.btn, { backgroundColor: colors.card }, cardShadow(isDark), pressed && { opacity: 0.88 }]}
        accessibilityRole="button"
        accessibilityLabel="Trash day, when to put carts out"
      >
        <View style={[styles.icon, { backgroundColor: isDark ? '#3d342c' : '#efe6d6' }]}>
          <Ionicons name="trash-outline" size={26} color={isDark ? '#e0c3a8' : '#6d4c41'} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          Trash day
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          Carts out by 7am
        </Text>
      </Pressable>
      <Pressable
        onPress={onOpenNow}
        style={({ pressed }) => [styles.btn, { backgroundColor: colors.card }, cardShadow(isDark), pressed && { opacity: 0.88 }]}
        accessibilityRole="button"
        accessibilityLabel="Open now, meals showers and beds open today"
      >
        <View style={[styles.icon, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
          <Ionicons name="time-outline" size={26} color={HEADER_PURPLE} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          Open now
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          Meals, showers, beds
        </Text>
      </Pressable>
      <Pressable
        onPress={onGiveNeed}
        style={({ pressed }) => [
          styles.btn,
          styles.wide,
          { backgroundColor: colors.card },
          cardShadow(isDark),
          pressed && { opacity: 0.88 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Give, need, or volunteer. Furniture, clothes, food, and hands."
      >
        <View style={[styles.icon, { backgroundColor: isDark ? '#3d2c34' : '#fce4ec' }]}>
          <Ionicons name="people-outline" size={26} color={isDark ? '#f48fb1' : '#ad1457'} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          Give, need, volunteer
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          Call Suzanne for furniture, or pick a desk that takes donations, gives things away, or needs hands.
        </Text>
      </Pressable>
      <Pressable
        onPress={onOfflineMaps}
        style={({ pressed }) => [
          styles.btn,
          styles.wide,
          { backgroundColor: colors.card },
          cardShadow(isDark),
          pressed && { opacity: 0.88 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Offline maps, download your town in Google Maps"
      >
        <View style={[styles.icon, { backgroundColor: isDark ? '#1e3a5f' : '#e3f2fd' }]}>
          <Ionicons name="map-outline" size={26} color={isDark ? '#90caf9' : '#1565c0'} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          Offline maps
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          Download your town in Google Maps. This app does not store Google’s map.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingHorizontal: spacing.lg },
  btn: {
    flex: 1,
    minWidth: 148,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 120,
  },
  wide: { flexBasis: '100%', minWidth: '100%' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
});
