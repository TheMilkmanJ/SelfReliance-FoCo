import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_PURPLE, spacing, useTheme } from '../theme';

type Props = {
  title: string;
  subtitle: string;
};

export function Header({ title, subtitle }: Props) {
  const insets = useSafeAreaInsets();
  const { isDark, toggle } = useTheme();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.md }]}>
      <Image source={require('../../assets/splash-icon.png')} style={styles.logo} accessibilityIgnoresInvertColors />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Pressable
        onPress={toggle}
        hitSlop={10}
        style={styles.modeBtn}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: HEADER_PURPLE,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: { width: 48, height: 48, borderRadius: 24 },
  text: { flex: 1 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#e9dffb', fontSize: 14, marginTop: 2 },
  modeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});
