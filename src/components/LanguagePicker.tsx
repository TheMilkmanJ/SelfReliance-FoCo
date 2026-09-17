import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_LANGUAGES, useI18n, type AppLanguage } from '../i18n';
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

export function LanguagePicker() {
  const { colors, isDark } = useTheme();
  const { language, setLanguage, t } = useI18n();
  return (
    <View style={styles.wrap}>
      {APP_LANGUAGES.map((opt) => (
        <LangRow
          key={opt.id}
          code={opt.id}
          title={opt.nativeName}
          meta={opt.englishName}
          selected={language === opt.id}
          a11y={t('lang.a11yUse', { name: opt.nativeName })}
          onPress={() => setLanguage(opt.id)}
          isDark={isDark}
          ink={colors.ink}
          muted={colors.muted}
          body={colors.body}
          card={colors.card}
        />
      ))}
      <Text style={[styles.honest, { color: colors.muted }]}>{t('lang.honest')}</Text>
    </View>
  );
}

function LangRow({
  code,
  title,
  meta,
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
          <Ionicons name={languageIcon(code)} size={22} color={HEADER_PURPLE} />
        </View>
        <View style={styles.listingBody}>
          <Text style={[styles.listingName, { color: ink }]}>{title}</Text>
          <Text style={[styles.listingMeta, { color: muted }]}>
            {selected ? t('lang.selected') : `${meta} · ${t('lang.menusMeta')}`}
          </Text>
          {selected ? <Text style={[styles.listingDesc, { color: body }]}>{t('lang.menusNote')}</Text> : null}
        </View>
        {selected ? <Ionicons name="checkmark" size={22} color={HEADER_PURPLE} /> : null}
      </View>
    </Pressable>
  );
}

function languageIcon(code: AppLanguage): 'chatbubble-ellipses-outline' | 'language' {
  return code === 'en' ? 'chatbubble-ellipses-outline' : 'language';
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
  listingMeta: { fontSize: 13, marginTop: 2, marginBottom: 4 },
  listingDesc: { fontSize: 15, lineHeight: 21 },
  honest: {
    paddingHorizontal: spacing.lg,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
});
