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
}

export interface GeoFenceState {
  geofence: GeoFence;
  entered: boolean;
  firstEntryIndex: number;
  bypassed: boolean;
  entryProgress: number;
  exitProgress: number;
  plannedEntryIndex: number;
}

export interface LiveTrackingFilters {
  vehicleId: string;
  status: string;
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

