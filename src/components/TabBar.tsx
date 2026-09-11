import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_PURPLE, spacing, useTheme } from '../theme';

export type TabId = 'home' | 'jobs' | 'housing' | 'clothes';

const TABS: Array<{ id: TabId; label: string; icon: string; iconActive: string }> = [
  { id: 'home', label: 'Resources', icon: 'grid-outline', iconActive: 'grid' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase-outline', iconActive: 'briefcase' },
  { id: 'housing', label: 'Housing', icon: 'home-outline', iconActive: 'home' },
  { id: 'clothes', label: 'Clothes', icon: 'shirt-outline', iconActive: 'shirt' },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
};

export function TabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing.sm), backgroundColor: colors.card, borderTopColor: colors.line },
      ]}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
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
            <Text style={[styles.label, { color: isActive ? HEADER_PURPLE : colors.muted }]}>{t.label}</Text>
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
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  label: { fontSize: 11, fontWeight: '600' },
});
