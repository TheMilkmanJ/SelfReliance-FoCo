import type { CertGroup } from './types';

export const CERT_GROUPS: { id: CertGroup; label: string; short: string; icon: string }[] = [
  { id: 'coding', label: 'Coding certificates', short: 'Coding', icon: 'code-slash-outline' },
  { id: 'it_cloud', label: 'IT & cloud certificates', short: 'IT & cloud', icon: 'cloud-outline' },
  { id: 'marketing', label: 'Marketing certificates', short: 'Marketing', icon: 'megaphone-outline' },
  { id: 'government', label: 'Government certificates', short: 'Government', icon: 'flag-outline' },
  { id: 'business', label: 'Business certificates', short: 'Business', icon: 'storefront-outline' },
  { id: 'digital_basics', label: 'Computer basics', short: 'Computer basics', icon: 'laptop-outline' },
];

export const CERT_GROUP_MAP: Record<CertGroup, (typeof CERT_GROUPS)[number]> = Object.fromEntries(
  CERT_GROUPS.map((g) => [g.id, g]),
) as Record<CertGroup, (typeof CERT_GROUPS)[number]>;

export const CERT_GROUP_IDS = new Set<CertGroup>(CERT_GROUPS.map((g) => g.id));
