import { createContext, useContext, useState, ReactNode } from 'react';

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export interface DayConfig {
  totalCapacity: number;
  hourLimits: Record<number, number>; // -1 = blocked, 0 = unlimited (≤ totalCapacity), >0 = specific limit
}

export const DEFAULT_DAY_CONFIG: DayConfig = {
  totalCapacity: 500,
  hourLimits: Object.fromEntries(HOURS.map(h => [h, 0])),
};

interface ScheduleConfigCtx {
  getConfigForDate: (date: string) => DayConfig;
  updateConfigForDate: (date: string, config: DayConfig) => void;
  configByDate: Record<string, DayConfig>;
}

const Ctx = createContext<ScheduleConfigCtx>({
  getConfigForDate: () => DEFAULT_DAY_CONFIG,
  updateConfigForDate: () => {},
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
