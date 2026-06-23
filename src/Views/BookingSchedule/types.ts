export interface CompanyGroup {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  groupId: string;
  assignedDeliveries: number;
}

export type RouteType   = 'inbound' | 'outbound';
export type RouteFilter = 'all' | 'inbound' | 'outbound';

export interface Allocation {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  hour: number;
  inboundCount: number;
  outboundCount: number;
  notes: string;
  createdAt: string;
}

export type SlotKey = string; // `${companyId}-${date}-${hour}`

export type ModalMode = 'create' | 'edit';

export interface ModalState {
  open: boolean;
  mode: ModalMode;
  companyId: string;
  hour: number;
  existingAllocation?: Allocation;
}

export interface DrawerState {
  open: boolean;
  allocation: Allocation | null;
}
