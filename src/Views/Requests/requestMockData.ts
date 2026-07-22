import { DeliveryRequest } from './requestTypes';

// Delivery windows are always a full Monday–Sunday week (selected via the
// WeekPicker); dailySlots only needs entries for the days that actually
// have slots, everything else in the week defaults to 0.
export const MOCK_REQUESTS: DeliveryRequest[] = [
  {
    id: 'REQ-001', kind: 'normal',
    startDate: '2026-06-22', endDate: '2026-06-28',
    dailySlots: { '2026-06-22': { inbound: 3, outbound: 2, twoWay: 1 } },
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route1a',
    status: 'approved', submittedAt: '2026-06-20T10:30:00Z',
    notes: 'Morning delivery preferred — before 10:00 AM.',
  },
  {
    id: 'REQ-002', kind: 'emergency',
    startDate: '2026-06-22', endDate: '2026-06-28',
    dailySlots: { '2026-06-23': { inbound: 0, outbound: 4, twoWay: 0 } },
    vehicleType: 'HDV_MDS', driverRoute: 'route1a',
    status: 'pending', submittedAt: '2026-06-21T08:15:00Z',
    notes: '',
  },
  {
    id: 'REQ-003', kind: 'normal',
    startDate: '2026-06-29', endDate: '2026-07-05',
    dailySlots: {
      '2026-06-30': { inbound: 2, outbound: 2, twoWay: 2 },
      '2026-07-01': { inbound: 1, outbound: 1, twoWay: 0 },
    },
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route2a',
    status: 'pending', submittedAt: '2026-06-22T14:00:00Z',
    notes: 'Two separate drops required.',
  },
  {
    id: 'REQ-004', kind: 'emergency',
    startDate: '2026-06-29', endDate: '2026-07-05',
    dailySlots: { '2026-07-02': { inbound: 5, outbound: 0, twoWay: 0 } },
    vehicleType: 'LGV_MDS', driverRoute: 'route1a',
    status: 'rejected', submittedAt: '2026-06-23T09:45:00Z',
    notes: 'Slot unavailable — please resubmit for 03 July.',
  },
  {
    id: 'REQ-005', kind: 'normal',
    startDate: '2026-06-29', endDate: '2026-07-05',
    dailySlots: { '2026-07-03': { inbound: 0, outbound: 3, twoWay: 1 } },
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route3a',
    status: 'approved', submittedAt: '2026-06-24T11:00:00Z',
    notes: '',
  },
  {
    id: 'REQ-006', kind: 'normal',
    startDate: '2026-07-06', endDate: '2026-07-12',
    dailySlots: { '2026-07-06': { inbound: 2, outbound: 1, twoWay: 0 } },
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route2a',
    status: 'pending', submittedAt: '2026-06-25T16:20:00Z',
    notes: 'Follow-up delivery for the following week.',
  },
];
