import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Chip } from '../components/Chip';
import { ChipRow } from '../components/ChipRow';
import { Header } from '../components/Header';
import { ResourceCard } from '../components/ResourceCard';
import { SearchBar } from '../components/SearchBar';
import { CERT_GROUP_IDS, CERT_GROUPS } from '../data/certGroups';
import { CATEGORY_MAP } from '../data/categories';
import {
  DISABILITY_CHIPS,
  HOMELESS_CHIPS,
  RESOURCES,
  STUDENT_CHIPS,
  byCategories,
  filterByArea,
  isFreeCertificate,
  matchesDisabilityChip,
  matchesHomelessChip,
  matchesStudentChip,
  searchResources,
  sortDisabilityResources,
  sortHomelessResources,
  sortStudentResources,
  type AreaFilter as AreaFilterId,
  type DisabilityChipId,
  type HomelessChipId,
  type StudentChipId,
} from '../data/resources';
import type { CategoryId, CertGroup, Resource } from '../data/types';
import { catKey, certKey, useI18n, type MessageKey } from '../i18n';
import { spacing, useTheme } from '../theme';

type JobFilter = 'all' | 'employment' | 'certs' | 'free' | 'classes' | CertGroup;

type Props = {
  title: string;
  subtitle: string;
  categories?: CategoryId[];
  onSelect: (r: Resource) => void;
  emptyHint: string;
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  /** Also include listings from other categories that match. */
  alsoInclude?: (resource: Resource) => boolean;
  /** Jobs tab: split certificates by type (work-ready, coding, government, …). */
  showCertGroups?: boolean;
  /** Have a disability? tab: Med-9, glasses, rec, rides, jobs, kids. */
  showDisabilityFilters?: boolean;
  /** Students tab: college, K–12, money, food, jobs, health. */
  showStudentFilters?: boolean;
  /** Homeless tab: overnight, day help, food, housing, families, youth. */
  showHomelessFilters?: boolean;
};

