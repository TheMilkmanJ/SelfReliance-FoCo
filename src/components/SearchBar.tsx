import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MAX_FONT, useLargePrint } from '../lib/fontScale';
import { radius, spacing, useTheme } from '../theme';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder }: Props) {
  const { colors } = useTheme();
  const largePrint = useLargePrint();
  const hint = placeholder ?? (largePrint ? 'Search' : 'Search by need, name, or town');
  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <Ionicons name="search" size={20} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={hint}
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.ink }]}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search resources"
        maxFontSizeMultiplier={MAX_FONT.chrome}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={20} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 50,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 0, minWidth: 0 },
});
