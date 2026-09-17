import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AreaFilter, areaLabel } from '../components/AreaFilter';
import { Header } from '../components/Header';
import { TrashZoneSelect } from '../components/TrashZoneSelect';
import {
  DAY_STORAGE_KEY,
  areaFromTown,
  regionById,
  townFromArea,
  type RecyclingKind,
  type TrashRegion,
  type TrashTown,
  type YardKind,
} from '../data/trashZones';
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
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

const REGION_KEY = 'foco-trash-region';
const FOCO_ZONE_KEY = 'foco-trash-zone';
const RECYCLE_KEY = 'foco-loveland-recycle-this-week';

const LOOKUP = {
  foco: 'https://www.republicservices.com/schedule',
  guide: 'https://www.republicservices.com/cms/documents/municipality/Fort-Collins-CO/Fort-Collins-Service-Guide-2026.pdf',
  focoCarts: 'https://www.fortcollins.gov/Services/Trash-and-Recycling/Curbside-Trash-and-Recycling',
  loveland: 'https://loveland.recollect.net',
  estes: 'https://www.wm.com/us/en/location/co/estes-park',
  berthoud: 'https://www.berthoud.org/1387/Trash-and-Utility-Providers',
  wellington: 'https://townofwellington.com/196/Utilities-Trash',
  landfill: 'https://www.larimer.gov/solidwaste/landfill',
};

type Props = {
  area: AreaFilterId;
  onAreaChange: (area: AreaFilterId) => void;
  onBack: () => void;
};

type DayMap = Partial<Record<TrashTown, ServiceDow>>;

