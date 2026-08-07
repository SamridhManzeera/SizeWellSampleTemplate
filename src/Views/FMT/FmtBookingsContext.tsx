import { createContext, useContext, useState, ReactNode } from 'react';
import { FmtBooking, FmtSlotKey, FmtSlotHistoryEntry } from './types';
import { FMT_MOCK_BOOKINGS, FMT_MOCK_COMPANIES, buildFmtSlotKey } from './mockData';

function buildInitialBookings(): Map<FmtSlotKey, FmtBooking> {
  const map = new Map<FmtSlotKey, FmtBooking>();
  FMT_MOCK_BOOKINGS.forEach((b) => {
    map.set(buildFmtSlotKey(b.companyId, b.date, b.hour), b);
  });
  return map;
}

let idCounter = FMT_MOCK_BOOKINGS.length + 1;
let historyIdCounter = 1;

interface FmtBookingsCtx {
  bookings: Map<FmtSlotKey, FmtBooking>;
  // Allocation changes made live (through this session) against emergency-
  // request rows — merged with the static seed history in mockData.ts so
  // "View History" reflects what FMT staff actually did, not just the seed.
  liveHistory: Map<string, FmtSlotHistoryEntry[]>;
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
  liveHistory: new Map(),
  updateAllocation: () => {},
});

export function FmtBookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] =
    useState<Map<FmtSlotKey, FmtBooking>>(buildInitialBookings);
  const [liveHistory, setLiveHistory] = useState<
    Map<string, FmtSlotHistoryEntry[]>
  >(new Map());

  function updateAllocation(
    companyId: string,
    date: string,
    hour: number,
    movementCount: number,
    notes: string
  ) {
    const key = buildFmtSlotKey(companyId, date, hour);
    const company = FMT_MOCK_COMPANIES.find((c) => c.id === companyId);
    const existing = bookings.get(key);

    const next = new Map(bookings);
    if (existing) {
      // bookedCount/inbound/outbound/twoWay are API-sourced and left untouched here.
      if (movementCount === 0 && existing.bookedCount === 0) {
        next.delete(key);
      } else {
        next.set(key, { ...existing, movementCount, notes });
      }
    } else if (movementCount > 0) {
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
        isEmergency: company?.isEmergency,
        requestId: company?.requestId,
        createdAt: new Date().toISOString(),
      });
    }
    setBookings(next);

    if (company?.isEmergency) {
      const resultingAllocated = Array.from(next.values())
        .filter((b) => b.companyId === companyId && b.date === date)
        .reduce((sum, b) => sum + b.movementCount, 0);

      const entry: FmtSlotHistoryEntry = {
        id: `hlive-${historyIdCounter++}`,
        companyId,
        actor: 'fmt',
        actorName: 'David Obuya',
        action: existing
          ? movementCount === 0
            ? 'Emergency slot removed'
            : 'Emergency slot updated'
          : 'Emergency slot allocated',
        slotChange: movementCount - (existing?.movementCount ?? 0),
        resultingAllocated,
        timestamp: new Date().toISOString(),
        note: `${String(hour).padStart(2, '0')}:00 on ${date}${notes ? ` — ${notes}` : ''}`,
      };

      setLiveHistory((prev) => {
        const next = new Map(prev);
        next.set(companyId, [entry, ...(next.get(companyId) ?? [])]);
        return next;
      });
    }
  }

  return (
    <Ctx.Provider value={{ bookings, liveHistory, updateAllocation }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFmtBookings() {
  return useContext(Ctx);
}
