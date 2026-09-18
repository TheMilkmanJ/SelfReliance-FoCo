import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_LANGUAGES, languageOption, useI18n, type AppLanguage } from '../i18n';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

/** Language tile: one bar, same pattern as the trash-day region dropdown. */
export function LanguagePicker() {
  const { colors } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const current = languageOption(language);
  const [open, setOpen] = useState(false);
  const sub =
    current.englishName === current.nativeName
      ? t('lang.menusMeta')
      : `${current.englishName} · ${t('lang.menusMeta')}`;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((was) => !was)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t('header.languageA11y', { name: current.nativeName })}
        style={[styles.bar, { backgroundColor: colors.card, borderColor: HEADER_PURPLE }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
          <Ionicons name="language" size={22} color={HEADER_PURPLE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.barTitle, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
            {current.nativeName}
          </Text>
          <Text style={[styles.barSub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
            {sub}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={HEADER_PURPLE} />
      </Pressable>

      {open ? (
        <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <LanguageRows
            selected={language}
            onPick={(id) => {
              setLanguage(id);
              setOpen(false);
            }}
          />
        </View>
      ) : null}

      <Text style={[styles.honest, { color: colors.muted }]}>{t('lang.honest')}</Text>
    </View>
  );
}

/** Header control: shows the language you are in, then a list instead of cycling to the next code. */
export function HeaderLanguageButton() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const current = languageOption(language);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        style={styles.headerBtn}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t('header.languageA11y', { name: current.nativeName })}
      >
        <Text style={styles.headerCode} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {current.code}
        </Text>
        <Ionicons name="chevron-down" size={11} color="#fff" />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t('header.closeLang')}
          />
          <View
            style={[
              styles.headerMenu,
              {
                marginTop: insets.top + 56,
                backgroundColor: colors.card,
                borderColor: isDark ? colors.line : HEADER_PURPLE,
              },
            ]}
          >
            <Text style={[styles.menuLabel, { color: HEADER_PURPLE }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
              {t('lang.listLabel')}
            </Text>
            <LanguageRows
              selected={language}
              onPick={(id) => {
                setLanguage(id);
                setOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function LanguageRows({
  selected,
  onPick,
}: {
  selected: AppLanguage;
  onPick: (id: AppLanguage) => void;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <>
      {APP_LANGUAGES.map((opt) => {
        const on = opt.id === selected;
        const meta =
          opt.englishName === opt.nativeName ? t('lang.menusMeta') : `${opt.englishName} · ${t('lang.menusMeta')}`;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onPick(opt.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={on ? `${opt.nativeName}. ${t('lang.selected')}` : t('lang.a11yUse', { name: opt.nativeName })}
            style={[styles.row, on && { backgroundColor: `${HEADER_PURPLE}14` }]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.rowTitle, { color: on ? HEADER_PURPLE : colors.ink }]}
                maxFontSizeMultiplier={MAX_FONT.title}
              >
                {opt.nativeName}
              </Text>
              <Text style={[styles.rowSub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
                {on ? t('lang.selected') : meta}
              </Text>
            </View>
            <Text style={[styles.rowCode, { color: on ? HEADER_PURPLE : colors.muted }]}>{opt.code}</Text>
            {on ? <Ionicons name="checkmark" size={20} color={HEADER_PURPLE} /> : null}
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingBottom: spacing.sm },
  bar: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderRadius: radius.lg,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: { fontSize: 17, fontWeight: '800', textAlign: 'left', writingDirection: 'ltr' },
  barSub: { fontSize: 13, marginTop: 3, lineHeight: 18, textAlign: 'left', writingDirection: 'ltr' },
  menu: {
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  honest: {
    paddingHorizontal: spacing.lg,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  headerBtn: {
    minWidth: 44,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginTop: 2,
  },
  headerCode: { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 16 },
  modalRoot: { flex: 1, backgroundColor: 'rgba(20, 17, 28, 0.45)' },
  headerMenu: {
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  menuLabel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    direction: 'ltr',
  },
  rowTitle: { fontSize: 16, fontWeight: '800', textAlign: 'left', writingDirection: 'ltr' },
  rowSub: { fontSize: 13, marginTop: 2, lineHeight: 18, textAlign: 'left', writingDirection: 'ltr' },
  rowCode: { fontSize: 13, fontWeight: '800' },
});
