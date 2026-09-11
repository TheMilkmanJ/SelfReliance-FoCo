import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_MAP } from '../data/categories';
import type { Resource } from '../data/types';
import { call } from '../lib/actions';
import { cardShadow, radius, spacing, useTheme } from '../theme';

type Props = {
  resource: Resource;
  onPress: (resource: Resource) => void;
  showCategory?: boolean;
};

export function ResourceCard({ resource, onPress, showCategory = true }: Props) {
  const { colors, isDark } = useTheme();
  const cat = CATEGORY_MAP[resource.category];
  return (
    <View style={[styles.card, { backgroundColor: colors.card }, cardShadow(isDark)]}>
      <Pressable
        onPress={() => onPress(resource)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${resource.name}. ${resource.description}`}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${cat.color}1a` }]}>
          <Ionicons name={cat.icon as never} size={22} color={cat.color} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.name, { color: colors.ink }]}>{resource.name}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>
            {showCategory ? `${cat.short} · ` : ''}
            {resource.area}
          </Text>
          <Text style={[styles.desc, { color: colors.body }]} numberOfLines={3}>
            {resource.description}
          </Text>
        </View>
      </Pressable>
      {resource.phone ? (
        <Pressable
          onPress={() => call(resource.phone as string)}
          style={({ pressed }) => [styles.callBtn, { backgroundColor: colors.green }, pressed && styles.callPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Call ${resource.name} at ${resource.phone}`}
          hitSlop={8}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.callText}>{resource.phone}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  meta: { fontSize: 13, marginTop: 2, marginBottom: 6 },
  desc: { fontSize: 15, lineHeight: 21 },
  callBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  callPressed: { opacity: 0.8 },
  callText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
