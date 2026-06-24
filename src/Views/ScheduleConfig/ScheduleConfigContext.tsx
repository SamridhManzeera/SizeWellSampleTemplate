import { createContext, useContext, useState, ReactNode } from 'react';

export interface ScheduleConfigValues {
  inboundCapacity: number;
  outboundCapacity: number;
  twoWayCapacity: number;
  hourCapacity: number;
}

interface ScheduleConfigCtx extends ScheduleConfigValues {
  updateConfig: (values: ScheduleConfigValues) => void;
}

const DEFAULT: ScheduleConfigValues = {
  inboundCapacity: 130,
  outboundCapacity: 120,
  twoWayCapacity: 125,
  hourCapacity: 10,
};

const Ctx = createContext<ScheduleConfigCtx>({
  ...DEFAULT,
  updateConfig: () => {},
});

export function ScheduleConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ScheduleConfigValues>(DEFAULT);
  return (
    <Ctx.Provider value={{ ...config, updateConfig: setConfig }}>
      {children}
    </Ctx.Provider>
  );
}

export function useScheduleConfig() { return useContext(Ctx); }
