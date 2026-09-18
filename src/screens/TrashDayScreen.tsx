import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { dowKey, dowShortKey, holidayLabel, monthKey, useI18n, type Translate } from '../i18n';
import { call, open } from '../lib/actions';
import { useBackLayer } from '../lib/backStack';
import { useDenverNow } from '../lib/denverClock';
import { MAX_FONT, useLargePrint } from '../lib/fontScale';
import {
  SERVICE_DAYS,
  actualPickupDow,
  cartDayKind,
  chipForThisRegion,
  mappedServiceDow,
  formatYmd,
  fromDenverNow,
  holidayLastServiceWeek,
  holidayThisServiceWeek,
  nextPickup,
  usesHolidayBump,
  type ServiceDow,
  yardTrimmingsSeason,
} from '../lib/trashCalendar';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import { TRASH_REGION_KEY, TRASH_ZONE_KEY, loadRegionDays, saveRegionDay } from '../lib/trashPrefs';
import { HEADER_PURPLE, cardShadow, radius, spacing, useTheme } from '../theme';

const RECYCLE_KEY = 'foco-loveland-recycle-this-week';
const OVERRIDE_KEY = 'foco-trash-day-override';

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
  regionId: string | null;
  onRegionIdChange: (id: string | null) => void;
  onBack: () => void;
};

type DayMap = Partial<Record<TrashTown, ServiceDow>>;

