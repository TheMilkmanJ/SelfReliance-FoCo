import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n, type AppLanguage } from '../i18n';
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

export function LanguagePicker() {
  const { colors, isDark } = useTheme();
  const { language, setLanguage, t } = useI18n();
  return (
    <View style={styles.wrap}>
      <LangRow
        code="en"
        title={t('lang.englishName')}
        meta={t('lang.englishMeta')}
        note={t('lang.englishNote')}
        selected={language === 'en'}
        a11y={t('lang.a11yEn')}
        onPress={() => setLanguage('en')}
        isDark={isDark}
        ink={colors.ink}
        muted={colors.muted}
        body={colors.body}
        card={colors.card}
      />
      <LangRow
        code="es"
        title={t('lang.spanishName')}
        meta={t('lang.spanishMeta')}
        note={t('lang.spanishNote')}
        selected={language === 'es'}
        a11y={t('lang.a11yEs')}
        onPress={() => setLanguage('es')}
        isDark={isDark}
        ink={colors.ink}
        muted={colors.muted}
        body={colors.body}
        card={colors.card}
      />
      <Text style={[styles.honest, { color: colors.muted }]}>{t('lang.honest')}</Text>
    </View>
  );
}

function LangRow({
  code,
  title,
  meta,
  note,
  selected,
  a11y,
  onPress,
  isDark,
  ink,
  muted,
  body,
  card,
}: {
  code: AppLanguage;
  title: string;
  meta: string;
  note: string;
  selected: boolean;
  a11y: string;
  onPress: () => void;
  isDark: boolean;
  ink: string;
  muted: string;
  body: string;
  card: string;
}) {
  const { t } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.listing, { backgroundColor: card }, cardShadow(isDark)]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${a11y}. ${selected ? t('lang.selected') : ''}`}
    >
      <View style={styles.listingRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
          <Ionicons name={code === 'es' ? 'language' : 'chatbubble-ellipses-outline'} size={22} color={HEADER_PURPLE} />
        </View>
        <View style={styles.listingBody}>
          <Text style={[styles.listingName, { color: ink }]}>{title}</Text>
          <Text style={[styles.listingMeta, { color: muted }]}>
            {selected ? t('lang.selected') : meta}
          </Text>
          <Text style={[styles.listingDesc, { color: body }]}>{note}</Text>
        </View>
        {selected ? <Ionicons name="checkmark" size={22} color={HEADER_PURPLE} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: spacing.sm },
  listing: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listingRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingBody: { flex: 1 },
  listingName: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  listingMeta: { fontSize: 13, marginTop: 2, marginBottom: 6 },
  listingDesc: { fontSize: 15, lineHeight: 21 },
  honest: {
    paddingHorizontal: spacing.lg,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
});
