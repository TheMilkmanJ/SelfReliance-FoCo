import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORY_MAP } from '../data/categories';
import type { Resource } from '../data/types';
import { call, directions, open, prettyUrl } from '../lib/actions';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

type Props = {
  resource: Resource | null;
  onClose: () => void;
};

export function ResourceDetail({ resource, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  if (!resource) return null;
  const cat = CATEGORY_MAP[resource.category];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={[styles.sheet, { paddingTop: Math.max(insets.top, spacing.md), backgroundColor: colors.bg }]}>
        <View style={styles.topBar}>
          <View style={[styles.pill, { backgroundColor: `${cat.color}1a` }]}>
            <Ionicons name={cat.icon as never} size={16} color={cat.color} />
            <Text style={[styles.pillText, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={28} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
          <Text style={[styles.name, { color: colors.ink }]}>{resource.name}</Text>
          <Text style={[styles.area, { color: colors.muted }]}>{resource.area}</Text>
          <Text style={[styles.desc, { color: colors.body }]}>{resource.description}</Text>

          {resource.hours ? (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.muted} />
              <Text style={[styles.infoText, { color: colors.body }]}>{resource.hours}</Text>
            </View>
          ) : null}
          {resource.address ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.muted} />
              <Text style={[styles.infoText, { color: colors.body }]}>{resource.address}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {resource.phone ? (
              <ActionButton
                icon="call"
                label={`Call ${resource.phone}`}
                color={colors.green}
                onPress={() => call(resource.phone as string)}
              />
            ) : null}
            {resource.url ? (
              <ActionButton
                icon="globe-outline"
                label={prettyUrl(resource.url)}
                color={HEADER_PURPLE}
                onPress={() => open(resource.url as string)}
              />
            ) : null}
            {resource.address ? (
              <ActionButton
                icon="navigate-outline"
                label="Get directions"
                color={colors.actionInk}
                onPress={() => directions(resource.address as string)}
              />
            ) : null}
          </View>

          {resource.tags.length ? (
            <View style={styles.tags}>
              {resource.tags.map((t) => (
                <View key={t} style={[styles.tag, { backgroundColor: colors.purpleLight }]}>
                  <Text style={[styles.tagText, { color: colors.purpleDark }]}>{t}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={[styles.footnote, { color: colors.muted }]}>
            Details change. If a number or hours look wrong, call 2-1-1 for the latest, or tell us on the app's
            GitHub page.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, { backgroundColor: color }, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon as never} size={20} color="#fff" />
      <Text style={styles.actionText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pillText: { fontWeight: '700', fontSize: 13 },
  content: { paddingHorizontal: spacing.lg },
  name: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  area: { fontSize: 15, marginTop: 4, marginBottom: spacing.lg },
  desc: { fontSize: 17, lineHeight: 25, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: spacing.md },
  infoText: { flex: 1, fontSize: 16, lineHeight: 22 },
  actions: { gap: spacing.md, marginTop: spacing.md },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  actionText: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.xl },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  tagText: { fontSize: 13, fontWeight: '600' },
  footnote: { marginTop: spacing.xl, fontSize: 13, lineHeight: 19 },
});