export function TrashDayScreen({ area, onAreaChange, regionId, onRegionIdChange, onBack }: Props) {
  const { handleClose } = useBackLayer(true, onBack);
  const { colors, isDark } = useTheme();
  const largePrint = useLargePrint();
  const { t } = useI18n();
  const now = useDenverNow();
  const ymd = fromDenverNow(now);
  const [days, setDays] = useState<DayMap>({});
  const [regionDays, setRegionDays] = useState<Record<string, ServiceDow>>({});
  const [chipOverride, setChipOverride] = useState<ServiceDow | null>(null);
  const [chipRegionId, setChipRegionId] = useState<string | null>(null);
  const [chipsLocked, setChipsLocked] = useState(false);
  const ignoreChipUntil = useRef(0);
  const [lovelandRecycle, setLovelandRecycle] = useState(true);

  const lockWeekdayChips = () => {
    ignoreChipUntil.current = Date.now() + 600;
    setChipsLocked(true);
    setTimeout(() => setChipsLocked(false), 600);
  };

  useEffect(() => {
    void AsyncStorage.removeItem(OVERRIDE_KEY);
    void loadRegionDays().then(setRegionDays);
    void Promise.all([
      AsyncStorage.getItem(TRASH_REGION_KEY),
      AsyncStorage.getItem(TRASH_ZONE_KEY),
      AsyncStorage.getItem(RECYCLE_KEY),
      ...Object.values(DAY_STORAGE_KEY).map((key) => AsyncStorage.getItem(key)),
    ]).then(([regionSaved, zoneSaved, recycleSaved, ...daySaved]) => {
      const stored = regionById(regionSaved) ?? regionById(zoneSaved);
      setDays((current) => {
        const next: DayMap = {};
        (Object.keys(DAY_STORAGE_KEY) as TrashTown[]).forEach((town, i) => {
          const n = Number(daySaved[i]);
          if (n >= 1 && n <= 5) next[town] = n as ServiceDow;
        });
        const mapped = stored?.dow ? (stored.dow as ServiceDow) : null;
        if (mapped && stored) next[stored.town] = mapped;
        return { ...next, ...current };
      });
      if (recycleSaved === 'no') setLovelandRecycle(false);
      if (recycleSaved === 'yes') setLovelandRecycle(true);
    });
  }, []);

  const savedRegion = regionById(regionId);
  const chipTown = townFromArea(area);
  const region = savedRegion;
  const town: TrashTown = region?.town ?? chipTown ?? 'Fort Collins';
  // JSON map day (FoCo) or a weekday remembered for this neighborhood (Loveland / Estes / Berthoud / Wellington).
  // Town-wide leftover Friday must not mark Centerra Out today, and must not ride to Namaqua.
  const remembered = region ? regionDays[region.id] ?? null : null;
  const mapped = region?.dow ?? remembered ?? null;
  const leftover = !region ? days[town] ?? null : null;
  const sessionChip = chipForThisRegion(regionId, chipRegionId, chipOverride);
  const regular = mappedServiceDow(mapped, sessionChip, leftover);
  const focusTown = chipTown;
  // Hide chips once this neighborhood has a day — same as mapped FoCo. Tapping Friday
  // on a closing list must not mark a Tuesday neighborhood Out today.
  const showWeekdayChips = region?.id !== 'uninc-landfill' && mapped == null;

  const saveDay = (day: ServiceDow) => {
    if (region?.dow != null) return;
    if (Date.now() < ignoreChipUntil.current) return;
    setChipOverride(day);
    setChipRegionId(regionId);
    setDays((prev) => ({ ...prev, [town]: day }));
    void AsyncStorage.setItem(DAY_STORAGE_KEY[town], String(day));
    if (regionId) {
      setRegionDays((prev) => ({ ...prev, [regionId]: day }));
      void saveRegionDay(regionId, day);
    }
  };

  const saveRegion = (next: TrashRegion) => {
    lockWeekdayChips();
    setChipOverride(null);
    setChipRegionId(next.id);
    void AsyncStorage.removeItem(OVERRIDE_KEY);
    onRegionIdChange(next.id);
    if (next.dow) {
      setDays((prev) => ({ ...prev, [next.town]: next.dow as ServiceDow }));
      void AsyncStorage.setItem(DAY_STORAGE_KEY[next.town], String(next.dow));
    }
    const chip = areaFromTown(next.town);
    if (chip !== area) onAreaChange(chip);
  };

  const clearRegion = () => {
    lockWeekdayChips();
    onRegionIdChange(null);
    setChipOverride(null);
    setChipRegionId(null);
    void AsyncStorage.removeItem(OVERRIDE_KEY);
  };

  const saveRecycle = (on: boolean) => {
    setLovelandRecycle(on);
    void AsyncStorage.setItem(RECYCLE_KEY, on ? 'yes' : 'no');
  };

  const holiday = holidayThisServiceWeek(ymd);
  const lastHoliday = holidayLastServiceWeek(ymd);
  const holidayBump = usesHolidayBump(town, region?.hauler, region?.id);
  const pickup = regular ? nextPickup(regular, ymd, holidayBump) : null;
  const pickupDow = regular ? (holidayBump ? actualPickupDow(regular, ymd) : regular) : null;
  const todayIs = cartDayKind(ymd.dow, pickupDow) === 'out-today';
  const delayed = regular != null && pickupDow != null && pickupDow !== regular;
  const yard = yardTrimmingsSeason(ymd, town);
  const republicHoliday = town === 'Fort Collins';
  const place = region ? region.label : town === 'Unincorporated' ? t('area.unincorporated') : town;

  const hero = useMemo(() => {
    if (!regular) return null;
    const by = region?.cartsBy ? t('trash.byTime', { time: region.cartsBy }) : '';
    if (todayIs) {
      const day = t(dowKey((pickupDow ?? regular) as number));
      return {
        kicker: delayed ? t('trash.todayDelayed') : t('trash.today'),
        title: day,
        sub: delayed
          ? t('trash.cartsTodayDelayed', { holiday: holidayLabel(holiday?.name ?? '', t) || t('holiday.generic'), by })
          : t('trash.cartsToday', { place, by }),
      };
    }
    if (pickup) {
      const day = t(dowKey(pickup.when.dow));
      return {
        kicker: t('trash.notToday'),
        title: day,
        sub: pickup.delayed
          ? t('trash.notTodaySubDelayed', {
              holiday: holidayLabel(pickup.holiday?.name ?? '', t) || t('holiday.aHoliday'),
              place,
              day,
              when: formatYmd(pickup.when),
              by,
            })
          : t('trash.notTodaySub', { place, day, when: formatYmd(pickup.when), by }),
      };
    }
    return null;
  }, [regular, todayIs, delayed, holiday, pickup, pickupDow, region, place, t]);

  const service = serviceCopy(town, region, ymd.dow, yard, lovelandRecycle, pickupDow, place, t);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header
        title={t('trash.title')}
        subtitle={t('trash.subtitle', {
          weekday: t(dowKey(now.dow)),
          date: `${t(monthKey(now.month))} ${now.date}`,
          time: now.timeLabel,
        })}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable onPress={handleClose} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.backResources')}>
          <Ionicons name="arrow-back" size={20} color={HEADER_PURPLE} />
          <Text style={[styles.backText, { color: colors.purple }]}>{t('common.resources')}</Text>
        </Pressable>
        <AreaFilter value={area} onChange={onAreaChange} />

        <Text style={[styles.lede, { color: colors.body }]}>{ledeFor(town, region, t)}</Text>

        <TrashZoneSelect
          value={region?.id ?? null}
          pickupDow={regular}
          focusTown={focusTown}
          rememberedDays={regionDays}
          onChange={saveRegion}
          onClear={clearRegion}
        />

        {republicHoliday && holiday ? (
          <Text style={[styles.note, { color: colors.body }]}>
            {t('trash.weekDelay', { holiday: holidayLabel(holiday.name, t), day: t(dowKey(holiday.dow)) })}
          </Text>
        ) : republicHoliday && lastHoliday ? (
          <Text style={[styles.note, { color: colors.body }]}>
            {t('trash.lastWeekDelay', {
              holiday: holidayLabel(lastHoliday.name, t),
              place: region ? region.label : t('trash.yourArea'),
            })}
          </Text>
        ) : holidayBump && holiday ? (
          <Text style={[styles.note, { color: colors.body }]}>
            {t('trash.holidayDelay', { holiday: holidayLabel(holiday.name, t) })}
          </Text>
        ) : null}

        {showWeekdayChips ? (
          <>
            <Text style={[styles.section, { color: colors.ink }]}>
              {t('trash.usualDay')}
            </Text>
            <View style={styles.days} pointerEvents={chipsLocked ? 'none' : 'auto'}>
              {SERVICE_DAYS.map((d) => {
                const on = regular === d.id;
                const label = t(dowKey(d.id));
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => saveDay(d.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on, disabled: chipsLocked }}
                    accessibilityLabel={label}
                    style={[
                      styles.day,
                      { backgroundColor: on ? HEADER_PURPLE : colors.card, borderColor: on ? HEADER_PURPLE : colors.line },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: on ? '#fff' : colors.ink }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
                      {largePrint ? t(dowShortKey(d.id)) : label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {hero ? (
          <View style={[styles.hero, { backgroundColor: todayIs ? HEADER_PURPLE : colors.card }]}>
            <Text style={[styles.heroKicker, { color: todayIs ? '#e9dffb' : HEADER_PURPLE }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
              {hero.kicker}
            </Text>
            <Text style={[styles.heroTitle, { color: todayIs ? '#fff' : colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
              {hero.title}
            </Text>
            <Text style={[styles.heroSub, { color: todayIs ? '#e9dffb' : colors.body }]} maxFontSizeMultiplier={MAX_FONT.title}>
              {hero.sub}
            </Text>
          </View>
        ) : region?.id === 'uninc-landfill' ? (
          <View style={[styles.hero, { backgroundColor: colors.card }]}>
            <Text style={[styles.heroTitle, { color: colors.ink }]}>{t('trash.noCurbside')}</Text>
            <Text style={[styles.heroSub, { color: colors.body }]}>{t('trash.noCurbsideSub')}</Text>
          </View>
        ) : (
          <Text style={[styles.hint, { color: colors.muted }]}>{t('trash.hintPick')}</Text>
        )}

        <Text style={[styles.section, { color: colors.ink }]}>{t('trash.whatGoesOut')}</Text>
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
                    <Text style={[styles.listingName, { color: colors.ink }]}>{t('trash.recycleWeek')}</Text>
                    <Switch value={lovelandRecycle} onValueChange={saveRecycle} />
                  </View>
                  <Text style={[styles.listingMeta, { color: colors.muted }]}>
                    {lovelandRecycle ? t('trash.thisWeek') : t('trash.skipWeek')}
                  </Text>
                  <Text style={[styles.listingDesc, { color: colors.body }]}>
                    {lovelandRecycle ? t('trash.recycleYes') : t('trash.recycleNo')}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <Text style={[styles.note, { color: colors.body }]}>{footnoteFor(town, region, t)}</Text>

        {actionsFor(town, region, t).map((row) => (
          <Action key={row.label} icon={row.icon} label={row.label} onPress={row.onPress} />
        ))}

        {area === 'All' && !region ? (
          <Text style={[styles.note, { color: colors.muted }]}>
            {t('trash.allNote', { area: areaLabel('Fort Collins', t) })}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ledeFor(town: TrashTown, region: TrashRegion | null, t: Translate): string {
  if (region?.town === 'Unincorporated' && region.id === 'uninc-landfill') return t('trash.ledeLandfill');
  if (town === 'Fort Collins') return t('trash.ledeFoco');
  if (town === 'Loveland') return t('trash.ledeLoveland');
  if (town === 'Estes Park') return t('trash.ledeEstes');
  if (town === 'Berthoud') return t('trash.ledeBerthoud');
  if (town === 'Wellington') return t('trash.ledeWellington');
  return t('trash.ledeUninc');
}

function footnoteFor(town: TrashTown, region: TrashRegion | null, t: Translate): string {
  if (region?.id === 'uninc-landfill') return t('trash.footLandfill');
  if (town === 'Fort Collins') return t('trash.footFoco');
  if (town === 'Loveland') return t('trash.footLoveland');
  if (town === 'Estes Park') return t('trash.footEstes');
  if (town === 'Berthoud') return t('trash.footBerthoud');
  if (town === 'Wellington') return t('trash.footWellington');
  return t('trash.footUninc');
}

function recyclingNote(kind: RecyclingKind, lovelandRecycle: boolean, town: TrashTown, t: Translate): string {
  if (kind === 'none') return t('trash.recycNone');
  if (kind === 'ask') return t('trash.recycAsk');
  if (kind === 'every-other' && town === 'Loveland') {
    return lovelandRecycle ? t('trash.recycLovelandYes') : t('trash.recycLovelandNo');
  }
  if (kind === 'every-other') return t('trash.recycEveryOther');
  return t('trash.recycWeekly');
}

function yardNote(kind: YardKind, yard: boolean, town: TrashTown, t: Translate): string {
  if (kind === 'none') return t('trash.yardNone');
  if (kind === 'ask') return t('trash.yardAsk');
  if (kind === 'in-trash') return t('trash.yardInTrash');
  if (town === 'Loveland') {
    return yard ? t('trash.yardLovelandOn') : t('trash.yardLovelandOff');
  }
  return yard ? t('trash.yardOn') : t('trash.yardOff');
}

function cartStatus(todayDow: number, pickupDow: number | null, t: Translate): string {
  const kind = cartDayKind(todayDow, pickupDow);
  if (kind === 'pick') return t('trash.pickDay');
  const day = t(dowKey(pickupDow as number));
  if (kind === 'out-today') return t('trash.outToday');
  return t('trash.dayPickup', { day });
}

function serviceCopy(
  town: TrashTown,
  region: TrashRegion | null,
  todayDow: number,
  yard: boolean,
  lovelandRecycle: boolean,
  pickupDow: number | null,
  place: string,
  t: Translate,
): Array<{ icon: string; title: string; note: string; status: string; place: string }> {
  const recycling = region?.recycling ?? (town === 'Fort Collins' ? 'same-day-weekly' : town === 'Loveland' ? 'every-other' : 'ask');
  const yardKind = region?.yard ?? (town === 'Fort Collins' || town === 'Loveland' ? 'same-day-season' : 'ask');
  const curb = region?.cartsBy ? t('trash.curbBy', { time: region.cartsBy }) : t('trash.curbOn');
  const todayIs = pickupDow != null && todayDow === pickupDow;
  const trashStatus = cartStatus(todayDow, pickupDow, t);
  const recycleSkip = recycling === 'every-other' && town === 'Loveland' && !lovelandRecycle;
  const recycleStatus =
    recycling === 'none'
      ? t('trash.dropOff')
      : recycling === 'ask'
        ? t('trash.askHauler')
        : recycleSkip
          ? t('trash.skipWeek')
          : trashStatus;
  const yardOn = yardKind === 'same-day-season' && todayIs && yard;
  const yardStatus =
    yardKind === 'none'
      ? t('trash.selfHaul')
      : yardKind === 'ask'
        ? t('trash.askHauler')
        : yardKind === 'in-trash'
          ? t('trash.inTrashCart')
          : !yard
            ? t('trash.offSeason')
            : trashStatus;

  return [
    {
      icon: 'trash-outline',
      title: t('trash.cart'),
      note: region?.id === 'uninc-landfill' ? t('trash.noCart') : curb,
      status: region?.id === 'uninc-landfill' ? t('trash.selfHaul') : trashStatus,
      place,
    },
    {
      icon: 'reload-outline',
      title: t('trash.recycling'),
      note: recyclingNote(recycling, lovelandRecycle, town, t),
      status: recycleStatus,
      place,
    },
    {
      icon: 'leaf-outline',
      title: t('trash.yard'),
      note: yardNote(yardKind, yard, town, t),
      status: yardOn ? trashStatus : yardStatus,
      place,
    },
  ];
}

function actionsFor(town: TrashTown, region: TrashRegion | null, t: Translate): Array<{ icon: string; label: string; onPress: () => void }> {
  const extra: Array<{ icon: string; label: string; onPress: () => void }> = [];
  if (region?.phone) {
    extra.push({
      icon: 'call',
      label: t('trash.callHauler', { hauler: region.hauler, phone: region.phone }),
      onPress: () => call(region.phone as string),
    });
  }
  if (region?.lookupUrl) {
    extra.push({
      icon: 'globe-outline',
      label: region.id === 'uninc-landfill' ? t('trash.landfillHours') : t('trash.lookupArea'),
      onPress: () => open(region.lookupUrl as string),
    });
  }

  if (town === 'Fort Collins') {
    return [
      ...extra,
      ...(region?.phone === '970-416-2012' ? [] : [{ icon: 'call', label: t('trash.callRepublic'), onPress: () => call('970-416-2012') }]),
      { icon: 'globe-outline', label: t('trash.lookupAddress'), onPress: () => open(LOOKUP.foco) },
      { icon: 'map-outline', label: t('trash.mapPdf'), onPress: () => open(LOOKUP.guide) },
      { icon: 'leaf-outline', label: t('trash.cartGuide'), onPress: () => open(LOOKUP.focoCarts) },
    ];
  }
  if (town === 'Loveland') {
    return [
      ...extra,
      ...(region?.phone === '970-962-2529' ? [] : [{ icon: 'call', label: t('trash.callLoveland'), onPress: () => call('970-962-2529') }]),
      { icon: 'phone-portrait-outline', label: t('trash.recollect'), onPress: () => open(LOOKUP.loveland) },
    ];
  }
  if (town === 'Estes Park') {
    return [
      ...extra,
      { icon: 'call', label: t('trash.callWm'), onPress: () => call('1-866-849-0076') },
      { icon: 'call', label: t('trash.callSuperior'), onPress: () => call('970-214-4902') },
      { icon: 'globe-outline', label: t('trash.wmEstes'), onPress: () => open(LOOKUP.estes) },
    ];
  }
  if (town === 'Berthoud') {
    return [
      ...extra,
      { icon: 'call', label: t('trash.berthoudTown'), onPress: () => call('970-532-2643') },
      { icon: 'globe-outline', label: t('trash.licensedHaulers'), onPress: () => open(LOOKUP.berthoud) },
      { icon: 'call', label: t('trash.mountainHigh'), onPress: () => call('970-834-1144') },
      { icon: 'call', label: t('trash.unitedWaste'), onPress: () => call('970-532-0803') },
      { icon: 'call', label: t('trash.stepUp'), onPress: () => call('970-888-1414') },
    ];
  }
  if (town === 'Wellington') {
    return [
      ...extra,
      { icon: 'call', label: t('trash.dumpsterDiverz'), onPress: () => call('970-888-7274') },
      { icon: 'call', label: t('trash.republicWell'), onPress: () => call('970-484-5556') },
      { icon: 'call', label: t('trash.wmWell'), onPress: () => call('970-482-6319') },
      { icon: 'globe-outline', label: t('trash.wellingtonList'), onPress: () => open(LOOKUP.wellington) },
    ];
  }
  return [
    ...extra,
    { icon: 'call', label: t('trash.landfillOffice'), onPress: () => call('970-498-5760') },
    { icon: 'call', label: t('trash.landfill24'), onPress: () => call('970-498-5770') },
    { icon: 'globe-outline', label: t('trash.landfillSite'), onPress: () => open(LOOKUP.landfill) },
    { icon: 'call', label: t('trash.atlas'), onPress: () => call('970-881-2262') },
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
      accessibilityLabel={`${title}. ${status}. ${place}. ${note}.`}
    >
      <View style={styles.listingRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${HEADER_PURPLE}1a` }]}>
          <Ionicons name={icon as never} size={22} color={HEADER_PURPLE} />
        </View>
        <View style={styles.listingBody}>
          <Text style={[styles.listingName, { color: colors.ink }]} maxFontSizeMultiplier={MAX_FONT.title}>
            {title}
          </Text>
          <Text style={[styles.statusLine, { color: HEADER_PURPLE }]} maxFontSizeMultiplier={MAX_FONT.title}>
            {status}
          </Text>
          <Text style={[styles.listingMeta, { color: colors.muted }]} maxFontSizeMultiplier={MAX_FONT.chrome}>
            {place}
          </Text>
          <Text style={[styles.listingDesc, { color: colors.body }]} maxFontSizeMultiplier={MAX_FONT.title}>
            {note}
          </Text>
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
  heroKicker: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  heroTitle: { fontSize: 36, fontWeight: '800', lineHeight: 42 },
  heroSub: { fontSize: 16, lineHeight: 23 },
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
  listingBody: { flex: 1, minWidth: 0 },
  listingHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'space-between' },
  listingName: { fontSize: 17, fontWeight: '700' },
  statusLine: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  listingMeta: { fontSize: 13, marginTop: 4, marginBottom: 6 },
  listingDesc: { fontSize: 15, lineHeight: 21 },
});
