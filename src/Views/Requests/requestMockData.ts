import { DeliveryRequest } from './requestTypes';

export const MOCK_REQUESTS: DeliveryRequest[] = [
  {
    id: 'REQ-001', kind: 'normal',
    deliveryDate: '2026-06-28',
    inboundCount: 3, outboundCount: 2, twoWayCount: 1,
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route1a',
    status: 'approved', submittedAt: '2026-06-20T10:30:00Z',
    notes: 'Morning delivery preferred — before 10:00 AM.',
  },
  {
    id: 'REQ-002', kind: 'emergency',
    deliveryDate: '2026-06-29',
    inboundCount: 0, outboundCount: 4, twoWayCount: 0,
    vehicleType: 'HDV_MDS', driverRoute: 'route1a',
    status: 'pending', submittedAt: '2026-06-21T08:15:00Z',
    notes: '',
  },
  {
    id: 'REQ-003', kind: 'normal',
    deliveryDate: '2026-06-30',
    inboundCount: 2, outboundCount: 2, twoWayCount: 2,
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route2a',
    status: 'pending', submittedAt: '2026-06-22T14:00:00Z',
    notes: 'Two separate drops required.',
  },
  {
    id: 'REQ-004', kind: 'emergency',
    deliveryDate: '2026-07-02',
    inboundCount: 5, outboundCount: 0, twoWayCount: 0,
    vehicleType: 'LGV_MDS', driverRoute: 'route1a',
    status: 'rejected', submittedAt: '2026-06-23T09:45:00Z',
    notes: 'Slot unavailable — please resubmit for 03 July.',
  },
  {
    id: 'REQ-005', kind: 'normal',
    deliveryDate: '2026-07-03',
    inboundCount: 0, outboundCount: 3, twoWayCount: 1,
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route3a',
    status: 'approved', submittedAt: '2026-06-24T11:00:00Z',
    notes: '',
  },
  {
    id: 'REQ-006', kind: 'normal',
    deliveryDate: '2026-07-05',
    inboundCount: 2, outboundCount: 1, twoWayCount: 0,
    vehicleType: 'HGV_ACA_MDS', driverRoute: 'route2a',
    status: 'pending', submittedAt: '2026-06-25T16:20:00Z',
    notes: 'Follow-up request for week 28.',
  },
];
