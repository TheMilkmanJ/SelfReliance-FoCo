import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Header } from '../components/Header';
import { OpenNowCard } from '../components/OpenNowCard';
import { OPEN_NEEDS } from '../data/openNowNeeds';
import { OPEN_PLACES } from '../data/openNowPlaces';
import type { OpenNeedId, OpenPlace } from '../data/openNowTypes';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import { useI18n, type MessageKey, dowKey, monthKey } from '../i18n';
import { useDenverNow } from '../lib/denverClock';
import { matchesOpenTown, statusFor } from '../lib/openNowStatus';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

type FilterChip = 'open' | 'later' | 'all';

type Props = {
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  onBack: () => void;
  onSelect: (place: OpenPlace) => void;
};

export function OpenNowScreen({ area, onAreaChange, onBack, onSelect }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const now = useDenverNow();
  const [need, setNeed] = useState<OpenNeedId | 'all'>('all');
  const [chip, setChip] = useState<FilterChip>('open');

  const ranked = useMemo(() => {
    return OPEN_PLACES.filter((p) => (need === 'all' ? true : p.needs.includes(need)) && matchesOpenTown(p, area))
      .map((place) => ({ place, status: statusFor(place, now, t) }))
      .sort((a, b) => a.status.sort - b.status.sort || a.place.name.localeCompare(b.place.name));
  }, [need, area, now, t]);

  const visible = ranked.filter((row) => {
    if (chip === 'all') return true;
    if (chip === 'open') return row.status.kind === 'open';
    return row.status.kind === 'later';
  });
  const openCount = ranked.filter((r) => r.status.kind === 'open').length;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header
        title={t('open.title')}
        subtitle={t('open.subtitle', {
          weekday: t(dowKey(now.dow)),
          date: `${t(monthKey(now.month))} ${now.date}`,
        })}
      />
      <FlatList
        data={visible}
        keyExtractor={(row) => row.place.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <OpenNowCard place={item.place} status={item.status} onPress={() => onSelect(item.place)} />
        )}
        ListHeaderComponent={
          <View style={styles.top}>
            <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.backResources')}>
              <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
              <Text style={[styles.backText, { color: colors.purple }]}>{t('common.resources')}</Text>
            </Pressable>
            <Text style={[styles.lede, { color: colors.body }]}>{t('open.lede')}</Text>
            <AreaFilter value={area} onChange={onAreaChange} />
            <View style={styles.chips}>
              <MiniChip label={t('open.allNeeds')} active={need === 'all'} onPress={() => setNeed('all')} />
              {OPEN_NEEDS.map((n) => (
                <MiniChip key={n.id} label={t(`open.${n.id}` as MessageKey)} active={need === n.id} onPress={() => setNeed(n.id)} />
              ))}
            </View>
            <View style={styles.chips}>
              <MiniChip label={t('open.countNow', { n: openCount })} active={chip === 'open'} onPress={() => setChip('open')} />
              <MiniChip label={t('open.later')} active={chip === 'later'} onPress={() => setChip('later')} />
              <MiniChip label={t('open.allHours')} active={chip === 'all'} onPress={() => setChip('all')} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={40} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>
              {chip === 'open' ? t('open.emptyNow', { area: areaLabel(area, t) }) : t('open.emptyListed', { area: areaLabel(area, t) })}
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>{t('open.emptyHint')}</Text>
          </View>
        }
      />
    </View>
  );
}

function MiniChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        { backgroundColor: active ? HEADER_PURPLE : colors.card, borderColor: active ? HEADER_PURPLE : colors.line },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? '#fff' : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  top: { paddingTop: spacing.md, gap: spacing.md, marginHorizontal: -spacing.lg },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
  },
  backText: { fontWeight: '700', fontSize: 16 },
  lede: { paddingHorizontal: spacing.lg, fontSize: 15, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
