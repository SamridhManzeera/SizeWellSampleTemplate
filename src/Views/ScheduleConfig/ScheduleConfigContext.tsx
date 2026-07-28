import { createContext, useContext, useState, ReactNode } from 'react';

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export type HourType = 'peak' | 'shoulder' | null;

export interface DayConfig {
  totalCapacity: number;
  hourLimits: Record<number, number>; // -1 = blocked, 0 = no limit, >0 = specific limit
  hourTypes: Record<number, HourType>; // admin-designated Peak/Shoulder hour, per date
}

// DCO-mandated weekday vehicle movement caps (two-way × 2 = slot count) —
// this is the fixed regulatory reference table used to (a) seed the default
// hourTypes below and (b) auto-fill the recommended slot count when an admin
// marks an hour as Peak/Shoulder in Schedule Config. Which hours actually
// count as Peak/Shoulder for a given date is admin-configurable via
// DayConfig.hourTypes, not this constant.
export const DCO_HOUR_CONSTRAINTS: Record<number, { slots: number; movements: number; type: 'peak' | 'shoulder' }> = {
  7: { slots: 94, movements: 47, type: 'shoulder' },
  8: { slots: 114, movements: 57, type: 'peak' },
  16: { slots: 84, movements: 42, type: 'shoulder' },
  17: { slots: 68, movements: 34, type: 'peak' },
};

const BLOCKED_BY_DEFAULT = new Set([0, 1, 2, 3, 4, 5, 6, 23]);

const DEFAULT_HOUR_LIMITS = Object.fromEntries(
  HOURS.map(h => [h, BLOCKED_BY_DEFAULT.has(h) ? -1 : (DCO_HOUR_CONSTRAINTS[h]?.slots ?? 0)])
);

const DEFAULT_HOUR_TYPES: Record<number, HourType> = Object.fromEntries(
  HOURS.map(h => [h, DCO_HOUR_CONSTRAINTS[h]?.type ?? null])
);

export const DEFAULT_DAY_CONFIG: DayConfig = {
  totalCapacity: 500,
  hourLimits: DEFAULT_HOUR_LIMITS,
  hourTypes: DEFAULT_HOUR_TYPES,
};

interface ScheduleConfigCtx {
  getConfigForDate: (date: string) => DayConfig;
  updateConfigForDate: (date: string, config: DayConfig) => void;
  configByDate: Record<string, DayConfig>;
}

const Ctx = createContext<ScheduleConfigCtx>({
  getConfigForDate: () => DEFAULT_DAY_CONFIG,
  updateConfigForDate: () => { },
  configByDate: {},
});

export function ScheduleConfigProvider({ children }: { children: ReactNode }) {
  const [configByDate, setConfigByDate] = useState<Record<string, DayConfig>>({});

  function getConfigForDate(date: string): DayConfig {
    return configByDate[date] ?? DEFAULT_DAY_CONFIG;
  }

  function updateConfigForDate(date: string, config: DayConfig) {
    setConfigByDate(prev => ({ ...prev, [date]: config }));
  }

  return (
    <Ctx.Provider value={{ getConfigForDate, updateConfigForDate, configByDate }}>
      {children}
    </Ctx.Provider>
  );
}

export function useScheduleConfig() { return useContext(Ctx); }
