import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Header } from '../components/Header';
import { TrashZoneSelect } from '../components/TrashZoneSelect';
import { zoneById, type TrashZone } from '../data/trashZones';
import { call, open } from '../lib/actions';
import { useDenverNow } from '../lib/denverClock';
import { MAX_FONT, useLargePrint } from '../lib/fontScale';
import {
  DOW_LABEL,
  SERVICE_DAYS,
  actualPickupDow,
  formatYmd,
  fromDenverNow,
  holidayLastServiceWeek,
  holidayThisServiceWeek,
  isPickupDay,
  nextPickup,
  type ServiceDow,
  yardTrimmingsSeason,
} from '../lib/trashCalendar';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

const FOCO_DAY_KEY = 'foco-trash-day';
const FOCO_ZONE_KEY = 'foco-trash-zone';
const LOVELAND_DAY_KEY = 'foco-loveland-trash-day';
const RECYCLE_KEY = 'foco-loveland-recycle-this-week';

const LOOKUP = {
  foco: 'https://www.republicservices.com/schedule',
  guide: 'https://www.republicservices.com/cms/documents/municipality/Fort-Collins-CO/Fort-Collins-Service-Guide-2026.pdf',
  loveland: 'https://loveland.recollect.net',
  estes: 'https://www.wm.com/us/en/location/co/estes-park',
  berthoud: 'https://www.berthoud.org/1387/Trash-and-Utility-Providers',
  wellington: 'https://townofwellington.com/196/Utilities-Trash',
};

type Props = {
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  onBack: () => void;
};

