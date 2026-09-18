import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_LANGUAGES, languageOption, useI18n, type AppLanguage } from '../i18n';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

/** Language tile: tap the bar, then scroll the list. The page behind does not move. */
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
      <Text style={[styles.section, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
        {t('lang.listLabel')}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
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
        <Ionicons name="chevron-down" size={22} color={HEADER_PURPLE} />
      </Pressable>
      <Text style={[styles.honest, { color: colors.muted }]}>{t('lang.honest')}</Text>
      <LanguageSheet
        open={open}
        selected={language}
        onClose={() => setOpen(false)}
        onPick={(id) => {
          setLanguage(id);
          setOpen(false);
        }}
      />
    </View>
  );
}

/** Header control: same eight languages, in a sheet that keeps the finger scroll. */
export function HeaderLanguageButton() {
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
      <LanguageSheet
        open={open}
        selected={language}
        onClose={() => setOpen(false)}
        onPick={(id) => {
          setLanguage(id);
          setOpen(false);
        }}
      />
    </>
  );
}

function LanguageSheet({
  open,
  selected,
  onClose,
  onPick,
}: {
  open: boolean;
  selected: AppLanguage;
  onClose: () => void;
  onPick: (id: AppLanguage) => void;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const listMax = Math.min(420, Math.max(220, height - insets.top - insets.bottom - 160));

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('header.closeLang')}
        />
        <View
          style={[
            styles.sheet,
            {
              marginTop: insets.top + 56,
              marginBottom: insets.bottom + spacing.lg,
              backgroundColor: colors.card,
              borderColor: isDark ? colors.line : HEADER_PURPLE,
            },
          ]}
        >
          <Text style={[styles.menuLabel, { color: HEADER_PURPLE }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
            {t('lang.listLabel')}
          </Text>
          <ScrollView
            style={[styles.scroll, { maxHeight: listMax }]}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            bounces={false}
            overScrollMode="never"
          >
            <LanguageRows selected={selected} onPick={onPick} />
          </ScrollView>
        </View>
      </View>
    </Modal>
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
    flexDirection: 'row',
    gap: 2,
  },
  headerCode: { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 16 },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(20, 17, 28, 0.45)',
  },
  scroll: {
    flexGrow: 0,
    ...Platform.select({
      web: { touchAction: 'pan-y' },
      default: {},
    }),
  },
  sheet: {
    marginHorizontal: spacing.lg,
    alignSelf: 'flex-end',
    width: 300,
    maxWidth: '100%',
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    zIndex: 2,
    elevation: 8,
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
