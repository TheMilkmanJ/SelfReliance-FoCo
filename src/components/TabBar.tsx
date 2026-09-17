import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n, type MessageKey } from '../i18n';
import { MAX_FONT, useLargePrint } from '../lib/fontScale';
import { HEADER_PURPLE, spacing, useTheme } from '../theme';

export type TabId = 'home' | 'students' | 'homeless' | 'disability';

const TABS: Array<{
  id: TabId;
  labelKey: MessageKey;
  compactKey: MessageKey;
  icon: string;
  iconActive: string;
}> = [
  { id: 'home', labelKey: 'tab.home', compactKey: 'tab.home', icon: 'grid-outline', iconActive: 'grid' },
  { id: 'students', labelKey: 'tab.students', compactKey: 'tab.students', icon: 'school-outline', iconActive: 'school' },
  { id: 'homeless', labelKey: 'tab.homeless', compactKey: 'tab.homeless', icon: 'bed-outline', iconActive: 'bed' },
  {
    id: 'disability',
    labelKey: 'tab.disability',
    compactKey: 'tab.disabilityShort',
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
  const { t } = useI18n();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing.sm), backgroundColor: colors.card, borderTopColor: colors.line },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const full = t(tab.labelKey);
        const shown = largePrint ? t(tab.compactKey) : full;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={full}
          >
            <Ionicons name={(isActive ? tab.iconActive : tab.icon) as never} size={24} color={isActive ? HEADER_PURPLE : colors.muted} />
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
