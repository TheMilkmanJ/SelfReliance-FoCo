import { StyleSheet, Text, View } from 'react-native';

import { radius, useTheme } from '../theme';

/** Shown next to a certificate title when the listed credential does not cost money. */
export function FreeBadge() {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.badge, { backgroundColor: `${colors.green}1f` }]
      accessibilityRole="text"
      accessibilityLabel="Free"
    >
      <Text style={[styles.text, { color: colors.green }]}>Free</Text>
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
