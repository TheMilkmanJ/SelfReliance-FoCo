import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Header } from '../components/Header';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import { mapsTownUrl, open } from '../lib/actions';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

const HELP = 'https://support.google.com/maps/answer/6292498';
const TRANSFORT = 'https://ridetransfort.com/routes-and-schedules/';
const COLT = 'https://www.lovgov.org/services/colt';

type Props = {
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  onBack: () => void;
};

function townFor(area: AreaFilterId): string {
  return area === 'All' ? 'Fort Collins' : area;
}

export function OfflineMapsScreen({ area, onAreaChange, onBack }: Props) {
  const { colors } = useTheme();
  const town = townFor(area);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title="Offline maps" subtitle="Google Maps download, plus bus PDFs" />
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to resources">
          <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
          <Text style={[styles.backText, { color: colors.purple }]}>Resources</Text>
        </Pressable>
        <AreaFilter value={area} onChange={onAreaChange} />

        <Text style={[styles.lede, { color: colors.body }]} maxFontSizeMultiplier={MAX_FONT.title}>
          This directory, trash day, and open now already work with no signal. Google does not let this app store
          Google’s map. Download {town} inside the Google Maps app. Then Get directions can still work for walking
          and driving when you have no data. Bus times and live traffic need a signal.
        </Text>

        <Text style={[styles.section, { color: colors.ink }]}>Download in Google Maps</Text>
        <Step n={1} line="Open Google Maps (not this app)." />
        <Step n={2} line={`Search ${town}.`} />
        <Step n={3} line="Tap the town name at the bottom, then Download." />
        <Step n={4} line="Wait on Wi-Fi. The area is saved on the phone." />

        {area === 'All' ? (
          <Text style={[styles.note, { color: colors.muted }]}>
            Showing {areaLabel('Fort Collins')} when All of Larimer is selected. Pick a town chip for Loveland, Estes
            Park, Berthoud, or Wellington and download that area the same way.
          </Text>
        ) : null}

        <Action icon="map-outline" label={`Open Google Maps for ${town}`} onPress={() => open(mapsTownUrl(town))} />
        <Action icon="download-outline" label="Google’s offline maps steps" onPress={() => open(HELP)} />

        <Text style={[styles.section, { color: colors.ink }]}>Buses without a map tile</Text>
        <Text style={[styles.note, { color: colors.body }]}>
          Transfort route maps are PDFs you can save in Files. No Sunday service. COLT is Loveland’s buses. Live next-bus
          times still need data.
        </Text>
        <Action icon="bus-outline" label="Transfort route maps (save the PDFs)" onPress={() => open(TRANSFORT)} />
        {town === 'Loveland' ? (
          <Action icon="bus-outline" label="COLT Loveland buses" onPress={() => open(COLT)} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function Step({ n, line }: { n: number; line: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.step, { backgroundColor: colors.card }]}>
      <View style={[styles.num, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
        <Text style={[styles.numText, { color: HEADER_PURPLE }]}>{n}</Text>
      </View>
      <Text style={[styles.stepLine, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
        {line}
      </Text>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.action, { borderColor: HEADER_PURPLE, backgroundColor: colors.card }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon as never} size={20} color={HEADER_PURPLE} />
      <Text style={[styles.actionText, { color: colors.purple }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingBottom: spacing.xxl, gap: spacing.lg },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backText: { fontWeight: '700', fontSize: 16 },
  lede: { paddingHorizontal: spacing.lg, fontSize: 16, lineHeight: 23 },
  section: { paddingHorizontal: spacing.lg, fontSize: 18, fontWeight: '800' },
  note: { paddingHorizontal: spacing.lg, fontSize: 15, lineHeight: 22 },
  step: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  num: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontWeight: '800', fontSize: 15 },
  stepLine: { flex: 1, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  action: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderRadius: radius.lg,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: { fontWeight: '800', fontSize: 16, flex: 1 },
});
