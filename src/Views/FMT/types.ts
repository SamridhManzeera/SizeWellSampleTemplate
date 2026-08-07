export interface FmtCompanyGroup {
  id: string;
  name: string;
}

export interface FmtCompany {
  id: string;
  name: string;
  groupId: string;
  allocatedCapacity: number;
  // Present when this row was auto-derived from an emergency delivery
  // request (see Requests/requestTypes.ts) rather than a regular contractor.
  isEmergency?: boolean;
  requestId?: string;
}

export interface FmtBooking {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  hour: number;
  movementCount: number; // distributed from the company's Allocated capacity
  bookedCount: number; // reported by the booking API (mock data here) — independent of movementCount; equals inbound + outbound + twoWay*2
  inbound: number;
  outbound: number;
  twoWay: number;
  notes: string;
  createdAt: string;
  // Present when this booking originated from (or was allocated against) an
  // emergency delivery request — flags the slot in the grid and links it
  // back to the request it came from.
  isEmergency?: boolean;
  requestId?: string;
}

export type FmtSlotKey = string; // `${companyId}-${date}-${hour}`

export type FmtHistoryActor = 'slt' | 'contractor' | 'fmt';

export interface FmtSlotHistoryEntry {
  id: string;
  companyId: string;
  actor: FmtHistoryActor;
  actorName: string; // the individual (SLT scheduler, contractor rep, or FMT staff) who made the change
  action: string; // e.g. "Slots allocated", "Slots released", "Slots removed"
  slotChange: number; // signed delta, e.g. +9, -2, -1
  resultingAllocated: number; // running total after this change
  timestamp: string; // ISO
  note?: string;
}
