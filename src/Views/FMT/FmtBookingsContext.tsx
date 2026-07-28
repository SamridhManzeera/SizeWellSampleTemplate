import { createContext, useContext, useState, ReactNode } from 'react';
import { FmtBooking, FmtSlotKey } from './types';
import { FMT_MOCK_BOOKINGS, FMT_MOCK_COMPANIES, buildFmtSlotKey } from './mockData';

function buildInitialBookings(): Map<FmtSlotKey, FmtBooking> {
  const map = new Map<FmtSlotKey, FmtBooking>();
  FMT_MOCK_BOOKINGS.forEach((b) => {
    map.set(buildFmtSlotKey(b.companyId, b.date, b.hour), b);
  });
  return map;
}

let idCounter = FMT_MOCK_BOOKINGS.length + 1;

interface FmtBookingsCtx {
  bookings: Map<FmtSlotKey, FmtBooking>;
  updateAllocation: (
    companyId: string,
    date: string,
    hour: number,
    movementCount: number,
    notes: string
  ) => void;
}

const Ctx = createContext<FmtBookingsCtx>({
  bookings: new Map(),
  updateAllocation: () => {},
});

export function FmtBookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] =
    useState<Map<FmtSlotKey, FmtBooking>>(buildInitialBookings);

  function updateAllocation(
    companyId: string,
    date: string,
    hour: number,
    movementCount: number,
    notes: string
  ) {
    const key = buildFmtSlotKey(companyId, date, hour);
    setBookings((prev) => {
      const next = new Map(prev);
      const existing = next.get(key);

      if (existing) {
        // bookedCount/inbound/outbound/twoWay are API-sourced and left untouched here.
        if (movementCount === 0 && existing.bookedCount === 0) {
          next.delete(key);
        } else {
          next.set(key, { ...existing, movementCount, notes });
        }
        return next;
      }

      if (movementCount > 0) {
        const company = FMT_MOCK_COMPANIES.find((c) => c.id === companyId);
        next.set(key, {
          id: `f-b${idCounter++}`,
          companyId,
          companyName: company?.name ?? '',
          date,
          hour,
          movementCount,
          bookedCount: 0,
          inbound: 0,
          outbound: 0,
          twoWay: 0,
          notes,
          createdAt: new Date().toISOString(),
        });
      }
      return next;
    });
  }

  return (
    <Ctx.Provider value={{ bookings, updateAllocation }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFmtBookings() {
  return useContext(Ctx);
}
