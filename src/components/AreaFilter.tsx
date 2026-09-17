import { areaMessage, useI18n, type Translate } from '../i18n';
import type { AreaFilter as AreaFilterId } from '../data/resources';
import type { Area } from '../data/types';
import { Chip } from './Chip';
import { ChipRow } from './ChipRow';

const AREA_CHIP_IDS: AreaFilterId[] = ['All', 'Fort Collins', 'Loveland', 'Estes Park', 'Berthoud', 'Wellington'];

type Props = {
  value: AreaFilterId;
  onChange: (area: AreaFilterId) => void;
};

export function AreaFilter({ value, onChange }: Props) {
  const { t } = useI18n();
  return (
    <ChipRow>
      {AREA_CHIP_IDS.map((id) => (
        <Chip
          key={id}
          label={chipLabel(id, t)}
          active={value === id}
          onPress={() => onChange(id)}
          small
          accessibilityLabel={id === 'All' ? t('area.allA11y') : t(areaMessage(id))}
        />
      ))}
    </ChipRow>
  );
}

function chipLabel(id: AreaFilterId, t: Translate): string {
  if (id === 'All') return t('area.all');
  if (id === 'Fort Collins') return t('area.foco');
  return t(areaMessage(id));
}

export function areaLabel(area: AreaFilterId, t: Translate): string {
  if (area === 'All') return t('area.larimerCounty');
  if (area === 'Fort Collins') return t('area.fortCollins');
  return t(areaMessage(area as Area));
}
