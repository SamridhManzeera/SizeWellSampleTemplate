export type VehicleType    = 'HDV_MDS' | 'LGV_MDS' | 'HGV_ACA_MDS';
export type RouteType      = 'inbound' | 'outbound' | 'twoWay';
export type RequestStatus  = 'pending' | 'approved' | 'rejected';
export type RequestKind    = 'normal' | 'emergency';

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  HDV_MDS:     'HDVs – HGVs & Buses into MDS',
  LGV_MDS:     'LGV into MDS',
  HGV_ACA_MDS: 'HGV between ACA and MDS',
};

export const ROUTE_TYPE_LABELS: Record<RouteType, string> = {
  inbound:  '↑ Inbound',
  outbound: '↓ Outbound',
  twoWay:   '↕ Two Way',
};

export interface Driver {
  id: string;
  name: string;
  email: string;
  contact: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
}

export interface DeliveryRequest {
  id: string;
  kind: RequestKind;
  deliveryDate: string;
  companyName: string;
  routeType: RouteType;
  drivers: Driver[];
  status: RequestStatus;
  submittedAt: string;
  notes: string;
}
