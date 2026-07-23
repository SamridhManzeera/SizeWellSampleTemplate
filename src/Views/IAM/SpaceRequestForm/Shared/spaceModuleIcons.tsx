import type { ReactElement } from 'react';
import type { RequestFormModuleKey } from '../../../../Store/RequestForm';

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function GeneralIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function WorkAreaIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ItIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3s6 7.02 6 11a6 6 0 1 1-12 0c0-3.98 6-11 6-11z" />
    </svg>
  );
}

function WelfareIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3.31 2.46-5.5 5.5-5.5s5.5 2.19 5.5 5.5" />
      <circle cx="17.5" cy="9.2" r="2.3" />
      <path d="M14.8 20c.16-2.35 1.6-4.06 3.4-4.63" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function WorkforceIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c.5-3.65 3.24-6 7-6s6.5 2.35 7 6" />
      <path d="M9 20h6" />
    </svg>
  );
}

export const MODULE_ICONS: Record<RequestFormModuleKey, ReactElement> = {
  workArea: <WorkAreaIcon />,
  it: <ItIcon />,
  water: <WaterIcon />,
  welfare: <WelfareIcon />,
  power: <PowerIcon />,
  workforce: <WorkforceIcon />,
};
