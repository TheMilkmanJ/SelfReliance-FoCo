import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ResourceDetail } from './src/components/ResourceDetail';
import { TabBar, type TabId } from './src/components/TabBar';
import { isDisabilityResource, type AreaFilter } from './src/data/resources';
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
          {tab === 'disability' ? (
            <ResourceListScreen
              title="Have a disability?"
              subtitle="Med-9, downstairs resource desk at Pennock Place (ask for Robert), glasses, rec passes, rides, jobs, legal rights, college, and statewide programs. Jobs, housing, and clothes are still under Resources."
              alsoInclude={isDisabilityResource}
              onSelect={setSelected}
              emptyHint="Try words like Med-9, glasses, pool, ride, DVR, or SSI."
              area={area}
              onAreaChange={setArea}
              showDisabilityFilters
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
