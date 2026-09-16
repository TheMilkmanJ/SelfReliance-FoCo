import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAX_FONT, useLargePrint } from '../lib/fontScale';
import { HEADER_PURPLE, spacing, useTheme } from '../theme';

export type TabId = 'home' | 'students' | 'homeless' | 'disability';

const TABS: Array<{
  id: TabId;
  label: string;
  compactLabel: string;
  icon: string;
  iconActive: string;
}> = [
  { id: 'home', label: 'Resources', compactLabel: 'Resources', icon: 'grid-outline', iconActive: 'grid' },
  { id: 'students', label: 'Students', compactLabel: 'Students', icon: 'school-outline', iconActive: 'school' },
  { id: 'homeless', label: 'Homeless', compactLabel: 'Homeless', icon: 'bed-outline', iconActive: 'bed' },
  {
    id: 'disability',
    label: 'Have a disability?',
    compactLabel: 'Disability',
    icon: 'accessibility-outline',
    iconActive: 'accessibility',
  },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
};

export function TabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const largePrint = useLargePrint();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing.sm), backgroundColor: colors.card, borderTopColor: colors.line },
      ]}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
        const shown = largePrint ? t.compactLabel : t.label;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t.label}
          >
            <Ionicons name={(isActive ? t.iconActive : t.icon) as never} size={24} color={isActive ? HEADER_PURPLE : colors.muted} />
            <Text
              style={[styles.label, { color: isActive ? HEADER_PURPLE : colors.muted }]}
              numberOfLines={2}
              maxFontSizeMultiplier={MAX_FONT.chrome}
            >
              {shown}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, minWidth: 0, alignItems: 'center', gap: 2, paddingVertical: 6, paddingHorizontal: 2 },
  label: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
});
