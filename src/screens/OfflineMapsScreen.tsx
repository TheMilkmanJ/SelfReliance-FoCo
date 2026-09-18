import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Header } from '../components/Header';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import { useI18n } from '../i18n';
import { mapsTownUrl, open } from '../lib/actions';
import { useBackLayer } from '../lib/backStack';
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
  const { handleClose } = useBackLayer(true, onBack);
  const { colors } = useTheme();
  const { t } = useI18n();
  const town = townFor(area);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title={t('maps.title')} subtitle={t('maps.subtitle')} />
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable onPress={handleClose} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.backResources')}>
          <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
          <Text style={[styles.backText, { color: colors.purple }]}>{t('common.resources')}</Text>
        </Pressable>
        <AreaFilter value={area} onChange={onAreaChange} />

        <Text style={[styles.lede, { color: colors.body }]} maxFontSizeMultiplier={MAX_FONT.title}>
          {t('maps.lede', { town })}
        </Text>

        <Text style={[styles.section, { color: colors.ink }]}>{t('maps.downloadSection')}</Text>
        <Step n={1} line={t('maps.step1')} />
        <Step n={2} line={t('maps.step2', { town })} />
        <Step n={3} line={t('maps.step3')} />
        <Step n={4} line={t('maps.step4')} />

        {area === 'All' ? (
          <Text style={[styles.note, { color: colors.muted }]}>
            {t('maps.noteAll', { area: areaLabel('Fort Collins', t) })}
          </Text>
        ) : null}

        <Action icon="map-outline" label={t('maps.openTown', { town })} onPress={() => open(mapsTownUrl(town))} />
        <Action icon="download-outline" label={t('maps.googleSteps')} onPress={() => open(HELP)} />

        <Text style={[styles.section, { color: colors.ink }]}>{t('maps.busSection')}</Text>
        <Text style={[styles.note, { color: colors.body }]}>{t('maps.busNote')}</Text>
        <Action icon="bus-outline" label={t('maps.transfort')} onPress={() => open(TRANSFORT)} />
        {town === 'Loveland' ? (
          <Action icon="bus-outline" label={t('maps.colt')} onPress={() => open(COLT)} />
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
