import { FmtCompany, FmtCompanyGroup, FmtBooking } from './types';

export const FMT_MOCK_GROUPS: FmtCompanyGroup[] = [
  { id: 'g201', name: '201' },
  { id: 'g203', name: '203' },
  { id: 'g204', name: '204' },
  { id: 'g206', name: '206' },
  { id: 'g208', name: '208' },
];

// allocatedCapacity = total movements this company may be assigned per day
export const FMT_MOCK_COMPANIES: FmtCompany[] = [
  { id: 'f1', name: 'Apex Haulage Ltd', groupId: 'g201', allocatedCapacity: 9 },
  { id: 'f2', name: 'Meridian Freight', groupId: 'g201', allocatedCapacity: 7 },
  {
    id: 'f3',
    name: 'Summit Logistics',
    groupId: 'g203',
    allocatedCapacity: 13,
  },
  {
    id: 'f4',
    name: 'Delta Transport Co.',
    groupId: 'g203',
    allocatedCapacity: 11,
  },
  { id: 'f5', name: 'Orion Deliveries', groupId: 'g203', allocatedCapacity: 9 },
  { id: 'f6', name: 'Vantage Haulage', groupId: 'g203', allocatedCapacity: 7 },
  {
    id: 'f7',
    name: 'Nexus Freight Ltd',
    groupId: 'g204',
    allocatedCapacity: 9,
  },
  {
    id: 'f8',
    name: 'Pioneer Supply Co.',
    groupId: 'g206',
    allocatedCapacity: 7,
  },
  {
    id: 'f9',
    name: 'Sterling Logistics',
    groupId: 'g208',
    allocatedCapacity: 8,
  },
];

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const today = dateOffset(0);
const yesterday = dateOffset(-1);
const tomorrow = dateOffset(1);

// bookedCount is sourced from the booking API (mocked here) — it is not
// derived from movementCount, and may be lower than what was allocated.
export const FMT_MOCK_BOOKINGS: FmtBooking[] = [
  // ── Today ──────────────────────────────────────────────────────
  {
    id: 'b1',
    companyId: 'f5',
    companyName: 'Orion Deliveries',
    date: today,
    hour: 0,
    movementCount: 4,
    bookedCount: 3,
    notes: 'Solar toilet units — handle with care',
    createdAt: `${today}T00:15:00.000Z`,
  },
  {
    id: 'b2',
    companyId: 'f6',
    companyName: 'Vantage Haulage',
    date: today,
    hour: 0,
    movementCount: 2,
    bookedCount: 2,
    notes: 'Steel fixings — priority unload',
    createdAt: `${today}T00:20:00.000Z`,
  },
  {
    id: 'b3',
    companyId: 'f5',
    companyName: 'Orion Deliveries',
    date: today,
    hour: 2,
    movementCount: 3,
    bookedCount: 2,
    notes: 'Second load — concrete blocks',
    createdAt: `${today}T02:10:00.000Z`,
  },
  {
    id: 'b4',
    companyId: 'f6',
    companyName: 'Vantage Haulage',
    date: today,
    hour: 2,
    movementCount: 1,
    bookedCount: 1,
    notes: 'Small parts delivery',
    createdAt: `${today}T02:05:00.000Z`,
  },
  {
    id: 'b5',
    companyId: 'f7',
    companyName: 'Nexus Freight Ltd',
    date: today,
    hour: 1,
    movementCount: 4,
    bookedCount: 3,
    notes: 'Structural beams — heavy load',
    createdAt: `${today}T01:00:00.000Z`,
  },
  {
    id: 'b6',
    companyId: 'f3',
    companyName: 'Summit Logistics',
    date: today,
    hour: 5,
    movementCount: 2,
    bookedCount: 1,
    notes: 'Electrical conduit boxes',
    createdAt: `${today}T05:30:00.000Z`,
  },
  {
    id: 'b7',
    companyId: 'f4',
    companyName: 'Delta Transport Co.',
    date: today,
    hour: 6,
    movementCount: 3,
    bookedCount: 3,
    notes: 'Plumbing fittings batch 2',
    createdAt: `${today}T06:00:00.000Z`,
  },
  {
    id: 'b8',
    companyId: 'f8',
    companyName: 'Pioneer Supply Co.',
    date: today,
    hour: 5,
    movementCount: 2,
    bookedCount: 1,
    notes: 'Insulation panels',
    createdAt: `${today}T05:45:00.000Z`,
  },
  {
    id: 'b9',
    companyId: 'f9',
    companyName: 'Sterling Logistics',
    date: today,
    hour: 0,
    movementCount: 1,
    bookedCount: 1,
    notes: 'Urgent: safety equipment',
    createdAt: `${today}T00:05:00.000Z`,
  },
  {
    id: 'b10',
    companyId: 'f9',
    companyName: 'Sterling Logistics',
    date: today,
    hour: 4,
    movementCount: 3,
    bookedCount: 2,
    notes: 'Secondary shipment',
    createdAt: `${today}T04:00:00.000Z`,
  },
  // ── Yesterday ──────────────────────────────────────────────────
  {
    id: 'b11',
    companyId: 'f1',
    companyName: 'Apex Haulage Ltd',
    date: yesterday,
    hour: 8,
    movementCount: 4,
    bookedCount: 4,
    notes: 'Aggregate delivery',
    createdAt: `${yesterday}T08:00:00.000Z`,
  },
  {
    id: 'b12',
    companyId: 'f3',
    companyName: 'Summit Logistics',
    date: yesterday,
    hour: 10,
    movementCount: 3,
    bookedCount: 2,
    notes: 'Roofing materials',
    createdAt: `${yesterday}T10:00:00.000Z`,
  },
  {
    id: 'b13',
    companyId: 'f7',
    companyName: 'Nexus Freight Ltd',
    date: yesterday,
    hour: 14,
    movementCount: 2,
    bookedCount: 1,
    notes: 'Paint and sealant',
    createdAt: `${yesterday}T14:00:00.000Z`,
  },
  // ── Tomorrow ───────────────────────────────────────────────────
  {
    id: 'b14',
    companyId: 'f2',
    companyName: 'Meridian Freight',
    date: tomorrow,
    hour: 9,
    movementCount: 3,
    bookedCount: 2,
    notes: 'Pre-scheduled morning delivery',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b15',
    companyId: 'f5',
    companyName: 'Orion Deliveries',
    date: tomorrow,
    hour: 13,
    movementCount: 3,
    bookedCount: 3,
    notes: 'Afternoon concrete pour supplies',
    createdAt: new Date().toISOString(),
  },
];

export function buildFmtSlotKey(
  companyId: string,
  date: string,
  hour: number
): string {
  return `${companyId}-${date}-${hour}`;
}
