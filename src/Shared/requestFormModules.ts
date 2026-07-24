import type { RequestFormModuleKey } from '../Store/RequestForm';

export interface RequestFormModuleConfig {
  key: RequestFormModuleKey;
  label: string;
  shortLabel: string;
  segment: string;
  path: string;
}

export const REQUEST_FORM_MODULES: RequestFormModuleConfig[] = [
  {
    key: 'workArea',
    label: 'Work Area (Space Required)',
    shortLabel: 'Work Area',
    segment: 'work-area',
    path: 'work-area',
  },
  { key: 'it', label: 'IT (Equipment Required)', shortLabel: 'IT', segment: 'it', path: 'it' },
  { key: 'water', label: 'Water (Consumption)', shortLabel: 'Water', segment: 'water', path: 'water' },
  { key: 'welfare', label: 'Welfare (Support Facilities)', shortLabel: 'Welfare', segment: 'welfare', path: 'welfare' },
  { key: 'power', label: 'Power (Energy Demand)', shortLabel: 'Power', segment: 'power', path: 'power' },
  {
    key: 'workforce',
    label: 'Workforce (No. Of People)',
    shortLabel: 'Workforce',
    segment: 'workforce',
    path: 'workforce',
  },
];

export default REQUEST_FORM_MODULES;