export function ResourceListScreen({
  title,
  subtitle,
  categories = [],
  onSelect,
  emptyHint,
  area,
  onAreaChange,
  alsoInclude,
  showCertGroups = false,
  showDisabilityFilters = false,
  showStudentFilters = false,
  showHomelessFilters = false,
}: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<CategoryId | 'all'>('all');
  const [jobFilter, setJobFilter] = useState<JobFilter>('all');
  const [disabilityFilter, setDisabilityFilter] = useState<DisabilityChipId>('all');
  const [studentFilter, setStudentFilter] = useState<StudentChipId>('all');
  const [homelessFilter, setHomelessFilter] = useState<HomelessChipId>('all');

  const pool = useMemo(() => {
    const fromCats = categories.length ? byCategories(categories) : [];
    if (!alsoInclude) return filterByArea(fromCats, area);
    const seen = new Set(fromCats.map((r) => r.id));
    const extras = RESOURCES.filter((r) => !seen.has(r.id) && alsoInclude(r));
    return filterByArea([...fromCats, ...extras], area);
  }, [categories, area, alsoInclude]);
  const results = useMemo(() => {
    let list = searchResources(query, pool);
    if (showDisabilityFilters) {
      if (disabilityFilter !== 'all') {
        list = list.filter((r) => matchesDisabilityChip(r, disabilityFilter));
      }
      return sortDisabilityResources(list);
    }
    if (showStudentFilters) {
      if (studentFilter !== 'all') {
        list = list.filter((r) => matchesStudentChip(r, studentFilter));
      }
      return sortStudentResources(list);
    }
    if (showHomelessFilters) {
      if (homelessFilter !== 'all') {
        list = list.filter((r) => matchesHomelessChip(r, homelessFilter));
      }
      return sortHomelessResources(list);
    }
    if (showCertGroups) {
      if (jobFilter === 'employment') list = list.filter((r) => r.category === 'employment');
      else if (jobFilter === 'certs') list = list.filter((r) => Boolean(r.certGroup));
      else if (jobFilter === 'free') list = list.filter((r) => isFreeCertificate(r));
      else if (jobFilter === 'classes') list = list.filter((r) => r.category === 'education' && !r.certGroup);
      else if (CERT_GROUP_IDS.has(jobFilter as CertGroup)) {
        list = list.filter((r) => r.certGroup === jobFilter);
      }
      const certView =
        jobFilter === 'certs' || jobFilter === 'free' || CERT_GROUP_IDS.has(jobFilter as CertGroup);
      if (certView) {
        list = list.slice().sort((a, b) => {
          const freeDiff = Number(isFreeCertificate(b)) - Number(isFreeCertificate(a));
          if (freeDiff !== 0) return freeDiff;
          return a.name.localeCompare(b.name);
        });
      }
    } else if (activeCat !== 'all') {
      list = list.filter((r) => r.category === activeCat);
    }
    return list;
  }, [
    query,
    pool,
    activeCat,
    jobFilter,
    showCertGroups,
    showDisabilityFilters,
    disabilityFilter,
    showStudentFilters,
    studentFilter,
    showHomelessFilters,
    homelessFilter,
  ]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title={title} subtitle={subtitle} />
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <ResourceCard resource={item} onPress={onSelect} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.controls}>
            <SearchBar value={query} onChange={setQuery} />
            {showDisabilityFilters ? (
              <ChipRow>
                {DISABILITY_CHIPS.map((chip) => (
                  <Chip
                    key={chip.id}
                    label={chip.id === 'all' ? t('chip.all') : t(`chip.disability.${chip.id}` as MessageKey)}
                    icon={chip.id === 'all' ? undefined : chip.icon}
                    active={disabilityFilter === chip.id}
                    onPress={() => setDisabilityFilter(chip.id)}
                  />
                ))}
              </ChipRow>
            ) : showStudentFilters ? (
              <ChipRow>
                {STUDENT_CHIPS.map((chip) => (
                  <Chip
                    key={chip.id}
                    label={chip.id === 'all' ? t('chip.all') : t(`chip.student.${chip.id}` as MessageKey)}
                    icon={chip.id === 'all' ? undefined : chip.icon}
                    active={studentFilter === chip.id}
                    onPress={() => setStudentFilter(chip.id)}
                  />
                ))}
              </ChipRow>
            ) : showHomelessFilters ? (
              <ChipRow>
                {HOMELESS_CHIPS.map((chip) => (
                  <Chip
                    key={chip.id}
                    label={chip.id === 'all' ? t('chip.all') : t(`chip.homeless.${chip.id}` as MessageKey)}
                    icon={chip.id === 'all' ? undefined : chip.icon}
                    active={homelessFilter === chip.id}
                    onPress={() => setHomelessFilter(chip.id)}
                  />
                ))}
              </ChipRow>
            ) : showCertGroups ? (
              <>
                <ChipRow>
                  <Chip label={t('chip.all')} active={jobFilter === 'all'} onPress={() => setJobFilter('all')} />
                  <Chip
                    label={t('chip.jobs.help')}
                    icon="briefcase-outline"
                    active={jobFilter === 'employment'}
                    onPress={() => setJobFilter('employment')}
                  />
                  <Chip
                    label={t('chip.jobs.certs')}
                    icon="ribbon-outline"
                    active={jobFilter === 'certs'}
                    onPress={() => setJobFilter('certs')}
                  />
                  <Chip
                    label={t('chip.jobs.free')}
                    icon="pricetag-outline"
                    active={jobFilter === 'free'}
                    onPress={() => setJobFilter('free')}
                    accessibilityLabel={t('chip.jobs.free')}
                  />
                  <Chip
                    label={t('chip.jobs.ged')}
                    icon="school-outline"
                    active={jobFilter === 'classes'}
                    onPress={() => setJobFilter('classes')}
                  />
                </ChipRow>
                <ChipRow>
                  {CERT_GROUPS.map((g) => (
                    <Chip
                      key={g.id}
                      label={t(certKey(g.id, 'short'))}
                      icon={g.icon}
                      small
                      active={jobFilter === g.id}
                      onPress={() => setJobFilter(g.id)}
                    />
                  ))}
                </ChipRow>
              </>
            ) : categories.length > 1 && !alsoInclude ? (
              <ChipRow>
                <Chip label={t('chip.all')} active={activeCat === 'all'} onPress={() => setActiveCat('all')} />
                {categories.map((id) => (
                  <Chip
                    key={id}
                    label={t(catKey(id, 'short'))}
                    icon={CATEGORY_MAP[id].icon}
                    active={activeCat === id}
                    onPress={() => setActiveCat(id)}
                  />
                ))}
              </ChipRow>
            ) : null}
            <AreaFilter value={area} onChange={onAreaChange} />
            <Text style={[styles.count, { color: colors.muted }]}>
              {t(results.length === 1 ? 'home.countOne' : 'home.countMany', { n: results.length })}
              {area === 'All' ? '' : t('home.inArea', { area: areaLabel(area, t) })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>{t('list.nothingMatched')}</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>{emptyHint}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingBottom: spacing.xxl },
  controls: { paddingTop: spacing.lg, gap: spacing.md, marginBottom: spacing.sm },
  count: { paddingHorizontal: spacing.lg, fontSize: 13 },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { textAlign: 'center', fontSize: 15 },
});
