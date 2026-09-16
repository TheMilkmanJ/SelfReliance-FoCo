import type { OpenNeed, OpenNeedId } from './openNowTypes';

export const OPEN_NEEDS: OpenNeed[] = [
  {
    id: 'eat',
    label: 'Eat',
    short: 'Eat',
    blurb: 'Hot meals and same-day food. No account.',
    icon: 'restaurant-outline',
    color: '#b45309',
  },
  {
    id: 'sleep',
    label: 'Sleep tonight',
    short: 'Sleep',
    blurb: 'Beds, check-in times, and who they take.',
    icon: 'moon-outline',
    color: '#4338ca',
  },
  {
    id: 'wash',
    label: 'Shower',
    short: 'Shower',
    blurb: 'Showers, laundry, and clothes closets.',
    icon: 'water-outline',
    color: '#0369a1',
  },
  {
    id: 'sit',
    label: 'Sit inside',
    short: 'Sit',
    blurb: 'Day desks, libraries, restrooms, mail.',
    icon: 'home-outline',
    color: '#0f766e',
  },
  {
    id: 'weather',
    label: 'Heat or cold',
    short: 'Weather',
    blurb: 'Warming and cooling places, then call 2-1-1.',
    icon: 'thermometer-outline',
    color: '#b91c1c',
  },
  {
    id: 'call',
    label: 'Call for help',
    short: 'Call',
    blurb: 'Lines that pick up. Outreach can come to you.',
    icon: 'call-outline',
    color: '#0e5c46',
  },
];

export const OPEN_NEED_MAP: Record<OpenNeedId, OpenNeed> = Object.fromEntries(OPEN_NEEDS.map((n) => [n.id, n])) as Record<
  OpenNeedId,
  OpenNeed
>;