export function TrashDayScreen({ area, onAreaChange, onBack }: Props) {
  const { colors } = useTheme();
  const largePrint = useLargePrint();
  const now = useDenverNow();
  const ymd = fromDenverNow(now);
  const [focoDay, setFocoDay] = useState<ServiceDow | null>(null);
  const [focoZoneId, setFocoZoneId] = useState<string | null>(null);
  const [lovelandDay, setLovelandDay] = useState<ServiceDow | null>(null);
  const [lovelandRecycle, setLovelandRecycle] = useState(true);

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(FOCO_DAY_KEY),
      AsyncStorage.getItem(FOCO_ZONE_KEY),
      AsyncStorage.getItem(LOVELAND_DAY_KEY),
      AsyncStorage.getItem(RECYCLE_KEY),
    ]).then(([daySaved, zoneSaved, lovelandSaved, recycleSaved]) => {
      const zone = zoneById(zoneSaved);
      if (zone) {
        setFocoZoneId(zone.id);
        setFocoDay(zone.dow);
      } else {
        const n = Number(daySaved);
        if (n >= 1 && n <= 5) setFocoDay(n as ServiceDow);
      }
      const ln = Number(lovelandSaved);
      if (ln >= 1 && ln <= 5) setLovelandDay(ln as ServiceDow);
      if (recycleSaved === 'no') setLovelandRecycle(false);
      if (recycleSaved === 'yes') setLovelandRecycle(true);
    });
  }, []);

  const town = area === 'All' ? 'Fort Collins' : area;
  const focoZone = town === 'Loveland' ? null : zoneById(focoZoneId);
  const regular = town === 'Loveland' ? lovelandDay : focoZone?.dow ?? focoDay;

  const saveDay = (day: ServiceDow) => {
    if (town === 'Loveland') {
      setLovelandDay(day);
      void AsyncStorage.setItem(LOVELAND_DAY_KEY, String(day));
    } else {
      setFocoDay(day);
      setFocoZoneId(null);
      void AsyncStorage.setItem(FOCO_DAY_KEY, String(day));
      void AsyncStorage.removeItem(FOCO_ZONE_KEY);
    }
  };

  const saveZone = (zone: TrashZone) => {
    setFocoZoneId(zone.id);
    setFocoDay(zone.dow);
    void AsyncStorage.setItem(FOCO_ZONE_KEY, zone.id);
    void AsyncStorage.setItem(FOCO_DAY_KEY, String(zone.dow));
  };

  const clearZone = () => {
    setFocoZoneId(null);
    void AsyncStorage.removeItem(FOCO_ZONE_KEY);
  };

  const saveRecycle = (on: boolean) => {
    setLovelandRecycle(on);
    void AsyncStorage.setItem(RECYCLE_KEY, on ? 'yes' : 'no');
  };

  const holiday = holidayThisServiceWeek(ymd);
  const lastHoliday = holidayLastServiceWeek(ymd);
  const pickup = regular ? nextPickup(regular, ymd) : null;
  const todayIs = regular ? isPickupDay(regular, ymd) : false;
  const delayed = regular ? actualPickupDow(regular, ymd) !== regular : false;
  const yard = yardTrimmingsSeason(ymd);

  const hero = useMemo(() => {
    if (!regular) return null;
    if (todayIs) {
      return {
        title: delayed ? 'Today — delayed' : 'Today is trash day',
        sub: delayed
          ? `${holiday?.name ?? 'Holiday'} bumped this week. Carts still go out today by 7am.`
          : focoZone
            ? `${focoZone.label}. Carts at the curb by 7am. Republic runs 7am-7pm.`
            : 'Carts at the curb by 7am. Republic runs 7am-7pm.',
      };
    }
    if (pickup) {
      return {
        title: `Next pickup: ${formatYmd(pickup.when)}`,
        sub: pickup.delayed
          ? `${pickup.holiday?.name ?? 'A holiday'} delays this week by one day.`
          : focoZone
            ? `${focoZone.label} usual day is ${DOW_LABEL[regular]}.`
            : `Usual day is ${DOW_LABEL[regular]}.`,
      };
    }
    return null;
  }, [regular, todayIs, delayed, holiday, pickup, focoZone]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title="Trash day" subtitle={`${now.weekdayLabel}, ${now.dateLabel} · ${now.timeLabel}`} />
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to resources">
          <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
          <Text style={[styles.backText, { color: colors.purple }]}>Resources</Text>
        </Pressable>
        <AreaFilter value={area} onChange={onAreaChange} />

        {town === 'Fort Collins' ? (
          <>
            <Text style={[styles.lede, { color: colors.body }]}>
              City-contracted homes use Republic Services. Pick your neighborhood — Highlander Heights is Friday on the
              2026 map. Trash and recycling go out the same day. Carts at the curb by 7am.
            </Text>
            <TrashZoneSelect value={focoZoneId} onChange={saveZone} onClear={clearZone} />
            {holiday ? (
              <Text style={[styles.note, { color: colors.body }]}>
                This week: {holiday.name} ({DOW_LABEL[holiday.dow]}) delays Republic collection one day for routes on
                and after that weekday. Friday routes run Saturday.
              </Text>
            ) : lastHoliday ? (
              <Text style={[styles.note, { color: colors.body }]}>
                Last week: {lastHoliday.name} delayed Republic one day. This week is back to the usual weekday for{' '}
                {focoZone ? focoZone.label : 'your area'}.
              </Text>
            ) : null}
            <Text style={[styles.section, { color: colors.ink }]}>Or pick the weekday</Text>
            <View style={styles.days}>
              {SERVICE_DAYS.map((d) => {
                const on = regular === d.id;
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => saveDay(d.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={d.label}
                    style={[
                      styles.day,
                      { backgroundColor: on ? HEADER_PURPLE : colors.card, borderColor: on ? HEADER_PURPLE : colors.line },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: on ? '#fff' : colors.ink }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
                      {largePrint ? d.label.slice(0, 3) : d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {hero ? (
              <View style={[styles.hero, { backgroundColor: todayIs ? HEADER_PURPLE : colors.card }]}>
                <Text style={[styles.heroTitle, { color: todayIs ? '#fff' : colors.ink }]}>{hero.title}</Text>
                <Text style={[styles.heroSub, { color: todayIs ? '#e9dffb' : colors.body }]}>{hero.sub}</Text>
              </View>
            ) : (
              <Text style={[styles.hint, { color: colors.muted }]}>
                Open the neighborhood list and tap Highlander Heights, or look up the address with Republic if you live
                on College Avenue.
              </Text>
            )}
            {regular ? (
              <View style={styles.checklist}>
                <Check line="Trash cart" on={todayIs} note={todayIs ? 'Out today' : 'Not today'} />
                <Check line="Recycling" on={todayIs} note="Same day as trash" />
                <Check
                  line="Yard trimmings"
                  on={todayIs && yard}
                  note={yard ? 'In season (Apr–Nov)' : 'Off-season (Dec–Mar)'}
                />
              </View>
            ) : null}
            <Text style={[styles.note, { color: colors.body }]}>
              Extra-small (35-gallon) trash carts are every other week. Recycling is still weekly. Call Republic if you
              are not sure which week. Two free bulky items a year — schedule at 970-416-2012. Door-to-door cart help
              if you cannot pull carts to the curb.
            </Text>
            <Action icon="call" label="Call Republic 970-416-2012" onPress={() => call('970-416-2012')} />
            <Action icon="globe-outline" label="Look up my address" onPress={() => open(LOOKUP.foco)} />
            <Action icon="map-outline" label="2026 collection map (PDF)" onPress={() => open(LOOKUP.guide)} />
            <Action
              icon="leaf-outline"
              label="What goes in which cart (city guide)"
              onPress={() => open('https://www.fortcollins.gov/Services/Trash-and-Recycling/Curbside-Trash-and-Recycling')}
            />
          </>
        ) : null}

        {town === 'Loveland' ? (
          <>
            <Text style={[styles.lede, { color: colors.body }]}>
              Loveland runs its own trash, recycling, and yard waste. Trash is weekly. Recycling is every other week on
              the same weekday. Use the city’s Recollect calendar if you do not know your day.
            </Text>
            <Text style={[styles.section, { color: colors.ink }]}>Usual trash day</Text>
            <View style={styles.days}>
              {SERVICE_DAYS.map((d) => {
                const on = regular === d.id;
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => saveDay(d.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={d.label}
                    style={[
                      styles.day,
                      { backgroundColor: on ? HEADER_PURPLE : colors.card, borderColor: on ? HEADER_PURPLE : colors.line },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: on ? '#fff' : colors.ink }]}>
                      {largePrint ? d.label.slice(0, 3) : d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {hero ? (
              <View style={[styles.hero, { backgroundColor: todayIs ? HEADER_PURPLE : colors.card }]}>
                <Text style={[styles.heroTitle, { color: todayIs ? '#fff' : colors.ink }]}>{hero.title}</Text>
                <Text style={[styles.heroSub, { color: todayIs ? '#e9dffb' : colors.body }]}>
                  City holiday calendars can differ from Fort Collins. Confirm on Recollect if a holiday is coming.
                </Text>
              </View>
            ) : null}
            <View style={[styles.toggleRow, { backgroundColor: colors.card }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.ink }]}>Recycling week</Text>
                <Text style={[styles.toggleSub, { color: colors.muted }]}>
                  {lovelandRecycle ? 'Put the recycle cart out with trash this week.' : 'Trash only this week.'}
                </Text>
              </View>
              <Switch value={lovelandRecycle} onValueChange={saveRecycle} />
            </View>
            <Action icon="call" label="Call Loveland Solid Waste 970-962-2529" onPress={() => call('970-962-2529')} />
            <Action icon="phone-portrait-outline" label="Loveland Recollect calendar" onPress={() => open(LOOKUP.loveland)} />
          </>
        ) : null}

        {town === 'Estes Park' ? (
          <>
            <Text style={[styles.lede, { color: colors.body }]}>
              Estes Park is not on the Fort Collins Republic contract. Residential routes are usually Waste Management.
              Look up the day in My WM or call.
            </Text>
            <Action icon="call" label="Call WM 1-866-849-0076" onPress={() => call('18668490076')} />
            <Action icon="globe-outline" label="WM Estes Park" onPress={() => open(LOOKUP.estes)} />
          </>
        ) : null}

        {town === 'Berthoud' ? (
          <>
            <Text style={[styles.lede, { color: colors.body }]}>
              Berthoud does not pick one hauler. The town licenses several companies, and some HOAs lock you to one.
              Ask your bill or the town list.
            </Text>
            <Action icon="call" label="Town of Berthoud 970-532-2643" onPress={() => call('970-532-2643')} />
            <Action icon="globe-outline" label="Licensed haulers" onPress={() => open(LOOKUP.berthoud)} />
            <Action icon="call" label="Mountain High Disposal 970-834-1144" onPress={() => call('970-834-1144')} />
          </>
        ) : null}

        {town === 'Wellington' ? (
          <>
            <Text style={[styles.lede, { color: colors.body }]}>
              Wellington lists private haulers. Your day is on your bill, not a town-wide map.
            </Text>
            <Action icon="call" label="Dumpster Diverz 970-888-7274" onPress={() => call('970-888-7274')} />
            <Action icon="call" label="Republic 970-484-5556" onPress={() => call('970-484-5556')} />
            <Action icon="call" label="Waste Management 970-482-6319" onPress={() => call('970-482-6319')} />
            <Action icon="globe-outline" label="Town utilities & trash list" onPress={() => open(LOOKUP.wellington)} />
          </>
        ) : null}

        {area === 'All' ? (
          <Text style={[styles.note, { color: colors.muted }]}>
            Showing {areaLabel('Fort Collins')} rules when All of Larimer is selected. Pick a town chip for Loveland,
            Estes Park, Berthoud, or Wellington.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Check({ line, on, note }: { line: string; on: boolean; note: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.check, { backgroundColor: colors.card }]}>
      <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? colors.green : colors.muted} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.checkLine, { color: colors.ink }]}>{line}</Text>
        <Text style={[styles.checkNote, { color: colors.muted }]}>{note}</Text>
      </View>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.action, { borderColor: HEADER_PURPLE, backgroundColor: colors.card }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon as never} size={20} color={HEADER_PURPLE} />
      <Text style={[styles.actionText, { color: colors.purple }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingBottom: spacing.xxl, gap: spacing.lg },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backText: { fontWeight: '700', fontSize: 16 },
  lede: { paddingHorizontal: spacing.lg, fontSize: 16, lineHeight: 23 },
  section: { paddingHorizontal: spacing.lg, fontSize: 18, fontWeight: '800' },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg },
  day: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 10 },
  dayText: { fontWeight: '700', fontSize: 14 },
  hero: { marginHorizontal: spacing.lg, borderRadius: radius.lg, padding: spacing.lg, gap: 6 },
  heroTitle: { fontSize: 22, fontWeight: '800' },
  heroSub: { fontSize: 15, lineHeight: 22 },
  hint: { paddingHorizontal: spacing.lg, fontSize: 15, lineHeight: 22 },
  checklist: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  check: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  checkLine: { fontSize: 16, fontWeight: '700' },
  checkNote: { fontSize: 13, marginTop: 2 },
  note: { paddingHorizontal: spacing.lg, fontSize: 14, lineHeight: 21 },
  action: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderRadius: radius.lg,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: { fontWeight: '800', fontSize: 16, flex: 1 },
  toggleRow: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleLabel: { fontSize: 16, fontWeight: '800' },
  toggleSub: { fontSize: 13, marginTop: 4 },
});
