import { Notification } from './notificationTypes';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'form-submitted',
    title: 'Booking request submitted',
    description:
      'Apex Haulage Ltd submitted a new slot allotment request REQ-014',
    timestamp: '2026-06-26T09:47:00',
    read: false,
  },
  {
    id: 'n2',
    type: 'form-submitted',
    title: 'Emergency booking request submitted',
    description:
      'Orion Deliveries submitted an emergency slot request REQ-015',
    timestamp: '2026-06-26T09:45:00',
    read: false,
  },
  {
    id: 'n3',
    type: 'documents',
    title: 'Delivery documents uploaded',
    description:
      'Meridian Freight uploaded supporting documents for request REQ-012',
    timestamp: '2026-06-26T09:42:00',
    read: false,
  },
  {
    id: 'n4',
    type: 'modification',
    title: 'Slot request modified',
    description:
      'Summit Logistics updated the daily slot count for request REQ-010',
    timestamp: '2026-06-26T09:41:00',
    read: false,
  },
  {
    id: 'n5',
    type: 'approved',
    title: 'Booking request approved',
    description:
      'Request REQ-009 for Delta Transport Co. has been approved.',
    timestamp: '2026-06-25T16:12:00',
    read: true,
  },
  {
    id: 'n7',
    type: 'alert',
    title: 'Action required',
    description:
      'Request REQ-011 from Vantage Haulage is missing a required delivery document.',
    timestamp: '2026-06-24T14:30:00',
    read: true,
  },
];
