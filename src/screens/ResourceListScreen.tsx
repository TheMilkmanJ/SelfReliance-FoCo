import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Chip } from '../components/Chip';
import { Header } from '../components/Header';
import { ResourceCard } from '../components/ResourceCard';
import { SearchBar } from '../components/SearchBar';
import { CATEGORY_MAP } from '../data/categories';
import {
  RESOURCES,
  byCategories,
  filterByArea,
  searchResources,
  type AreaFilter as AreaFilterId,
} from '../data/resources';
import type { CategoryId, Resource } from '../data/types';
import { spacing, useTheme } from '../theme';

type Props = {
  title: string;
  subtitle: string;
  categories: CategoryId[];
  onSelect: (r: Resource) => void;
  emptyHint: string;
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  /** Also include listings from other categories that match (used by the Clothes tab). */
  alsoInclude?: (resource: Resource) => boolean;
};

export function ResourceListScreen({
  title,
  subtitle,
  categories,
  onSelect,
  emptyHint,
  area,
  onAreaChange,
  alsoInclude,
}: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<CategoryId | 'all'>('all');

  const pool = useMemo(() => {
    const fromCats = byCategories(categories);
    if (!alsoInclude) return filterByArea(fromCats, area);
    const seen = new Set(fromCats.map((r) => r.id));
    const extras = RESOURCES.filter((r) => !seen.has(r.id) && alsoInclude(r));
    return filterByArea([...fromCats, ...extras], area);
  }, [categories, area, alsoInclude]);
  const results = useMemo(() => {
    let list = searchResources(query, pool);
    if (activeCat !== 'all') list = list.filter((r) => r.category === activeCat);
    return list;
  }, [query, pool, activeCat]);

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
            {categories.length > 1 && !alsoInclude ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                <Chip label="All" active={activeCat === 'all'} onPress={() => setActiveCat('all')} />
                {categories.map((id) => (
                  <Chip
                    key={id}
                    label={CATEGORY_MAP[id].short}
                    icon={CATEGORY_MAP[id].icon}
                    active={activeCat === id}
                    onPress={() => setActiveCat(id)}
                  />
                ))}
              </ScrollView>
            ) : null}
            <AreaFilter value={area} onChange={onAreaChange} />
            <Text style={[styles.count, { color: colors.muted }]}>
              {results.length} {results.length === 1 ? 'resource' : 'resources'}
              {area === 'All' ? '' : ` in ${areaLabel(area)}`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>Nothing matched</Text>
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
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  count: { paddingHorizontal: spacing.lg, fontSize: 13 },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 21 },
});
