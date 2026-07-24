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
    label: 'Work Area',
    shortLabel: 'Work Area',
    segment: 'work-area',
    path: 'work-area',
  },
  {
    key: 'workforce',
    label: 'Workforce',
    shortLabel: 'Workforce',
    segment: 'workforce',
    path: 'workforce',
  },
  { key: 'it', label: 'IT', shortLabel: 'IT', segment: 'it', path: 'it' },
  { key: 'water', label: 'Water', shortLabel: 'Water', segment: 'water', path: 'water' },
  { key: 'welfare', label: 'Welfare', shortLabel: 'Welfare', segment: 'welfare', path: 'welfare' },
  { key: 'power', label: 'Power', shortLabel: 'Power', segment: 'power', path: 'power' },
];

export default REQUEST_FORM_MODULES;
