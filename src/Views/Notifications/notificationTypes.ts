export type NotificationType =
  | 'form-submitted'
  | 'documents'
  | 'modification'
  | 'approved'
  | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { label: string }
> = {
  'form-submitted': { label: 'Form Submitted' },
  documents: { label: 'Documents' },
  modification: { label: 'Modification' },
  approved: { label: 'Approved' },
  alert: { label: 'Alert' },
};
