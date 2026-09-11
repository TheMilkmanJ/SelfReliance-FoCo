import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { call } from '../lib/actions';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

export function QuickHelp() {
  const { colors } = useTheme();
  const lines = [
    { label: '2-1-1', sub: 'Any kind of help', number: '211', color: HEADER_PURPLE },
    { label: '9-8-8', sub: 'Crisis line, 24/7', number: '988', color: colors.red },
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
          accessibilityLabel={`Call ${l.label}, ${l.sub}`}
        >
          <Ionicons name="call" size={18} color={l.color} />
          <View>
            <Text style={[styles.label, { color: l.color }]}>{l.label}</Text>
            <Text style={[styles.sub, { color: colors.muted }]}>{l.sub}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  label: { fontSize: 17, fontWeight: '800' },
  sub: { fontSize: 12 },
});
