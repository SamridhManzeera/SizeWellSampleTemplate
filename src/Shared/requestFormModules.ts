import type { RequestFormModuleKey } from '../Store/RequestForm';

export interface RequestFormModuleConfig {
  key: RequestFormModuleKey;
  label: string;
  segment: string;
  path: string;
}

export const REQUEST_FORM_MODULES: RequestFormModuleConfig[] = [
  {
    key: 'workArea',
    label: 'Work Area',
    segment: 'work-area',
    path: 'work-area',
  },
  { key: 'it', label: 'IT', segment: 'it', path: 'it' },
  { key: 'water', label: 'Water', segment: 'water', path: 'water' },
  { key: 'welfare', label: 'Welfare', segment: 'welfare', path: 'welfare' },
  { key: 'power', label: 'Power', segment: 'power', path: 'power' },
  {
    key: 'workforce',
    label: 'Workforce',
    segment: 'workforce',
    path: 'workforce',
  },
];

export default REQUEST_FORM_MODULES;