export function TrashDayScreen({ area, onAreaChange, onBack }: Props) {
  const { colors, isDark } = useTheme();
  const largePrint = useLargePrint();
  const now = useDenverNow();
  const ymd = fromDenverNow(now);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [days, setDays] = useState<DayMap>({});
  const [lovelandRecycle, setLovelandRecycle] = useState(true);

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(REGION_KEY),
      AsyncStorage.getItem(FOCO_ZONE_KEY),
      AsyncStorage.getItem(RECYCLE_KEY),
      ...Object.values(DAY_STORAGE_KEY).map((key) => AsyncStorage.getItem(key)),
    ]).then(([regionSaved, zoneSaved, recycleSaved, ...daySaved]) => {
      const region = regionById(regionSaved) ?? regionById(zoneSaved);
      if (region) {
        setRegionId(region.id);
        if (regionSaved !== region.id || zoneSaved !== region.id) {
          void AsyncStorage.setItem(REGION_KEY, region.id);
          void AsyncStorage.setItem(FOCO_ZONE_KEY, region.id);
        }
      }
      const next: DayMap = {};
      (Object.keys(DAY_STORAGE_KEY) as TrashTown[]).forEach((town, i) => {
        const n = Number(daySaved[i]);
        if (n >= 1 && n <= 5) next[town] = n as ServiceDow;
      });
      if (region?.dow) next[region.town] = region.dow;
      setDays(next);
      if (recycleSaved === 'no') setLovelandRecycle(false);
      if (recycleSaved === 'yes') setLovelandRecycle(true);
    });
  }, []);

  const savedRegion = regionById(regionId);
  const chipTown = townFromArea(area);
  const region = savedRegion && (!chipTown || savedRegion.town === chipTown) ? savedRegion : null;
  const town: TrashTown = region?.town ?? chipTown ?? 'Fort Collins';
  const regular = region?.dow ?? days[town] ?? null;
  const focusTown = chipTown;

  const saveDay = (day: ServiceDow) => {
    setDays((prev) => ({ ...prev, [town]: day }));
    void AsyncStorage.setItem(DAY_STORAGE_KEY[town], String(day));
    if (region?.dow && region.dow !== day) {
      setRegionId(null);
      void AsyncStorage.removeItem(REGION_KEY);
      void AsyncStorage.removeItem(FOCO_ZONE_KEY);
    }
  };

  const saveRegion = (next: TrashRegion) => {
    setRegionId(next.id);
    void AsyncStorage.setItem(REGION_KEY, next.id);
    void AsyncStorage.setItem(FOCO_ZONE_KEY, next.id);
    if (next.dow) {
      setDays((prev) => ({ ...prev, [next.town]: next.dow as ServiceDow }));
      void AsyncStorage.setItem(DAY_STORAGE_KEY[next.town], String(next.dow));
    }
    const chip = areaFromTown(next.town);
    if (chip !== area) onAreaChange(chip);
  };

  const clearRegion = () => {
    setRegionId(null);
    void AsyncStorage.removeItem(REGION_KEY);
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
  const yard = yardTrimmingsSeason(ymd, town);
  const republicHoliday = town === 'Fort Collins';
  const place = region ? region.label : town === 'Unincorporated' ? 'Unincorporated Larimer' : town;

  const hero = useMemo(() => {
    if (!regular) return null;
    if (todayIs) {
      return {
        title: delayed ? 'Today — delayed' : 'Today is trash day',
        sub: delayed
          ? `${holiday?.name ?? 'Holiday'} bumped this week. Carts still go out today${region?.cartsBy ? ` by ${region.cartsBy}` : ''}.`
          : `${place}. Carts at the curb${region?.cartsBy ? ` by ${region.cartsBy}` : ''}.`,
      };
    }
    if (pickup) {
      return {
        title: `Next pickup: ${formatYmd(pickup.when)}`,
        sub: pickup.delayed
          ? `${pickup.holiday?.name ?? 'A holiday'} delays this week by one day.`
          : `${place} — usual day is ${DOW_LABEL[regular]}.`,
      };
    }
    return null;
  }, [regular, todayIs, delayed, holiday, pickup, region, place]);

  const service = serviceCopy(town, region, todayIs, yard, lovelandRecycle, regular, place);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header title="Trash day" subtitle={`${now.weekdayLabel}, ${now.dateLabel} · ${now.timeLabel}`} />
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to resources">
          <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
          <Text style={[styles.backText, { color: colors.purple }]}>Resources</Text>
        </Pressable>
        <AreaFilter value={area} onChange={onAreaChange} />

        <Text style={[styles.lede, { color: colors.body }]}>{ledeFor(town, region)}</Text>

        <TrashZoneSelect value={region?.id ?? null} focusTown={focusTown} onChange={saveRegion} onClear={clearRegion} />

        {republicHoliday && holiday ? (
          <Text style={[styles.note, { color: colors.body }]}>
            This week: {holiday.name} ({DOW_LABEL[holiday.dow]}) delays Republic collection one day for Fort Collins
            routes on and after that weekday. Friday routes run Saturday.
          </Text>
        ) : republicHoliday && lastHoliday ? (
          <Text style={[styles.note, { color: colors.body }]}>
            Last week: {lastHoliday.name} delayed Republic one day. This week is back to the usual weekday for{' '}
            {region ? region.label : 'your area'}.
          </Text>
        ) : null}

        {region?.id === 'uninc-landfill' ? null : (
          <>
            <Text style={[styles.section, { color: colors.ink }]}>
              {region?.dow ? 'Or pick the weekday' : 'Usual trash day'}
            </Text>
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
          </>
        )}

        {hero ? (
          <View style={[styles.hero, { backgroundColor: todayIs ? HEADER_PURPLE : colors.card }]}>
            <Text style={[styles.heroTitle, { color: todayIs ? '#fff' : colors.ink }]}>{hero.title}</Text>
            <Text style={[styles.heroSub, { color: todayIs ? '#e9dffb' : colors.body }]}>{hero.sub}</Text>
          </View>
        ) : region?.id === 'uninc-landfill' ? (
          <View style={[styles.hero, { backgroundColor: colors.card }]}>
            <Text style={[styles.heroTitle, { color: colors.ink }]}>No curbside county route</Text>
            <Text style={[styles.heroSub, { color: colors.body }]}>
              Unincorporated Larimer does not pick a trash day. Haul it yourself or hire a private company.
            </Text>
          </View>
        ) : (
          <Text style={[styles.hint, { color: colors.muted }]}>
            Open the region list — Highlander Heights, Centerra, Old Town Wellington, and the other towns are in there.
            Or pick the weekday you already know.
          </Text>
        )}

        <Text style={[styles.section, { color: colors.ink }]}>What goes out</Text>
        <View>
          {service.map((row) => (
            <ServiceRow key={row.title} {...row} />
          ))}
          {town === 'Loveland' && region?.id !== 'uninc-landfill' ? (
            <View style={[styles.listing, { backgroundColor: colors.card }, cardShadow(isDark)]}>
              <View style={styles.listingRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
                  <Ionicons name="reload-outline" size={22} color={HEADER_PURPLE} />
                </View>
                <View style={styles.listingBody}>
                  <View style={styles.listingHead}>
                    <Text style={[styles.listingName, { color: colors.ink }]}>Recycling week</Text>
                    <Switch value={lovelandRecycle} onValueChange={saveRecycle} />
                  </View>
                  <Text style={[styles.listingMeta, { color: colors.muted }]}>
                    {lovelandRecycle ? 'This week · Loveland' : 'Skip this week · Loveland'}
                  </Text>
                  <Text style={[styles.listingDesc, { color: colors.body }]}>
                    {lovelandRecycle
                      ? 'Put the recycle cart out with trash this week.'
                      : 'Trash only this week. Recycle next week.'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <Text style={[styles.note, { color: colors.body }]}>{footnoteFor(town, region)}</Text>

        {actionsFor(town, region).map((row) => (
          <Action key={row.label} icon={row.icon} label={row.label} onPress={row.onPress} />
        ))}

        {area === 'All' && !region ? (
          <Text style={[styles.note, { color: colors.muted }]}>
            Showing {areaLabel('Fort Collins')} city-contract rules when All of Larimer is selected and no region is
            picked. The dropdown lists Loveland, Estes Park, Berthoud, Wellington, and unincorporated too.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ledeFor(town: TrashTown, region: TrashRegion | null): string {
  if (region?.town === 'Unincorporated' && region.id === 'uninc-landfill') {
    return 'Larimer County does not run curbside pickup outside city limits. Self-haul to the landfill on South Taft Hill, or hire a licensed hauler.';
  }
  if (town === 'Fort Collins') {
    return 'City-contracted homes use Republic Services. Pick a Fort Collins neighborhood — Highlander Heights is Friday on the 2026 map — or scroll the same list for Loveland, Estes Park, Berthoud, Wellington, and unincorporated Larimer.';
  }
  if (town === 'Loveland') {
    return 'Loveland runs its own trash, recycling, and yard waste. Trash is weekly. Recycling is every other week on the same weekday. Recollect has the house-level day if you are not sure.';
  }
  if (town === 'Estes Park') {
    return 'Estes Park is not on the Fort Collins Republic contract. Residential routes are usually Waste Management or Superior Trash (Atlas Unlimited). Day is on your bill.';
  }
  if (town === 'Berthoud') {
    return 'Berthoud does not pick one hauler. The town licenses several companies, and some HOAs lock you to one. Pick the company on your bill.';
  }
  if (town === 'Wellington') {
    return 'Wellington lists private haulers. Your day is on your bill, not a town-wide map. Dumpster Diverz says most Wellington addresses are Tuesday or Friday.';
  }
  return 'Unincorporated Larimer has no county curbside route. Hire a hauler or take it to the landfill yourself.';
}

function footnoteFor(town: TrashTown, region: TrashRegion | null): string {
  if (region?.id === 'uninc-landfill') {
    return 'Landfill hours are Monday–Saturday. Call the 24-hour line 970-498-5770 for wind closures. Main office 970-498-5760.';
  }
  if (town === 'Fort Collins') {
    return 'Extra-small (35-gallon) trash carts are every other week. Recycling is still weekly. Call Republic if you are not sure which week. Two free bulky items a year — schedule at 970-416-2012. Door-to-door cart help if you cannot pull carts to the curb.';
  }
  if (town === 'Loveland') {
    return 'Yard waste carts run about March 30–December 4 (2026 dates). Winter months are trash and recycling only. Extra bags next to the cart are billed on the utility statement. Solid Waste 970-962-2529.';
  }
  if (town === 'Estes Park') {
    return 'WM: look up the day in My WM or call 1-866-849-0076. Superior Trash / Atlas Unlimited: 970-214-4902. Bags and carts out by 7am.';
  }
  if (town === 'Berthoud') {
    return 'Ask the town at 970-532-2643 if you are not sure who is licensed for your street. Some metro districts only allow one company.';
  }
  if (town === 'Wellington') {
    return 'Town list: Dumpster Diverz 970-888-7274, Republic 970-484-5556, Waste Management 970-482-6319. Recycling is usually extra and every other week.';
  }
  return 'Atlas Unlimited covers a lot of north county (Red Feather, Livermore, Laporte, Bellvue). Republic and WM also take some rural addresses.';
}

function recyclingNote(kind: RecyclingKind, lovelandRecycle: boolean, town: TrashTown): string {
  if (kind === 'none') return 'No curbside recycling on a county landfill trip — use the recycle drop-off on site.';
  if (kind === 'ask') return 'Ask your hauler if recycling is the same day.';
  if (kind === 'every-other' && town === 'Loveland') {
    return lovelandRecycle ? 'Every other week — this is a recycle week.' : 'Every other week — skip the recycle cart this week.';
  }
  if (kind === 'every-other') return 'Usually every other week on trash day. Confirm on your bill.';
  return 'Same day as trash · weekly';
}

function yardNote(kind: YardKind, yard: boolean, town: TrashTown): string {
  if (kind === 'none') return 'Yard debris can go with a landfill load if it meets county rules.';
  if (kind === 'ask') return 'Ask your hauler. Not every route has a yard cart.';
  if (kind === 'in-trash') return 'Dumpster Diverz takes grass, leaves, and small branches in the trash cart. No separate yard route.';
  if (town === 'Loveland') {
    return yard ? 'In season (about Mar 30–Dec 4) · same weekday as trash' : 'Off-season — city yard carts pause in winter';
  }
  return yard ? 'In season (Apr–Nov) · same day as trash' : 'Off-season (Dec–Mar)';
}

function serviceCopy(
  town: TrashTown,
  region: TrashRegion | null,
  todayIs: boolean,
  yard: boolean,
  lovelandRecycle: boolean,
  regular: ServiceDow | null,
  place: string,
): Array<{ icon: string; title: string; note: string; status: string; place: string }> {
  const recycling = region?.recycling ?? (town === 'Fort Collins' ? 'same-day-weekly' : town === 'Loveland' ? 'every-other' : 'ask');
  const yardKind = region?.yard ?? (town === 'Fort Collins' || town === 'Loveland' ? 'same-day-season' : 'ask');
  const curb = region?.cartsBy ? `Curb by ${region.cartsBy}` : 'Curb on pickup day';
  const trashStatus = !regular ? 'Pick a day' : todayIs ? 'Out today' : 'Not today';
  const recycleOn = recycling === 'same-day-weekly' ? todayIs : recycling === 'every-other' && town === 'Loveland' ? todayIs && lovelandRecycle : false;
  const recycleStatus =
    recycling === 'none' ? 'Drop-off' : recycling === 'ask' ? 'Ask hauler' : !regular ? 'Pick a day' : recycleOn ? 'Out today' : 'Not today';
  const yardOn = yardKind === 'same-day-season' && todayIs && yard;
  const yardStatus =
    yardKind === 'none' ? 'Landfill' : yardKind === 'ask' ? 'Ask hauler' : yardKind === 'in-trash' ? 'In trash cart' : !yard ? 'Off season' : trashStatus;

  return [
    {
      icon: 'trash-outline',
      title: 'Trash cart',
      note: region?.id === 'uninc-landfill' ? 'No curbside cart — haul a load yourself or hire a hauler.' : curb,
      status: region?.id === 'uninc-landfill' ? 'Self-haul' : trashStatus,
      place,
    },
    {
      icon: 'reload-outline',
      title: 'Recycling',
      note: recyclingNote(recycling, lovelandRecycle, town),
      status: recycleStatus,
      place,
    },
    {
      icon: 'leaf-outline',
      title: 'Yard trimmings',
      note: yardNote(yardKind, yard, town),
      status: yardOn ? 'Out today' : yardStatus,
      place,
    },
  ];
}

function actionsFor(town: TrashTown, region: TrashRegion | null): Array<{ icon: string; label: string; onPress: () => void }> {
  const extra: Array<{ icon: string; label: string; onPress: () => void }> = [];
  if (region?.phone) {
    extra.push({ icon: 'call', label: `Call ${region.hauler} ${region.phone}`, onPress: () => call(region.phone as string) });
  }
  if (region?.lookupUrl) {
    extra.push({ icon: 'globe-outline', label: region.id === 'uninc-landfill' ? 'Landfill hours and fees' : 'Look up this area', onPress: () => open(region.lookupUrl as string) });
  }

  if (town === 'Fort Collins') {
    return [
      ...extra,
      ...(region?.phone === '970-416-2012' ? [] : [{ icon: 'call', label: 'Call Republic 970-416-2012', onPress: () => call('970-416-2012') }]),
      { icon: 'globe-outline', label: 'Look up my address', onPress: () => open(LOOKUP.foco) },
      { icon: 'map-outline', label: '2026 collection map (PDF)', onPress: () => open(LOOKUP.guide) },
      { icon: 'leaf-outline', label: 'What goes in which cart (city guide)', onPress: () => open(LOOKUP.focoCarts) },
    ];
  }
  if (town === 'Loveland') {
    return [
      ...extra,
      ...(region?.phone === '970-962-2529' ? [] : [{ icon: 'call', label: 'Call Loveland Solid Waste 970-962-2529', onPress: () => call('970-962-2529') }]),
      { icon: 'phone-portrait-outline', label: 'Loveland Recollect calendar', onPress: () => open(LOOKUP.loveland) },
    ];
  }
  if (town === 'Estes Park') {
    return [
      ...extra,
      { icon: 'call', label: 'Call WM 1-866-849-0076', onPress: () => call('1-866-849-0076') },
      { icon: 'call', label: 'Call Superior Trash 970-214-4902', onPress: () => call('970-214-4902') },
      { icon: 'globe-outline', label: 'WM Estes Park', onPress: () => open(LOOKUP.estes) },
    ];
  }
  if (town === 'Berthoud') {
    return [
      ...extra,
      { icon: 'call', label: 'Town of Berthoud 970-532-2643', onPress: () => call('970-532-2643') },
      { icon: 'globe-outline', label: 'Licensed haulers', onPress: () => open(LOOKUP.berthoud) },
      { icon: 'call', label: 'Mountain High Disposal 970-834-1144', onPress: () => call('970-834-1144') },
      { icon: 'call', label: 'United Waste 970-532-0803', onPress: () => call('970-532-0803') },
      { icon: 'call', label: 'Step Up Disposals 970-888-1414', onPress: () => call('970-888-1414') },
    ];
  }
  if (town === 'Wellington') {
    return [
      ...extra,
      { icon: 'call', label: 'Dumpster Diverz 970-888-7274', onPress: () => call('970-888-7274') },
      { icon: 'call', label: 'Republic 970-484-5556', onPress: () => call('970-484-5556') },
      { icon: 'call', label: 'Waste Management 970-482-6319', onPress: () => call('970-482-6319') },
      { icon: 'globe-outline', label: 'Town utilities & trash list', onPress: () => open(LOOKUP.wellington) },
    ];
  }
  return [
    ...extra,
    { icon: 'call', label: 'Landfill office 970-498-5760', onPress: () => call('970-498-5760') },
    { icon: 'call', label: 'Landfill 24-hour line 970-498-5770', onPress: () => call('970-498-5770') },
    { icon: 'globe-outline', label: 'Larimer County landfill', onPress: () => open(LOOKUP.landfill) },
    { icon: 'call', label: 'Atlas Unlimited north county 970-881-2262', onPress: () => call('970-881-2262') },
  ];
}

function ServiceRow({
  icon,
  title,
  note,
  status,
  place,
}: {
  icon: string;
  title: string;
  note: string;
  status: string;
  place: string;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[styles.listing, { backgroundColor: colors.card }, cardShadow(isDark)]}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${status}. ${place}. ${note}`}
    >
      <View style={styles.listingRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
          <Ionicons name={icon as never} size={22} color={HEADER_PURPLE} />
        </View>
        <View style={styles.listingBody}>
          <Text style={[styles.listingName, { color: colors.ink }]}>{title}</Text>
          <Text style={[styles.listingMeta, { color: colors.muted }]}>
            {status} · {place}
          </Text>
          <Text style={[styles.listingDesc, { color: colors.body }]}>{note}</Text>
        </View>
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
  note: { paddingHorizontal: spacing.lg, fontSize: 14, lineHeight: 21 },
  action: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderRadius: radius.lg,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: { fontWeight: '800', fontSize: 16 },
  listing: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listingRow: { flexDirection: 'row', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingBody: { flex: 1 },
  listingHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  listingName: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  listingMeta: { fontSize: 13, marginTop: 2, marginBottom: 6 },
  listingDesc: { fontSize: 15, lineHeight: 21 },
});
