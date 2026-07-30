export interface Vehicle {
  id: string;
  name: string;
  type: 'Truck' | 'Van';
  speedMph: number;
  status: 'Correct' | 'Incorrect' | 'Pending';
  gpxPath: string | null;
  plannedGpxPath: string | null;
  simulatedProgress?: number;
  csvType: 'correct' | 'incorrect' | null;
  csvRowIndex: number | null;
  supplier?: string;
}

export interface TrackPoint {
  lat: number;
  lon: number;
  time: string | null;
  speedMps: number;
  speedMph: number;
  name?: string;
}

export interface Waypoint {
  lat: number;
  lon: number;
  name: string;
  comment?: string;
  desc?: string;
}

export interface GPXData {
  name: string;
  description: string;
  startTime: string | null;
  waypoints: Waypoint[];
  trackPoints: TrackPoint[];
}

export interface JourneySummary {
  speedMph: number;
  speedKphOrKmh: number;
  speedMps: number;
  distanceKm: number;
  distanceMiles: number;
  durationSeconds: number;
  durationHms: string;
  trackPointsCount: number;
  startTime: string;
  endTime: string;
}

export interface EnhancedVehicle extends Vehicle {
  summary: JourneySummary | null;
  trackPoints: TrackPoint[];
  plannedTrackPoints: TrackPoint[];
  correctTrackPoints: TrackPoint[];
  incorrectTrackPoints: TrackPoint[];
  currentCoords: { lat: number; lon: number };
  lastUpdated: string;
  progress: number;
  currentSpeedMph: number;
  deviationPoint: TrackPoint | null;
  routeTitle: string;
  startLocation: string;
  endLocation: string;
  gfStates: GeoFenceState[];
  hasException: boolean;
  reg: string;
  bookingId: string;
  haulier: string;
  contractor: string;
  bookingType: string;
  timePeriod: string;
  northSouth: string;
  postedSpeedLimit: number;
  harshBraking: number;
  harshAcceleration: number;
  idleTimeMin: number;
  routeAdherence: number;
  trackingVsPlannedSlot: string;
  fmfEntry: string;
  siteEntry: string;
  holdingAreaEntry: string;
  liveEta: string;
  expectedEta: string;
  etaDiff: string;
  ignitionStatus: string;
  ignitionSince: string;
  co3App: string;
  direction: 'Inbound' | 'Outbound';
}

export interface GeoFenceState {
  geofence: GeoFence;
  entered: boolean;
  firstEntryIndex: number;
  bypassed: boolean;
  entryProgress: number;
  exitProgress: number;
  plannedEntryIndex: number;
  appliedException: RouteException | null;
}

export interface RouteException {
  id: string;
  vehicleId: string;
  exceptionType: 'allow-missing-go' | 'allow-entering-no-go';
  geofenceIds: string[];
  reason: string;
  customReason?: string;
  description: string;
  validFrom: string;
  validUntil: string;
}

export interface LiveTrackingFilters {
  vehicleId: string;
  status: string;
  exception: string;
  bookingId?: string;
  co3App?: string;
  haulier?: string;
  contractor?: string;
  bookingType?: string;
  timePeriod?: string;
  northSouth?: string;
  vehicleReg?: string;
  dateFrom?: string;
  dateTo?: string;
  route?: string;
  direction?: string;
}

export interface GeoFence {
  id: string;
  name: string;
  description: string;
  type: 'go' | 'no-go';
  mandatory: boolean;
  priority: 'P1' | 'P2' | 'P3';
  coordinates: number[][][];
}

