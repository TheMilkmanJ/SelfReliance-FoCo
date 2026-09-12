import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ResourceDetail } from './src/components/ResourceDetail';
import { TabBar, type TabId } from './src/components/TabBar';
import { CLOTHES_CATEGORIES, HOUSING_CATEGORIES, JOBS_CATEGORIES } from './src/data/categories';
import { isClothingResource, type AreaFilter } from './src/data/resources';
import type { Resource } from './src/data/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResourceListScreen } from './src/screens/ResourceListScreen';
import { ThemeProvider, useTheme } from './src/theme';

const AREA_KEY = 'foco-area-filter';
const AREAS: AreaFilter[] = ['All', 'Fort Collins', 'Loveland', 'Estes Park', 'Berthoud', 'Wellington'];

function AppShell() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<TabId>('home');
  const [selected, setSelected] = useState<Resource | null>(null);
  const [area, setAreaState] = useState<AreaFilter>('All');

  useEffect(() => {
    void AsyncStorage.getItem(AREA_KEY).then((saved) => {
      if (saved && AREAS.includes(saved as AreaFilter)) setAreaState(saved as AreaFilter);
    });
  }, []);

  const setArea = (next: AreaFilter) => {
    setAreaState(next);
    void AsyncStorage.setItem(AREA_KEY, next);
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.body}>
          {tab === 'home' ? <HomeScreen onSelect={setSelected} area={area} onAreaChange={setArea} /> : null}
          {tab === 'jobs' ? (
            <ResourceListScreen
              title="Jobs & Employment"
              subtitle="Work, training, free certificates, and help getting hired"
              categories={JOBS_CATEGORIES}
              onSelect={setSelected}
              emptyHint="Try words like resume, certificate, coding, or apprenticeship."
              area={area}
              onAreaChange={setArea}
            />
          ) : null}
          {tab === 'housing' ? (
            <ResourceListScreen
              title="Housing"
              subtitle="Rent help, shelter, vouchers, and utility bills"
              categories={HOUSING_CATEGORIES}
              onSelect={setSelected}
              emptyHint="Try words like rent, shelter, voucher, heating, or eviction."
              area={area}
              onAreaChange={setArea}
            />
          ) : null}
          {tab === 'clothes' ? (
            <ResourceListScreen
              title="Clothes"
              subtitle="Free clothing, kids clothes, interview outfits, and hygiene"
              categories={CLOTHES_CATEGORIES}
              alsoInclude={isClothingResource}
              onSelect={setSelected}
              emptyHint="Try words like clothes, kids, interview, or hygiene."
              area={area}
              onAreaChange={setArea}
            />
          ) : null}
        </View>
        <TabBar active={tab} onChange={setTab} />
      </View>
      <ResourceDetail resource={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
