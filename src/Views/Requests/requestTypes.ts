export type VehicleType    = 'HDV_MDS' | 'LGV_MDS' | 'HGV_ACA_MDS';
export type RouteType      = 'inbound' | 'outbound' | 'twoWay';
export type RequestStatus  = 'pending' | 'approved' | 'rejected';
export type RequestKind    = 'normal' | 'emergency';
export type DriverRoute    = 'route1a' | 'route2a' | 'route3a';

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  HDV_MDS:     'HDVs – HGVs & Buses into MDS',
  LGV_MDS:     'LGV into MDS',
  HGV_ACA_MDS: 'HGV between ACA and MDS',
};

export const DRIVER_ROUTE_LABELS: Record<DriverRoute, string> = {
  route1a: 'Route 1a',
  route2a: 'Route 2a',
  route3a: 'Route 3a',
};

export const DRIVER_ROUTE_DESCRIPTIONS: Record<DriverRoute, string> = {
  route1a: 'HGV route from the A12/A14 junction at Seven Hills via the A12 to the A12/B1122 junction at Yoxford and then along the B1122 and Lovers Lane to the required site access point (TCA, ACA or MCA)',
  route2a: 'HGV route from Lowestoft Port via the A12 to the A12/B1122 junction at Yoxford and then along the B1122 and Lovers Lane to the required site access point (TCA, ACA or MCA)',
  route3a: 'HGV route from Beccles (at A145/A146 junction) via the A145 to the A145/A12 junction, then along the A12, to the A12/B1122 junction at Yoxford, and then along the B1122 and Lovers Lane to the required site access point (TCA, ACA or MCA)',
};

export const ROUTE_TYPE_LABELS: Record<RouteType, string> = {
  inbound:  '↑ Inbound',
  outbound: '↓ Outbound',
  twoWay:   '↕ Two Way',
};

export interface DaySlotCounts {
  inbound: number;
  outbound: number;
  twoWay: number;
}

export interface RequestAttachment {
  name: string;
  size: number;
}

export interface DeliveryRequest {
  id: string;
  kind: RequestKind;
  startDate: string;
  endDate: string;
  dailySlots: Record<string, DaySlotCounts>;
  vehicleType: VehicleType;
  driverRoute: DriverRoute;
  notes: string;
  attachments?: RequestAttachment[];
  status: RequestStatus;
  submittedAt: string;
}

export function totalSlotsForRequest(req: DeliveryRequest): number {
  return Object.values(req.dailySlots).reduce(
    (sum, c) => sum + c.inbound + c.outbound + c.twoWay * 2,
    0,
  );
}
