import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OpenNowDetail } from './src/components/OpenNowDetail';
import { ResourceDetail } from './src/components/ResourceDetail';
import { TabBar, type TabId } from './src/components/TabBar';
import type { OpenPlace } from './src/data/openNowTypes';
import { isDisabilityResource, isHomelessResource, isStudentResource, type AreaFilter } from './src/data/resources';
import type { Resource } from './src/data/types';
import { useDenverNow } from './src/lib/denverClock';
import { useLargePrint } from './src/lib/fontScale';
import { statusFor } from './src/lib/openNowStatus';
import { GiveNeedScreen } from './src/screens/GiveNeedScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { OfflineMapsScreen } from './src/screens/OfflineMapsScreen';
import { OpenNowScreen } from './src/screens/OpenNowScreen';
import { ResourceListScreen } from './src/screens/ResourceListScreen';
import { TrashDayScreen } from './src/screens/TrashDayScreen';
import { ThemeProvider, useTheme } from './src/theme';

type HomeTool = 'trash' | 'openNow' | 'giveNeed' | 'offlineMaps' | null;

const AREA_KEY = 'foco-area-filter';
const AREAS: AreaFilter[] = ['All', 'Fort Collins', 'Loveland', 'Estes Park', 'Berthoud', 'Wellington'];

function AppShell() {
  const { colors } = useTheme();
  const largePrint = useLargePrint();
  const now = useDenverNow();
  const [tab, setTab] = useState<TabId>('home');
  const [tool, setTool] = useState<HomeTool>(null);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [openPlace, setOpenPlace] = useState<OpenPlace | null>(null);
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
          {tab === 'home' && tool === 'trash' ? (
            <TrashDayScreen area={area} onAreaChange={setArea} onBack={() => setTool(null)} />
          ) : null}
          {tab === 'home' && tool === 'openNow' ? (
            <OpenNowScreen
              area={area}
              onAreaChange={setArea}
              onBack={() => setTool(null)}
              onSelect={setOpenPlace}
            />
          ) : null}
          {tab === 'home' && tool === 'giveNeed' ? (
            <GiveNeedScreen
              area={area}
              onAreaChange={setArea}
              onBack={() => setTool(null)}
              onSelect={setSelected}
            />
          ) : null}
          {tab === 'home' && tool === 'offlineMaps' ? (
            <OfflineMapsScreen area={area} onAreaChange={setArea} onBack={() => setTool(null)} />
          ) : null}
          {tab === 'home' && !tool ? (
            <HomeScreen
              onSelect={setSelected}
              area={area}
              onAreaChange={setArea}
              onTrashDay={() => setTool('trash')}
              onOpenNow={() => setTool('openNow')}
              onGiveNeed={() => setTool('giveNeed')}
              onOfflineMaps={() => setTool('offlineMaps')}
            />
          ) : null}
          {tab === 'students' ? (
            <ResourceListScreen
              title="Students"
              subtitle={
                largePrint
                  ? 'College, GED, FAFSA, pantries, and jobs.'
                  : 'College, GED, FAFSA, pantries, school meals, and jobs. Certificates stay under Resources.'
              }
              alsoInclude={isStudentResource}
              onSelect={setSelected}
              emptyHint="Try words like FAFSA, GED, pantry, McKinney, or CSU."
              area={area}
              onAreaChange={setArea}
              showStudentFilters
            />
          ) : null}
          {tab === 'homeless' ? (
            <ResourceListScreen
              title="Homeless"
              subtitle={
                largePrint
                  ? 'Beds, day help, meals, showers, and rent.'
                  : 'Beds, day help, meals, showers, and rent. Call 2-1-1 if you need a referral tonight.'
              }
              alsoInclude={isHomelessResource}
              onSelect={setSelected}
              emptyHint="Try words like Murphy, shelter, shower, rent, or McKinney."
              area={area}
              onAreaChange={setArea}
              showHomelessFilters
            />
          ) : null}
          {tab === 'disability' ? (
            <ResourceListScreen
              title={largePrint ? 'Disability' : 'Have a disability?'}
              subtitle={
                largePrint
                  ? 'Med-9, glasses, rec, rides, and rights.'
                  : 'Med-9, glasses, rec passes, rides, and rights. Jobs, housing, and clothes stay under Resources.'
              }
              alsoInclude={isDisabilityResource}
              onSelect={setSelected}
              emptyHint="Try words like Med-9, glasses, pool, ride, DVR, or SSI."
              area={area}
              onAreaChange={setArea}
              showDisabilityFilters
            />
          ) : null}
        </View>
        <TabBar
          active={tab}
          onChange={(id) => {
            setTab(id);
            setTool(null);
          }}
        />
      </View>
      <ResourceDetail resource={selected} onClose={() => setSelected(null)} />
      <OpenNowDetail
        place={openPlace}
        status={openPlace ? statusFor(openPlace, now) : null}
        onClose={() => setOpenPlace(null)}
      />
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
