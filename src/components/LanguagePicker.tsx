import { Ionicons } from '@expo/vector-icons';
import { createElement, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_LANGUAGES, isAppLanguage, languageOption, useI18n, type AppLanguage } from '../i18n';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

function optionLabel(opt: (typeof APP_LANGUAGES)[number]): string {
  return opt.englishName === opt.nativeName ? opt.nativeName : `${opt.nativeName} — ${opt.englishName}`;
}

/** Native HTML select on web so it is a real dropdown. Custom list on Android/iOS. */
function LanguageSelect({
  variant,
}: {
  variant: 'header' | 'tile';
}) {
  const { colors } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const current = languageOption(language);
  const a11y = t('header.languageA11y', { name: current.nativeName });

  if (Platform.OS === 'web') {
    const style =
      variant === 'header'
        ? {
            height: 40,
            minWidth: 92,
            marginTop: 2,
            paddingLeft: 10,
            paddingRight: 8,
            borderRadius: 20,
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.16)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
          }
        : {
            width: '100%',
            minHeight: 56,
            paddingLeft: 16,
            paddingRight: 12,
            borderRadius: 16,
            border: `2px solid ${HEADER_PURPLE}`,
            backgroundColor: colors.card,
            color: colors.ink,
            fontWeight: 800,
            fontSize: 17,
          };
    return createElement(
      'select',
      {
        value: language,
        'aria-label': a11y,
        onChange: (event: { target: { value: string } }) => {
          if (isAppLanguage(event.target.value)) setLanguage(event.target.value);
        },
        style,
      },
      APP_LANGUAGES.map((opt) => createElement('option', { key: opt.id, value: opt.id }, optionLabel(opt))),
    );
  }

  if (variant === 'header') {
    return <HeaderLanguageMenu />;
  }

  return <TileLanguageMenu />;
}

/** Language tile: a dropdown you pick from. All eight app languages. */
export function LanguagePicker() {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
        {t('lang.listLabel')}
      </Text>
      <View style={styles.selectWrap}>
        <LanguageSelect variant="tile" />
      </View>
      <Text style={[styles.honest, { color: colors.muted }]}>{t('lang.honest')}</Text>
    </View>
  );
}

/** Header control: dropdown of the same eight languages. */
export function HeaderLanguageButton() {
  return <LanguageSelect variant="header" />;
}

function TileLanguageMenu() {
  const { colors } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const current = languageOption(language);
  const [open, setOpen] = useState(true);
  const sub =
    current.englishName === current.nativeName
      ? t('lang.menusMeta')
      : `${current.englishName} · ${t('lang.menusMeta')}`;

  return (
    <View>
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
    </View>
  );
}

function HeaderLanguageMenu() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const current = languageOption(language);
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.headerWrap}>
      <Pressable
        onPress={() => setOpen((was) => !was)}
        hitSlop={10}
        style={styles.headerBtn}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t('header.languageA11y', { name: current.nativeName })}
      >
        <Text style={styles.headerCode} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {current.code}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={11} color="#fff" />
      </Pressable>
      {open ? (
        <View
          style={[
            styles.headerMenu,
            {
              top: insets.top + 48,
              backgroundColor: colors.card,
              borderColor: isDark ? colors.line : HEADER_PURPLE,
            },
          ]}
        >
          <Text style={[styles.menuLabel, { color: HEADER_PURPLE }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
            {t('lang.listLabel')}
          </Text>
          <ScrollView style={styles.headerScroll} keyboardShouldPersistTaps="handled">
            <LanguageRows
              selected={language}
              onPick={(id) => {
                setLanguage(id);
                setOpen(false);
              }}
            />
          </ScrollView>
        </View>
      ) : null}
    </View>
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
  section: { paddingHorizontal: spacing.lg, fontSize: 18, fontWeight: '800' },
  selectWrap: { marginHorizontal: spacing.lg },
  bar: {
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
    marginTop: spacing.sm,
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
  headerWrap: { zIndex: 20 },
  headerBtn: {
    minWidth: 44,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginTop: 2,
    flexDirection: 'row',
    gap: 2,
  },
  headerCode: { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 16 },
  headerMenu: {
    position: 'absolute',
    right: 0,
    width: 280,
    maxHeight: 420,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    zIndex: 30,
    elevation: 8,
  },
  headerScroll: { maxHeight: 380 },
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
