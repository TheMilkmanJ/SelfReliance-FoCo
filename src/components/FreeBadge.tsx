import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n';
import { radius, useTheme } from '../theme';

/** Shown next to a certificate title when the listed credential does not cost money. */
export function FreeBadge() {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <View
      style={[styles.badge, { backgroundColor: `${colors.green}1f` }]}
      accessibilityRole="text"
      accessibilityLabel={t('detail.free')}
    >
      <Text style={[styles.text, { color: colors.green }]} maxFontSizeMultiplier={1.4}>
        {t('detail.free')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: 'center',
  },
  text: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
});
