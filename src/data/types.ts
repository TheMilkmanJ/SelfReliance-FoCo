export type CategoryId =
  | 'food'
  | 'housing'
  | 'shelter'
  | 'employment'
  | 'benefits'
  | 'utilities'
  | 'health'
  | 'transportation'
  | 'phone'
  | 'legal'
  | 'seniors_disability'
  | 'family_children'
  | 'veterans'
  | 'education'
  | 'crisis'
  | 'clothing';

export type Area =
  | 'Fort Collins'
  | 'Loveland'
  | 'Estes Park'
  | 'Berthoud'
  | 'Wellington'
  | 'Larimer County'
  | 'Colorado (statewide)'
  | 'National';

/** Free certificate / badge tracks shown as type chips on the Jobs tab. */
export type CertGroup = 'coding' | 'it_cloud' | 'marketing' | 'government' | 'business' | 'digital_basics';

export interface Resource {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  phone: string | null;
  url: string | null;
  address: string | null;
  hours: string | null;
  area: Area;
  tags: string[];
  certGroup?: CertGroup;
}

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
  icon: string;
  color: string;
  blurb: string;
}
