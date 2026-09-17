import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CERT_GROUP_MAP } from '../data/certGroups';
import { CATEGORY_MAP } from '../data/categories';
import { isFreeCertificate } from '../data/resources';
import type { Resource } from '../data/types';
import { areaMessage, catKey, certKey, useI18n } from '../i18n';
import { call } from '../lib/actions';
import { cardShadow, radius, spacing, useTheme } from '../theme';
import { FreeBadge } from './FreeBadge';

type Props = {
  resource: Resource;
  onPress: (resource: Resource) => void;
  showCategory?: boolean;
};

export function ResourceCard({ resource, onPress, showCategory = true }: Props) {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const cat = CATEGORY_MAP[resource.category];
  const freeCert = isFreeCertificate(resource);
  const area = t(areaMessage(resource.area));
  const certLine = resource.certGroup
    ? t(freeCert ? 'card.freeCertLine' : 'card.certLine', {
        short: t(certKey(resource.certGroup, 'short')),
        area,
      })
    : `${showCategory ? `${t(catKey(resource.category, 'short'))} · ` : ''}${area}`;
  const a11yExtra = freeCert ? t('card.freeCertA11y') : '';
  return (
    <View style={[styles.card, { backgroundColor: colors.card }, cardShadow(isDark)]}>
      <Pressable
        onPress={() => onPress(resource)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${resource.name}${a11yExtra ? `. ${a11yExtra}` : ''}. ${resource.description}`}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${cat.color}1a` }]}>
          <Ionicons name={cat.icon as never} size={22} color={cat.color} />
        </View>
        <View style={styles.body}>
          <View style={styles.headline}>
            <Text style={[styles.name, { color: colors.ink }]}>{resource.name}</Text>
            {freeCert ? <FreeBadge /> : null}
          </View>
          <Text style={[styles.meta, { color: colors.muted }]}>{certLine}</Text>
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
          accessibilityLabel={t('card.callA11y', { name: resource.name, phone: resource.phone })}
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
  headline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
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
