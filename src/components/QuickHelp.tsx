import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n';
import { MAX_FONT } from '../lib/fontScale';
import { call } from '../lib/actions';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

export function QuickHelp() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const lines = [
    { label: '2-1-1', sub: t('quick.211sub'), number: '211', color: HEADER_PURPLE },
    { label: '9-8-8', sub: t('quick.988sub'), number: '988', color: colors.red },
  ];
  return (
    <View style={styles.row}>
      {lines.map((l) => (
        <Pressable
          key={l.number}
          onPress={() => call(l.number)}
          style={({ pressed }) => [
            styles.btn,
            { borderColor: l.color, backgroundColor: colors.card },
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('quick.callA11y', { label: l.label, sub: l.sub })}
        >
          <Ionicons name="call" size={18} color={l.color} />
          <View style={styles.copy}>
            <Text style={[styles.label, { color: l.color }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
              {l.label}
            </Text>
            <Text style={[styles.sub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
              {l.sub}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingHorizontal: spacing.lg },
  btn: {
    flexGrow: 1,
    flexBasis: 150,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  copy: { flex: 1, minWidth: 0 },
  label: { fontSize: 17, fontWeight: '800' },
  sub: { fontSize: 12 },
});
