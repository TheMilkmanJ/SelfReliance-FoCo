import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Chip } from '../components/Chip';
import { ChipRow } from '../components/ChipRow';
import { Header } from '../components/Header';
import { HomeTools } from '../components/HomeTools';
import { LanguagePicker } from '../components/LanguagePicker';
import { QuickHelp } from '../components/QuickHelp';
import { ResourceCard } from '../components/ResourceCard';
import { SearchBar } from '../components/SearchBar';
import { CATEGORIES } from '../data/categories';
import {
  DIVORCE_CHIPS,
  LANGUAGE_CHIPS,
  MARRIAGE_CHIPS,
  PREGNANCY_CHIPS,
  RELIGION_CHIPS,
  RESOURCES,
  VOTING_CHIPS,
  countByCategory,
  filterByArea,
  isChildcareResource,
  isDivorceResource,
  isLanguageResource,
  isMarriageResource,
  isPregnancyResource,
  isReligionResource,
  isVotingResource,
  matchesDivorceChip,
  matchesLanguageChip,
  matchesMarriageChip,
  matchesPregnancyChip,
  matchesReligionChip,
  matchesVotingChip,
  searchResources,
  sortChildcareResources,
  sortDivorceResources,
  sortFamilyResources,
  sortLanguageResources,
  sortMarriageResources,
  sortPregnancyResources,
  sortReligionResources,
  sortVotingResources,
  type AreaFilter as AreaFilterId,
  type DivorceChipId,
  type LanguageChipId,
  type MarriageChipId,
  type PregnancyChipId,
  type ReligionChipId,
  type VotingChipId,
} from '../data/resources';
import type { Category, CategoryId, Resource } from '../data/types';
import { catKey, useI18n, type MessageKey } from '../i18n';
import { useLargePrint } from '../lib/fontScale';
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

type Props = {
  onSelect: (r: Resource) => void;
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  trashRegionId: string | null;
  onTrashDay: () => void;
  onOpenNow: () => void;
  onGiveNeed: () => void;
  onOfflineMaps: () => void;
};

