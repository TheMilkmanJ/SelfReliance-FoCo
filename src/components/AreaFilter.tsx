import type { AreaFilter as AreaFilterId } from '../data/resources';
import type { Area } from '../data/types';
import { Chip } from './Chip';
import { ChipRow } from './ChipRow';

export const AREA_CHIPS: Array<{ id: AreaFilterId; label: string; a11y: string }> = [
  { id: 'All', label: 'All of Larimer', a11y: 'All of Larimer County' },
  { id: 'Fort Collins', label: 'FoCo', a11y: 'Fort Collins' },
  { id: 'Loveland', label: 'Loveland', a11y: 'Loveland' },
  { id: 'Estes Park', label: 'Estes Park', a11y: 'Estes Park' },
  { id: 'Berthoud', label: 'Berthoud', a11y: 'Berthoud' },
  { id: 'Wellington', label: 'Wellington', a11y: 'Wellington' },
];

type Props = {
  value: AreaFilterId;
  onChange: (area: AreaFilterId) => void;
};

export function AreaFilter({ value, onChange }: Props) {
  return (
    <ChipRow>
      {AREA_CHIPS.map((a) => (
        <Chip
          key={a.id}
          label={a.label}
          active={value === a.id}
          onPress={() => onChange(a.id)}
          small
          accessibilityLabel={a.a11y}
        />
      ))}
    </ChipRow>
  );
}

export function areaLabel(area: AreaFilterId): string {
  if (area === 'All') return 'Larimer County';
  if (area === 'Fort Collins') return 'Fort Collins';
  return area as Area;
}
