export interface CompanyGroup {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  groupId: string;
  assignedDeliveries: number;   // inbound + outbound + twoWay×2
  inboundDeliveries: number;
  outboundDeliveries: number;
  twoWayDeliveries: number;
}

export type RouteType   = 'inbound' | 'outbound' | 'twoWay';
export type RouteFilter = 'all' | 'inbound' | 'outbound' | 'twoWay';

export interface Allocation {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  hour: number;
  inboundCount: number;
  outboundCount: number;
  twoWayCount: number;
  bookedCount: number;
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
