import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Chip } from '../components/Chip';
import { ChipRow } from '../components/ChipRow';
import { Header } from '../components/Header';
import { HomeTools } from '../components/HomeTools';
import { QuickHelp } from '../components/QuickHelp';
import { ResourceCard } from '../components/ResourceCard';
import { SearchBar } from '../components/SearchBar';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import {
  PREGNANCY_CHIPS,
  RESOURCES,
  VOTING_CHIPS,
  countByCategory,
  filterByArea,
  isChildcareResource,
  isPregnancyResource,
  isVotingResource,
  matchesPregnancyChip,
  matchesVotingChip,
  searchResources,
  sortChildcareResources,
  sortFamilyResources,
  sortPregnancyResources,
  sortVotingResources,
  type AreaFilter as AreaFilterId,
  type PregnancyChipId,
  type VotingChipId,
} from '../data/resources';
import type { Category, CategoryId, Resource } from '../data/types';
import { useLargePrint } from '../lib/fontScale';
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

type Props = {
  onSelect: (r: Resource) => void;
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  onTrashDay: () => void;
  onOpenNow: () => void;
  onGiveNeed: () => void;
  onOfflineMaps: () => void;
};

export function HomeScreen({
  onSelect,
  area,
  onAreaChange,
  onTrashDay,
  onOpenNow,
  onGiveNeed,
  onOfflineMaps,
}: Props) {
  const { colors } = useTheme();
  const largePrint = useLargePrint();
  const [query, setQuery] = useState('');
  const [openCat, setOpenCat] = useState<CategoryId | null>(null);
  const [pregnancyFilter, setPregnancyFilter] = useState<PregnancyChipId>('all');
  const [votingFilter, setVotingFilter] = useState<VotingChipId>('all');

  const searching = query.trim().length > 0;
  const inArea = useMemo(() => filterByArea(RESOURCES, area), [area]);
  const counts = useMemo(() => {
    const next = countByCategory(inArea);
    next.pregnancy = inArea.filter(isPregnancyResource).length;
    next.voting = inArea.filter(isVotingResource).length;
    next.childcare = inArea.filter(isChildcareResource).length;
    return next;
  }, [inArea]);
  const results = useMemo(() => (searching ? searchResources(query, inArea) : []), [query, searching, inArea]);
  const catResources = useMemo(() => {
    if (!openCat) return [];
    if (openCat === 'pregnancy') {
      let list = inArea.filter(isPregnancyResource);
      if (pregnancyFilter !== 'all') {
        list = list.filter((r) => matchesPregnancyChip(r, pregnancyFilter));
      }
      return sortPregnancyResources(list);
    }
    if (openCat === 'voting') {
      let list = inArea.filter(isVotingResource);
      if (votingFilter !== 'all') {
        list = list.filter((r) => matchesVotingChip(r, votingFilter));
      }
      return sortVotingResources(list);
    }
    if (openCat === 'family_children') {
      return sortFamilyResources(inArea.filter((r) => r.category === 'family_children'));
    }
    if (openCat === 'childcare') {
      return sortChildcareResources(inArea.filter(isChildcareResource));
    }
    return inArea.filter((r) => r.category === openCat);
  }, [openCat, inArea, pregnancyFilter, votingFilter]);

  if (openCat) {
    const cat = CATEGORY_MAP[openCat];
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <Header title={cat.label} subtitle={cat.blurb} />
        <FlatList
          data={catResources}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <ResourceCard resource={item} onPress={onSelect} showCategory={false} />}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <Pressable
                onPress={() => {
                  setPregnancyFilter('all');
                  setVotingFilter('all');
                  setOpenCat(null);
                }}
                style={styles.back}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
                <Text style={[styles.backText, { color: colors.purple }]}>All categories</Text>
              </Pressable>
              {openCat === 'pregnancy' ? (
                <ChipRow>
                  {PREGNANCY_CHIPS.map((chip) => (
                    <Chip
                      key={chip.id}
                      label={chip.label}
                      icon={chip.id === 'all' ? undefined : chip.icon}
                      active={pregnancyFilter === chip.id}
                      onPress={() => setPregnancyFilter(chip.id)}
                    />
                  ))}
                </ChipRow>
              ) : null}
              {openCat === 'voting' ? (
                <ChipRow>
                  {VOTING_CHIPS.map((chip) => (
                    <Chip
                      key={chip.id}
                      label={chip.label}
                      icon={chip.id === 'all' ? undefined : chip.icon}
                      active={votingFilter === chip.id}
                      onPress={() => setVotingFilter(chip.id)}
                    />
                  ))}
                </ChipRow>
              ) : null}
              <AreaFilter value={area} onChange={onAreaChange} />
              <Text style={[styles.count, { color: colors.muted, paddingTop: spacing.md }]}>
                {catResources.length} {catResources.length === 1 ? 'resource' : 'resources'}
                {area === 'All' ? '' : ` in ${areaLabel(area)}`}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="map-outline" size={40} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.ink }]}>Nothing for {areaLabel(area)}</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {openCat === 'pregnancy'
                  ? 'Try All on the birth-option chips, pick All of Larimer, or call 2-1-1.'
                  : openCat === 'voting'
                    ? 'Try All on the voter chips, pick All of Larimer, or call Elections at 970-498-7820.'
                    : 'Try All of Larimer, or call 2-1-1 for a referral closer to you.'}
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header
        title="Self-Reliance FoCo"
        subtitle={largePrint ? 'Larimer County help' : 'Larimer County help, all in one place'}
      />
      <FlatList
        data={searching ? results : []}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <ResourceCard resource={item} onPress={onSelect} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.top}>
            <SearchBar value={query} onChange={setQuery} />
            <AreaFilter value={area} onChange={onAreaChange} />
            {searching ? (
              <Text style={[styles.count, { color: colors.muted }]}>
                {results.length} {results.length === 1 ? 'match' : 'matches'}
                {area === 'All' ? '' : ` in ${areaLabel(area)}`}
              </Text>
            ) : (
              <>
                <QuickHelp />
                <HomeTools
                  onTrash={onTrashDay}
                  onOpenNow={onOpenNow}
                  onGiveNeed={onGiveNeed}
                  onOfflineMaps={onOfflineMaps}
                />
                <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                  {area === 'All' ? 'What do you need?' : `What do you need in ${areaLabel(area)}?`}
                </Text>
                <View style={styles.grid}>
                  {CATEGORIES.map((c) => (
                    <CategoryTile
                      key={c.id}
                      category={c}
                      count={counts[c.id] ?? 0}
                      onPress={() => {
                        setPregnancyFilter('all');
                        setVotingFilter('all');
                        setOpenCat(c.id);
                      }}
                    />
                  ))}
                </View>
                <Text style={[styles.about, { color: colors.muted }]}>
                  Pick a town to see local spots plus county-wide programs. Free, no sign-in, nothing leaves your phone.
                  Tap a number to call; tap a card for details and directions.
                </Text>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          searching ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.ink }]}>Nothing matched "{query.trim()}"</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Try a simpler word like rent, food, child care, or dental. Or call 2-1-1.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function CategoryTile({ category, count, onPress }: { category: Category; count: number; onPress: () => void }) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: colors.card }, cardShadow(isDark), pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${count} resources`}
    >
      <View style={[styles.tileIcon, { backgroundColor: `${category.color}1a` }]}>
        <Ionicons name={category.icon as never} size={26} color={category.color} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.ink }]}>{category.label}</Text>
      <Text style={[styles.tileCount, { color: colors.muted }]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingBottom: spacing.xxl },
  top: { paddingTop: spacing.lg, gap: spacing.lg },
  count: { paddingHorizontal: spacing.lg, fontSize: 13 },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: -spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  tile: {
    width: '47.5%',
    maxWidth: '100%',
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 132,
  },
  tileIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tileLabel: { fontSize: 15, fontWeight: '700' },
  tileCount: { fontSize: 13, marginTop: 4 },
  about: {
    paddingHorizontal: spacing.lg,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backText: { fontWeight: '700', fontSize: 15 },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { textAlign: 'center', fontSize: 15 },
});
