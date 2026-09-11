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
}

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
  icon: string;
  color: string;
  blurb: string;
}
