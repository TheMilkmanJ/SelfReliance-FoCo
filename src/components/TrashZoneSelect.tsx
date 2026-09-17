import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  TOWN_ORDER,
  TRASH_REGIONS,
  ZONE_DOW_ORDER,
  regionById,
  regionsForTown,
  zoneDayLabel,
  type TrashRegion,
  type TrashTown,
} from '../data/trashZones';
import { DOW_LABEL, type ServiceDow } from '../lib/trashCalendar';
import { MAX_FONT } from '../lib/fontScale';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

type Props = {
  value: string | null;
  focusTown: TrashTown | null;
  onChange: (region: TrashRegion) => void;
  onClear: () => void;
};

export function TrashZoneSelect({ value, focusTown, onChange, onClear }: Props) {
  const { colors } = useTheme();
  const selected = regionById(value);
  const [open, setOpen] = useState(!selected);

  const towns = useMemo(() => {
    if (!focusTown) return TOWN_ORDER;
    return [focusTown, ...TOWN_ORDER.filter((t) => t !== focusTown)];
  }, [focusTown]);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
        Trash day region
      </Text>
      <Pressable
        onPress={() => setOpen((was) => !was)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={
          selected
            ? `Region ${zoneDayLabel(selected)}. Tap to change.`
            : 'Choose a Larimer County trash day region'
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
            {selected
              ? selected.dow
                ? `${selected.town} · ${DOW_LABEL[selected.dow]} pickup`
                : `${selected.town} · ${selected.hauler}`
              : 'Fort Collins, Loveland, Estes Park, Berthoud, Wellington, and unincorporated'}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={HEADER_PURPLE} />
      </Pressable>

      {open ? (
        <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.line }]}>
          {towns.map((town) => (
            <TownGroup
              key={town}
              town={town}
              selectedId={value}
              onPick={(region) => {
                onChange(region);
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
              accessibilityLabel="Clear region"
              style={styles.clear}
            >
              <Text style={[styles.clearText, { color: colors.purple }]}>Clear region</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function TownGroup({
  town,
  selectedId,
  onPick,
}: {
  town: TrashTown;
  selectedId: string | null;
  onPick: (region: TrashRegion) => void;
}) {
  const { colors } = useTheme();
  const rows = regionsForTown(town);
  if (rows.length === 0) return null;

  const focoByDow = town === 'Fort Collins';

  return (
    <View>
      <Text style={[styles.town, { color: HEADER_PURPLE, borderBottomColor: colors.line }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
        {town === 'Unincorporated' ? 'Unincorporated Larimer' : town}
      </Text>
      {focoByDow
        ? ZONE_DOW_ORDER.map((dow) => (
            <DowGroup key={`${town}-${dow}`} dow={dow} selectedId={selectedId} onPick={onPick} />
          ))
        : rows.map((region) => (
            <RegionRow key={region.id} region={region} selectedId={selectedId} onPick={onPick} />
          ))}
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
  onPick: (region: TrashRegion) => void;
}) {
  const { colors } = useTheme();
  const rows = TRASH_REGIONS.filter((z) => z.town === 'Fort Collins' && z.dow === dow);
  if (rows.length === 0) return null;
  return (
    <View>
      <Text style={[styles.group, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
        {DOW_LABEL[dow]}
      </Text>
      {rows.map((region) => (
        <RegionRow key={region.id} region={region} selectedId={selectedId} onPick={onPick} />
      ))}
    </View>
  );
}

function RegionRow({
  region,
  selectedId,
  onPick,
}: {
  region: TrashRegion;
  selectedId: string | null;
  onPick: (region: TrashRegion) => void;
}) {
  const { colors } = useTheme();
  const on = region.id === selectedId;
  const day = region.dow ? `${DOW_LABEL[region.dow]} · ` : '';
  return (
    <Pressable
      onPress={() => onPick(region)}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${region.label}, ${region.town}. ${region.where}`}
      style={[styles.row, on && { backgroundColor: `${HEADER_PURPLE}14` }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: on ? HEADER_PURPLE : colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
          {region.label}
        </Text>
        <Text style={[styles.rowSub, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
          {day}
          {region.where}
        </Text>
      </View>
      {on ? <Ionicons name="checkmark" size={20} color={HEADER_PURPLE} /> : null}
    </Pressable>
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
  town: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    borderBottomWidth: StyleSheet.hairlineWidth,
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