export function HomeScreen({
  onSelect,
  area,
  onAreaChange,
  trashRegionId,
  onTrashDay,
  onOpenNow,
  onGiveNeed,
  onOfflineMaps,
}: Props) {
  const { colors } = useTheme();
  const largePrint = useLargePrint();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [openCat, setOpenCat] = useState<CategoryId | null>(null);
  const [pregnancyFilter, setPregnancyFilter] = useState<PregnancyChipId>('all');
  const [votingFilter, setVotingFilter] = useState<VotingChipId>('all');
  const [languageFilter, setLanguageFilter] = useState<LanguageChipId>('all');
  const [marriageFilter, setMarriageFilter] = useState<MarriageChipId>('all');
  const [divorceFilter, setDivorceFilter] = useState<DivorceChipId>('all');
  const [religionFilter, setReligionFilter] = useState<ReligionChipId>('all');

  const searching = query.trim().length > 0;
  const inArea = useMemo(() => filterByArea(RESOURCES, area), [area]);
  const counts = useMemo(() => {
    const next = countByCategory(inArea);
    next.pregnancy = inArea.filter(isPregnancyResource).length;
    next.voting = inArea.filter(isVotingResource).length;
    next.language = inArea.filter(isLanguageResource).length;
    next.marriage = inArea.filter(isMarriageResource).length;
    next.divorce = inArea.filter(isDivorceResource).length;
    next.religion = inArea.filter(isReligionResource).length;
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
    if (openCat === 'language') {
      let list = inArea.filter(isLanguageResource);
      if (languageFilter !== 'all') {
        list = list.filter((r) => matchesLanguageChip(r, languageFilter));
      }
      return sortLanguageResources(list);
    }
    if (openCat === 'marriage') {
      let list = inArea.filter(isMarriageResource);
      if (marriageFilter !== 'all') {
        list = list.filter((r) => matchesMarriageChip(r, marriageFilter));
      }
      return sortMarriageResources(list);
    }
    if (openCat === 'divorce') {
      let list = inArea.filter(isDivorceResource);
      if (divorceFilter !== 'all') {
        list = list.filter((r) => matchesDivorceChip(r, divorceFilter));
      }
      return sortDivorceResources(list);
    }
    if (openCat === 'religion') {
      let list = inArea.filter(isReligionResource);
      if (religionFilter !== 'all') {
        list = list.filter((r) => matchesReligionChip(r, religionFilter));
      }
      return sortReligionResources(list);
    }
    if (openCat === 'family_children') {
      return sortFamilyResources(inArea.filter((r) => r.category === 'family_children'));
    }
    if (openCat === 'childcare') {
      return sortChildcareResources(inArea.filter(isChildcareResource));
    }
    return inArea.filter((r) => r.category === openCat);
  }, [openCat, inArea, pregnancyFilter, votingFilter, languageFilter, marriageFilter, divorceFilter, religionFilter]);

  const inAreaNote = area === 'All' ? '' : t('home.inArea', { area: areaLabel(area, t) });

  if (openCat) {
    const emptyHint =
      openCat === 'pregnancy'
        ? t('home.emptyPregnancy')
        : openCat === 'voting'
          ? t('home.emptyVoting')
          : openCat === 'language'
            ? t('home.emptyLanguage')
            : openCat === 'marriage'
              ? t('home.emptyMarriage')
              : openCat === 'divorce'
                ? t('home.emptyDivorce')
                : openCat === 'religion'
                  ? t('home.emptyReligion')
                  : t('home.emptyText');
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <Header title={t(catKey(openCat, 'label'))} subtitle={t(catKey(openCat, 'blurb'))} />
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
                  setLanguageFilter('all');
                  setMarriageFilter('all');
                  setDivorceFilter('all');
                  setReligionFilter('all');
                  setOpenCat(null);
                }}
                style={styles.back}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
                <Text style={[styles.backText, { color: colors.purple }]}>{t('home.back')}</Text>
              </Pressable>
              {openCat === 'language' ? <LanguagePicker /> : null}
              {openCat === 'pregnancy' ? (
                <ChipRow>
                  {PREGNANCY_CHIPS.map((chip) => (
                    <Chip
                      key={chip.id}
                      label={chip.id === 'all' ? t('chip.all') : t(`chip.pregnancy.${chip.id}` as MessageKey)}
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
                      label={chip.id === 'all' ? t('chip.all') : t(`chip.voting.${chip.id}` as MessageKey)}
                      icon={chip.id === 'all' ? undefined : chip.icon}
                      active={votingFilter === chip.id}
                      onPress={() => setVotingFilter(chip.id)}
                    />
                  ))}
                </ChipRow>
              ) : null}
              {openCat === 'language' ? (
                <ChipRow>
                  {LANGUAGE_CHIPS.map((chip) => (
                    <Chip
                      key={chip.id}
                      label={chip.id === 'all' ? t('chip.all') : t(`chip.lang.${chip.id}` as MessageKey)}
                      icon={chip.id === 'all' ? undefined : chip.icon}
                      active={languageFilter === chip.id}
                      onPress={() => setLanguageFilter(chip.id)}
                    />
                  ))}
                </ChipRow>
              ) : null}
              {openCat === 'marriage' ? (
                <ChipRow>
                  {MARRIAGE_CHIPS.map((chip) => (
                    <Chip
                      key={chip.id}
                      label={chip.id === 'all' ? t('chip.all') : t(`chip.marriage.${chip.id}` as MessageKey)}
                      icon={chip.id === 'all' ? undefined : chip.icon}
                      active={marriageFilter === chip.id}
                      onPress={() => setMarriageFilter(chip.id)}
                    />
                  ))}
                </ChipRow>
              ) : null}
              {openCat === 'divorce' ? (
                <ChipRow>
                  {DIVORCE_CHIPS.map((chip) => (
                    <Chip
                      key={chip.id}
                      label={chip.id === 'all' ? t('chip.all') : t(`chip.divorce.${chip.id}` as MessageKey)}
                      icon={chip.id === 'all' ? undefined : chip.icon}
                      active={divorceFilter === chip.id}
                      onPress={() => setDivorceFilter(chip.id)}
                    />
                  ))}
                </ChipRow>
              ) : null}
              {openCat === 'religion' ? (
                <ChipRow>
                  {RELIGION_CHIPS.map((chip) => (
                    <Chip
                      key={chip.id}
                      label={chip.id === 'all' ? t('chip.all') : t(`chip.religion.${chip.id}` as MessageKey)}
                      icon={chip.id === 'all' ? undefined : chip.icon}
                      active={religionFilter === chip.id}
                      onPress={() => setReligionFilter(chip.id)}
                    />
                  ))}
                </ChipRow>
              ) : null}
              <AreaFilter value={area} onChange={onAreaChange} />
              <Text style={[styles.count, { color: colors.muted, paddingTop: spacing.md }]}>
                {t(catResources.length === 1 ? 'home.countOne' : 'home.countMany', { n: catResources.length })}
                {inAreaNote}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="map-outline" size={40} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.ink }]}>{t('home.emptyTitle', { area: areaLabel(area, t) })}</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>{emptyHint}</Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title={t('app.title')} subtitle={t(largePrint ? 'app.subtitleShort' : 'app.subtitle')} />
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
                {t(results.length === 1 ? 'home.matchOne' : 'home.matchMany', { n: results.length })}
                {inAreaNote}
              </Text>
            ) : (
              <>
                <QuickHelp />
                <HomeTools
                  trashRegionId={trashRegionId}
                  onTrash={onTrashDay}
                  onOpenNow={onOpenNow}
                  onGiveNeed={onGiveNeed}
                  onOfflineMaps={onOfflineMaps}
                />
                <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                  {area === 'All' ? t('home.need') : t('home.needIn', { area: areaLabel(area, t) })}
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
                        setLanguageFilter('all');
                        setMarriageFilter('all');
                        setDivorceFilter('all');
                        setReligionFilter('all');
                        setOpenCat(c.id);
                      }}
                    />
                  ))}
                </View>
                <Text style={[styles.about, { color: colors.muted }]}>{t('home.about')}</Text>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          searching ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.ink }]}>{t('home.searchEmptyTitle', { query: query.trim() })}</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>{t('home.searchEmptyText')}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function CategoryTile({ category, count, onPress }: { category: Category; count: number; onPress: () => void }) {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const label = t(catKey(category.id, 'label'));
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: colors.card }, cardShadow(isDark), pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={t('home.tileA11y', { label, n: count })}
    >
      <View style={[styles.tileIcon, { backgroundColor: `${category.color}1a` }]}>
        <Ionicons name={category.icon as never} size={26} color={category.color} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.ink }]}>{label}</Text>
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
