import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { HEADER_PURPLE, radius, useTheme } from '../theme';

type Props = {
  label: string;
  icon?: string;
  active: boolean;
  onPress: () => void;
  small?: boolean;
  accessibilityLabel?: string;
};

export function Chip({ label, icon, active, onPress, small, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        small && styles.chipSmall,
        { backgroundColor: active ? HEADER_PURPLE : colors.card, borderColor: active ? HEADER_PURPLE : colors.line },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {icon ? <Ionicons name={icon as never} size={15} color={active ? '#fff' : colors.purple} /> : null}
      <Text style={[styles.chipText, small && styles.chipTextSmall, { color: active ? '#fff' : colors.purpleDark }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipSmall: { paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontWeight: '700', fontSize: 14 },
  chipTextSmall: { fontSize: 13 },
});
