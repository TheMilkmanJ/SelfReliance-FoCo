import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { regionById } from '../data/trashZones';
import { dowKey, useI18n } from '../i18n';
import { MAX_FONT } from '../lib/fontScale';
import { loadRegionDay } from '../lib/trashPrefs';
import type { ServiceDow } from '../lib/trashCalendar';
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

type Props = {
  trashRegionId: string | null;
  onTrash: () => void;
  onOpenNow: () => void;
  onGiveNeed: () => void;
  onOfflineMaps: () => void;
};

export function HomeTools({ trashRegionId, onTrash, onOpenNow, onGiveNeed, onOfflineMaps }: Props) {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const saved = regionById(trashRegionId);
  const [rememberedDay, setRememberedDay] = useState<ServiceDow | null>(null);

  useEffect(() => {
    if (!saved || saved.dow) {
      setRememberedDay(null);
      return;
    }
    let cancelled = false;
    void loadRegionDay(saved.id).then((day) => {
      if (!cancelled) setRememberedDay(day);
    });
    return () => {
      cancelled = true;
    };
  }, [saved?.id, saved?.dow]);

  const day = saved?.dow ?? rememberedDay ?? null;
  const trashSub = saved
    ? day
      ? t('tool.trashSubSaved', { place: saved.label, day: t(dowKey(day)) })
      : t('tool.trashSubPlace', { place: saved.label })
    : t('tool.trashSub');
  const trashA11y = saved
    ? day
      ? t('tool.trashA11ySaved', { place: saved.label, day: t(dowKey(day)) })
      : t('tool.trashA11yPlace', { place: saved.label })
    : t('tool.trashA11y');
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onTrash}
        style={({ pressed }) => [styles.btn, { backgroundColor: colors.card }, cardShadow(isDark), pressed && { opacity: 0.88 }]}
        accessibilityRole="button"
        accessibilityLabel={trashA11y}
      >
        <View style={[styles.icon, { backgroundColor: isDark ? '#3d342c' : '#efe6d6' }]}>
          <Ionicons name="trash-outline" size={26} color={isDark ? '#e0c3a8' : '#6d4c41'} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          {t('tool.trash')}
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {trashSub}
        </Text>
      </Pressable>
      <Pressable
        onPress={onOpenNow}
        style={({ pressed }) => [styles.btn, { backgroundColor: colors.card }, cardShadow(isDark), pressed && { opacity: 0.88 }]}
        accessibilityRole="button"
        accessibilityLabel={t('tool.openA11y')}
      >
        <View style={[styles.icon, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
          <Ionicons name="time-outline" size={26} color={HEADER_PURPLE} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          {t('tool.open')}
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {t('tool.openSub')}
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
        accessibilityLabel={t('tool.giveA11y')}
      >
        <View style={[styles.icon, { backgroundColor: isDark ? '#3d2c34' : '#fce4ec' }]}>
          <Ionicons name="people-outline" size={26} color={isDark ? '#f48fb1' : '#ad1457'} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          {t('tool.give')}
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {t('tool.giveSub')}
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
        accessibilityLabel={t('tool.mapsA11y')}
      >
        <View style={[styles.icon, { backgroundColor: isDark ? '#1e3a5f' : '#e3f2fd' }]}>
          <Ionicons name="map-outline" size={26} color={isDark ? '#90caf9' : '#1565c0'} />
        </View>
        <Text style={[styles.label, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          {t('tool.maps')}
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {t('tool.mapsSub')}
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
