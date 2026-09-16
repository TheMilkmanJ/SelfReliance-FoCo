import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Header } from '../components/Header';
import { call, open } from '../lib/actions';
import { useDenverNow } from '../lib/denverClock';
import { MAX_FONT, useLargePrint } from '../lib/fontScale';
import {
  DOW_LABEL,
  SERVICE_DAYS,
  actualPickupDow,
  formatYmd,
  fromDenverNow,
  holidayThisServiceWeek,
  isPickupDay,
  nextPickup,
  type ServiceDow,
  yardTrimmingsSeason,
} from '../lib/trashCalendar';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import { HEADER_PURPLE, radius, spacing, useTheme } from '../theme';

const FOCO_DAY_KEY = 'foco-trash-day';
const LOVELAND_DAY_KEY = 'foco-loveland-trash-day';
const RECYCLE_KEY = 'foco-loveland-recycle-this-week';

const LOOKUP = {
  foco: 'https://www.republicservices.com/municipality/fort-collins-co',
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
  const [lovelandDay, setLovelandDay] = useState<ServiceDow | null>(null);
  const [lovelandRecycle, setLovelandRecycle] = useState(true);

  useEffect(() => {
    const readDay = (key: string, set: (d: ServiceDow) => void) => {
      void AsyncStorage.getItem(key).then((saved) => {
        const n = Number(saved);
        if (n >= 1 && n <= 5) set(n as ServiceDow);
      });
    };
    readDay(FOCO_DAY_KEY, setFocoDay);
    readDay(LOVELAND_DAY_KEY, setLovelandDay);
    void AsyncStorage.getItem(RECYCLE_KEY).then((saved) => {
      if (saved === 'no') setLovelandRecycle(false);
      if (saved === 'yes') setLovelandRecycle(true);
    });
  }, []);

  const town = area === 'All' ? 'Fort Collins' : area;
  const regular = town === 'Loveland' ? lovelandDay : focoDay;

  const saveDay = (day: ServiceDow) => {
    if (town === 'Loveland') {
      setLovelandDay(day);
      void AsyncStorage.setItem(LOVELAND_DAY_KEY, String(day));
    } else {
      setFocoDay(day);
      void AsyncStorage.setItem(FOCO_DAY_KEY, String(day));
    }
  };

  const saveRecycle = (on: boolean) => {
    setLovelandRecycle(on);
    void AsyncStorage.setItem(RECYCLE_KEY, on ? 'yes' : 'no');
  };

  const holiday = holidayThisServiceWeek(ymd);
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
          : 'Carts at the curb by 7am. Republic runs 7am-7pm.',
      };
    }
    if (pickup) {
      return {
        title: `Next pickup: ${formatYmd(pickup.when)}`,
        sub: pickup.delayed
          ? `${pickup.holiday?.name ?? 'A holiday'} delays this week by one day.`
          : `Usual day is ${DOW_LABEL[regular]}.`,
      };
    }
    return null;
  }, [regular, todayIs, delayed, holiday, pickup]);

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
              City-contracted homes use Republic Services. Trash and recycling go out the same day. Yard trimmings
              April–November. This app cannot read Republic’s address map — pick your usual weekday once and it will
              tell you if a holiday moved it.
            </Text>
            {holiday ? (
              <Text style={[styles.note, { color: colors.body }]}>
                This week: {holiday.name} ({DOW_LABEL[holiday.dow]}) delays Republic collection one day for routes on
                and after that weekday. Friday routes run Saturday.
              </Text>
            ) : null}
            <Text style={[styles.section, { color: colors.ink }]}>Usual collection day</Text>
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
                Don’t know the day? Look it up with Republic or call 970-416-2012, then tap it here.
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
