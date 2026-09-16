export type OpenNeedId = 'eat' | 'sleep' | 'wash' | 'sit' | 'weather' | 'call';

export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type OpenTown =
  | 'Fort Collins'
  | 'Loveland'
  | 'Estes Park'
  | 'Berthoud'
  | 'Wellington'
  | 'Larimer County'
  | 'Colorado'
  | 'National';

export type HourWindow = {
  start: string;
  end: string;
};

export type DaySchedule = HourWindow[] | 'closed' | 'all-day';

export type OpenPlace = {
  id: string;
  name: string;
  needs: OpenNeedId[];
  who: string;
  description: string;
  phone: string | null;
  url: string | null;
  address: string | null;
  area: OpenTown;
  hoursNote: string;
  schedule?: Partial<Record<DayKey, DaySchedule>>;
  confirm: boolean;
  alwaysOpen?: boolean;
};

export type OpenNeed = {
  id: OpenNeedId;
  label: string;
  short: string;
  blurb: string;
  icon: string;
  color: string;
};
