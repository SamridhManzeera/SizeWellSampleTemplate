export interface FmtCompanyGroup {
  id: string;
  name: string;
}

export interface FmtCompany {
  id: string;
  name: string;
  groupId: string;
  allocatedCapacity: number;
}

export interface FmtBooking {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  hour: number;
  movementCount: number; // distributed from the company's Allocated capacity, set via Assign Slot
  bookedCount: number; // reported by the booking API (mock data here) — independent of movementCount
  notes: string;
  createdAt: string;
}

export type FmtSlotKey = string; // `${companyId}-${date}-${hour}`

export type FmtModalMode = 'create' | 'edit';

export interface FmtModalState {
  open: boolean;
  mode: FmtModalMode;
  companyId: string;
  hour: number;
  existingBooking?: FmtBooking;
}
