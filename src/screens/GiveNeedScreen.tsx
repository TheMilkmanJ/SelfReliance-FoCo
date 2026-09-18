import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Header } from '../components/Header';
import { ResourceCard } from '../components/ResourceCard';
import { GIVE_NEED_CHIPS, giveNeedResources, type GiveNeedId } from '../data/giveNeed';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import type { Resource } from '../data/types';
import { useI18n, type MessageKey } from '../i18n';
import { useBackLayer } from '../lib/backStack';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

type Props = {
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  onBack: () => void;
  onSelect: (resource: Resource) => void;
};

export function GiveNeedScreen({ area, onAreaChange, onBack, onSelect }: Props) {
  const { handleClose } = useBackLayer(true, onBack);
  const { colors } = useTheme();
  const { t } = useI18n();
  const [kind, setKind] = useState<GiveNeedId>('need');
  const list = useMemo(() => giveNeedResources(kind, area), [kind, area]);
  const blurbKey = `give.${kind}Blurb` as MessageKey;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title={t('give.title')} subtitle={t('give.subtitle')} />
      <FlatList
        data={list}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ResourceCard resource={item} onPress={onSelect} />}
        ListHeaderComponent={
          <View style={styles.top}>
            <Pressable onPress={handleClose} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.backResources')}>
              <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
              <Text style={[styles.backText, { color: colors.purple }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
                {t('common.resources')}
              </Text>
            </Pressable>
            <Text style={[styles.lede, { color: colors.body }]} maxFontSizeMultiplier={MAX_FONT.title}>
              {t('give.lede')}
            </Text>
            <AreaFilter value={area} onChange={onAreaChange} />
            <View style={styles.chips}>
              {GIVE_NEED_CHIPS.map((c) => (
                <MiniChip key={c.id} label={t(`give.${c.id}` as MessageKey)} active={kind === c.id} onPress={() => setKind(c.id)} />
              ))}
            </View>
            <Text style={[styles.blurb, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
              {t(blurbKey)}
            </Text>
            <Text style={[styles.count, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
              {t(list.length === 1 ? 'give.deskOne' : 'give.deskMany', { n: list.length })}
              {area === 'All' ? '' : t('home.inArea', { area: areaLabel(area, t) })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>{t('give.empty', { area: areaLabel(area, t) })}</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>{t('give.emptyHint')}</Text>
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
      <Text
        style={[styles.chipText, { color: active ? '#fff' : colors.ink }]}
        maxFontSizeMultiplier={MAX_FONT.chrome}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  top: { paddingTop: spacing.md, gap: spacing.md, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontWeight: '700', fontSize: 15 },
  lede: { fontSize: 15, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipText: { fontWeight: '700', fontSize: 14 },
  blurb: { fontSize: 13, lineHeight: 18 },
  count: { fontSize: 13 },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 21 },
});
