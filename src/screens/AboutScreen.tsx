import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '../components/Header';
import { useI18n } from '../i18n';
import { open } from '../lib/actions';
import { useBackLayer } from '../lib/backStack';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

export const PRIVACY_POLICY_URL = 'https://themilkmanj.github.io/selfreliance-privacy/';

type Props = {
  onBack: () => void;
};

export function AboutEntry({ onPress }: { onPress: () => void }) {
  const { t } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      style={styles.entry}
      accessibilityRole="button"
      accessibilityLabel={t('about.openA11y')}
    >
      <Ionicons name="information-circle-outline" size={22} color="#ffffff" />
      <Text style={styles.entryLabel} maxFontSizeMultiplier={MAX_FONT.title}>
        {t('about.open')}
      </Text>
    </Pressable>
  );
}

export function AboutScreen({ onBack }: Props) {
  const { handleClose } = useBackLayer(true, onBack);
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title={t('about.title')} subtitle={t('about.subtitle')} />
      <Pressable
        onPress={handleClose}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel={t('common.backResources')}
      >
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
        <Text style={[styles.backText, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          {t('common.resources')}
        </Text>
      </Pressable>
      <Text style={[styles.lede, { color: colors.body }]} maxFontSizeMultiplier={MAX_FONT.title}>
        {t('about.lede')}
      </Text>
      <Pressable
        onPress={() => {
          void open(PRIVACY_POLICY_URL);
        }}
        style={[styles.privacy, { backgroundColor: colors.card, borderColor: colors.line }]}
        accessibilityRole="button"
        accessibilityLabel={t('about.privacyA11y')}
        accessibilityHint={t('about.privacyHint')}
      >
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.ink} />
        <View style={styles.privacyText}>
          <Text style={[styles.privacyLabel, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
            {t('about.privacy')}
          </Text>
          <Text style={[styles.privacyHint, { color: colors.body }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
            {t('about.privacyHint')}
          </Text>
        </View>
        <Ionicons name="open-outline" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  entry: {
    minHeight: 48,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: HEADER_PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '800', flex: 1 },
  back: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  backText: { fontWeight: '700', fontSize: 16 },
  lede: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, fontSize: 16, lineHeight: 23 },
  privacy: {
    minHeight: 48,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  privacyText: { flex: 1 },
  privacyLabel: { fontSize: 18, fontWeight: '800' },
  privacyHint: { fontSize: 15, marginTop: 2 },
});
