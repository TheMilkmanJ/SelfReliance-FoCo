import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FOCO_TRASH_ZONES, ZONE_DOW_ORDER, zoneDayLabel, type TrashZone, zonesForDow } from '../data/trashZones';
import { DOW_LABEL, type ServiceDow } from '../lib/trashCalendar';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

type Props = {
  value: string | null;
  onChange: (zone: TrashZone) => void;
  onClear: () => void;
};

export function TrashZoneSelect({ value, onChange, onClear }: Props) {
  const { colors } = useTheme();
  const selected = FOCO_TRASH_ZONES.find((z) => z.id === value) ?? null;
  const [open, setOpen] = useState(!selected);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
        Neighborhood
      </Text>
      <Pressable
        onPress={() => setOpen((was) => !was)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={
          selected
            ? `Neighborhood ${zoneDayLabel(selected)}. Tap to change.`
            : 'Choose a Fort Collins neighborhood for trash day'
        }
        style={[
          styles.bar,
          { backgroundColor: colors.card, borderColor: selected ? HEADER_PURPLE : colors.line },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.barTitle, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
            {selected ? selected.label : 'Choose your area'}
          </Text>
          <Text style={[styles.barSub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
            {selected ? `${DOW_LABEL[selected.dow]} pickup · ${selected.where}` : 'Highlander Heights is on this list'}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={HEADER_PURPLE} />
      </Pressable>

      {open ? (
        <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.line }]}>
          {ZONE_DOW_ORDER.map((dow) => (
            <DowGroup
              key={dow}
              dow={dow}
              selectedId={value}
              onPick={(zone) => {
                onChange(zone);
                setOpen(false);
              }}
            />
          ))}
          {selected ? (
            <Pressable
              onPress={() => {
                onClear();
                setOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear neighborhood"
              style={styles.clear}
            >
              <Text style={[styles.clearText, { color: colors.purple }]}>Clear neighborhood</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function DowGroup({
  dow,
  selectedId,
  onPick,
}: {
  dow: ServiceDow;
  selectedId: string | null;
  onPick: (zone: TrashZone) => void;
}) {
  const { colors } = useTheme();
  const rows = zonesForDow(dow);
  if (rows.length === 0) return null;
  return (
    <View>
      <Text style={[styles.group, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
        {DOW_LABEL[dow]}
      </Text>
      {rows.map((zone) => {
        const on = zone.id === selectedId;
        return (
          <Pressable
            key={zone.id}
            onPress={() => onPick(zone)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${zone.label}, ${DOW_LABEL[zone.dow]} trash day. ${zone.where}`}
            style={[styles.row, on && { backgroundColor: `${HEADER_PURPLE}14` }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: on ? HEADER_PURPLE : colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
                {zone.label}
              </Text>
              <Text style={[styles.rowSub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
                {zone.where}
              </Text>
            </View>
            {on ? <Ionicons name="checkmark" size={20} color={HEADER_PURPLE} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  section: { paddingHorizontal: spacing.lg, fontSize: 18, fontWeight: '800' },
  bar: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderRadius: radius.lg,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barTitle: { fontSize: 17, fontWeight: '800' },
  barSub: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  menu: {
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  group: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 4,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
  },
  rowTitle: { fontSize: 16, fontWeight: '800' },
  rowSub: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  clear: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  clearText: { fontWeight: '700', fontSize: 15 },
});
