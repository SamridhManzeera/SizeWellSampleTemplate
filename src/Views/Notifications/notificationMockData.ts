import { Notification } from './notificationTypes';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'form-submitted',
    title: 'Request submitted successfully',
    description:
      'Request was submitted successfully by Tom Holland',
    timestamp: '2026-06-26T09:47:00',
    read: false,
  },
  {
    id: 'n2',
    type: 'documents',
    title: 'Documents uploaded successfully',
    description:
      'Tom Holland has uploaded documents for Request',
    timestamp: '2026-06-26T09:42:00',
    read: false,
  },
  {
    id: 'n3',
    type: 'modification',
    title: 'Form modified',
    description:
      'Request has been modified by Tom Holland',
    timestamp: '2026-06-26T09:41:00',
    read: false,
  },
  {
    id: 'n4',
    type: 'approved',
    title: 'Request approved',
    description:
      'Request has been approved by the Manager',
    timestamp: '2026-06-25T16:12:00',
    read: true,
  },
  {
    id: 'n5',
    type: 'alert',
    title: 'Action required',
    description:
      'Request is missing a required delivery document',
    timestamp: '2026-06-25T11:05:00',
    read: true,
  },
];
