import { DeliveryRequest } from './requestTypes';

export const MOCK_REQUESTS: DeliveryRequest[] = [
  {
    id: 'REQ-001', kind: 'normal',
    deliveryDate: '2026-06-28', companyName: 'Apex Haulage Ltd', routeType: 'inbound',
    status: 'approved', submittedAt: '2026-06-20T10:30:00Z',
    notes: 'Morning delivery preferred — before 10:00 AM.',
    drivers: [
      { id: 'd1', name: 'James Whitfield', email: 'j.whitfield@apex.com', contact: '+44 7700 900001', vehicleNumber: 'AB12 CDE', vehicleType: 'HGV_ACA_MDS' },
      { id: 'd2', name: 'Sandra Osei',     email: 's.osei@apex.com',      contact: '+44 7700 900002', vehicleNumber: 'FG34 HIJ', vehicleType: 'LGV_MDS'     },
    ],
  },
  {
    id: 'REQ-002', kind: 'emergency',
    deliveryDate: '2026-06-29', companyName: 'BlueStar Logistics', routeType: 'outbound',
    status: 'pending', submittedAt: '2026-06-21T08:15:00Z', notes: '',
    drivers: [
      { id: 'd3', name: 'Tom Adeyemi', email: 'tom@bluestar.co.uk', contact: '+44 7700 900003', vehicleNumber: 'KL56 MNO', vehicleType: 'HDV_MDS' },
    ],
  },
  {
    id: 'REQ-003', kind: 'normal',
    deliveryDate: '2026-06-30', companyName: 'NovaTrans UK', routeType: 'twoWay',
    status: 'pending', submittedAt: '2026-06-22T14:00:00Z', notes: 'Two separate drops required.',
    drivers: [
      { id: 'd4', name: 'Priya Nair',  email: 'p.nair@novatrans.com',  contact: '+44 7700 900004', vehicleNumber: 'PQ78 RST', vehicleType: 'HGV_ACA_MDS' },
      { id: 'd5', name: 'Connor Hyde', email: 'c.hyde@novatrans.com',  contact: '+44 7700 900005', vehicleNumber: 'UV90 WXY', vehicleType: 'LGV_MDS'     },
      { id: 'd6', name: 'Mei Lin',     email: 'mei.lin@novatrans.com', contact: '+44 7700 900006', vehicleNumber: 'ZA11 BCD', vehicleType: 'HDV_MDS'     },
    ],
  },
  {
    id: 'REQ-004', kind: 'emergency',
    deliveryDate: '2026-07-02', companyName: 'Greenfield Freight', routeType: 'inbound',
    status: 'rejected', submittedAt: '2026-06-23T09:45:00Z',
    notes: 'Slot unavailable — please resubmit for 03 July.',
    drivers: [
      { id: 'd7', name: 'Oliver Banks', email: 'o.banks@greenfield.co.uk', contact: '+44 7700 900007', vehicleNumber: 'EF22 GHI', vehicleType: 'LGV_MDS' },
    ],
  },
  {
    id: 'REQ-005', kind: 'normal',
    deliveryDate: '2026-07-03', companyName: 'Ironclad Haulage', routeType: 'outbound',
    status: 'approved', submittedAt: '2026-06-24T11:00:00Z', notes: '',
    drivers: [
      { id: 'd8', name: 'Rachel Owens', email: 'r.owens@ironclad.co.uk', contact: '+44 7700 900008', vehicleNumber: 'JK33 LMN', vehicleType: 'HGV_ACA_MDS' },
    ],
  },
  {
    id: 'REQ-006', kind: 'normal',
    deliveryDate: '2026-07-05', companyName: 'Apex Haulage Ltd', routeType: 'inbound',
    status: 'pending', submittedAt: '2026-06-25T16:20:00Z', notes: 'Follow-up request for week 28.',
    drivers: [
      { id: 'd9', name: 'James Whitfield', email: 'j.whitfield@apex.com', contact: '+44 7700 900001', vehicleNumber: 'AB12 CDE', vehicleType: 'HGV_ACA_MDS' },
    ],
  },
];
