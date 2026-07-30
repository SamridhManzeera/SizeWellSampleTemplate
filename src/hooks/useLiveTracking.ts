import { useState, useEffect, useMemo } from 'react';
import { Vehicle, GPXData, JourneySummary, LiveTrackingFilters, TrackPoint, EnhancedVehicle, GeoFence, RouteException, GeoFenceState } from '../types/liveTracking';
import { fetchAndParseGPX, isPointInPolygon } from '../utils/gpxParser';
import { fetchCorrectSummary, fetchIncorrectSummary } from '../utils/csvParser';

const MOCK_VEHICLE_DETAILS: Record<string, {
  reg: string;
  bookingId: string;
  haulier: string;
  contractor: string;
  bookingType: string;
  timePeriod: string;
  northSouth: string;
  currentSpeedMph?: number;
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
}> = {
  'VEH-001': {
    reg: 'BX21 YZT',
    bookingId: 'BK-9876543',
    haulier: 'ACME Logistics',
    contractor: 'Contractor A',
    bookingType: 'Standard',
    timePeriod: 'Morning',
    northSouth: 'North',
    postedSpeedLimit: 50,
    harshBraking: 2,
    harshAcceleration: 1,
    idleTimeMin: 18,
    routeAdherence: 92,
    trackingVsPlannedSlot: 'On Track',
    fmfEntry: '08:12 21 May 2026',
    siteEntry: '08:45 21 May 2026',
    holdingAreaEntry: '09:02 21 May 2026',
    liveEta: '10:45',
    expectedEta: '11:00',
    etaDiff: '- 15 min early',
    ignitionStatus: 'ON',
    ignitionSince: '07:50',
    co3App: 'CO3',
    direction: 'Inbound',
  },
  'VEH-002': {
    reg: 'DK22 LPT',
    bookingId: 'BK-8723641',
    haulier: 'Suffolk Haulage',
    contractor: 'Contractor B',
    bookingType: 'Express',
    timePeriod: 'Morning',
    northSouth: 'South',
    postedSpeedLimit: 50,
    harshBraking: 0,
    harshAcceleration: 0,
    idleTimeMin: 2,
    routeAdherence: 100,
    trackingVsPlannedSlot: 'On Track',
    fmfEntry: '07:30 21 May 2026',
    siteEntry: '08:05 21 May 2026',
    holdingAreaEntry: '08:20 21 May 2026',
    liveEta: '08:35',
    expectedEta: '08:38',
    etaDiff: '- 3 min early',
    ignitionStatus: 'ON',
    ignitionSince: '07:00',
    co3App: 'App',
    direction: 'Outbound',
  },
  'VEH-003': {
    reg: 'EN19 FGH',
    bookingId: 'BK-7619283',
    haulier: 'Orwell Transport',
    contractor: 'Contractor A',
    bookingType: 'Standard',
    timePeriod: 'Afternoon',
    northSouth: 'North',
    postedSpeedLimit: 40,
    harshBraking: 1,
    harshAcceleration: 2,
    idleTimeMin: 12,
    routeAdherence: 85,
    trackingVsPlannedSlot: 'On Track',
    fmfEntry: '09:15 21 May 2026',
    siteEntry: '09:55 21 May 2026',
    holdingAreaEntry: '--',
    liveEta: '10:30',
    expectedEta: '10:20',
    etaDiff: '+ 10 min late',
    ignitionStatus: 'ON',
    ignitionSince: '09:00',
    co3App: 'CO3',
    direction: 'Inbound',
  },
  'VEH-004': {
    reg: 'FL23 XYZ',
    bookingId: 'BK-5529102',
    haulier: 'Orwell Transport',
    contractor: 'Contractor C',
    bookingType: 'Critical',
    timePeriod: 'Afternoon',
    northSouth: 'North',
    postedSpeedLimit: 50,
    harshBraking: 4,
    harshAcceleration: 3,
    idleTimeMin: 5,
    routeAdherence: 64,
    trackingVsPlannedSlot: 'Off Track',
    fmfEntry: '11:00 21 May 2026',
    siteEntry: '11:32 21 May 2026',
    holdingAreaEntry: '--',
    liveEta: '12:15',
    expectedEta: '12:00',
    etaDiff: '+ 15 min late',
    ignitionStatus: 'ON',
    ignitionSince: '10:45',
    co3App: 'App',
    direction: 'Inbound',
  },
  'VEH-005': {
    reg: 'GP20 QRS',
    bookingId: 'BK-1029384',
    haulier: 'IPS Logistics',
    contractor: 'Contractor D',
    bookingType: 'Standard',
    timePeriod: 'Evening',
    northSouth: 'South',
    postedSpeedLimit: 60,
    harshBraking: 5,
    harshAcceleration: 4,
    idleTimeMin: 8,
    routeAdherence: 72,
    trackingVsPlannedSlot: 'Off Track',
    fmfEntry: '12:30 21 May 2026',
    siteEntry: '13:02 21 May 2026',
    holdingAreaEntry: '--',
    liveEta: '13:40',
    expectedEta: '13:30',
    etaDiff: '+ 10 min late',
    ignitionStatus: 'ON',
    ignitionSince: '12:15',
    co3App: 'CO3',
    direction: 'Outbound',
  }
};


export function useLiveTracking() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [correctSummaries, setCorrectSummaries] = useState<JourneySummary[]>([]);
  const [incorrectSummaries, setIncorrectSummaries] = useState<JourneySummary[]>([]);
  const [geofences, setGeofences] = useState<GeoFence[]>([]);
  const [exceptions, setExceptions] = useState<RouteException[]>([]);
  
  // Cache for parsed GPX files: key is gpxPath
  const [gpxCache, setGpxCache] = useState<Record<string, GPXData>>({});
  
  const [mapFilters, setMapFilters] = useState<LiveTrackingFilters>({
    vehicleId: '',
    status: '',
    exception: '',
    bookingId: '',
    co3App: '',
    haulier: '',
    contractor: '',
    bookingType: '',
    timePeriod: '',
    northSouth: '',
    vehicleReg: '',
    dateFrom: '',
    dateTo: '',
    route: '',
    direction: '',
  });

  const [listingFilters, setListingFilters] = useState<LiveTrackingFilters>({
    vehicleId: '',
    status: '',
    exception: '',
    bookingId: '',
    co3App: '',
    haulier: '',
    contractor: '',
    bookingType: '',
    timePeriod: '',
    northSouth: '',
    vehicleReg: '',
    dateFrom: '',
    dateTo: '',
    route: '',
    direction: '',
  });
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch initial configurations & summaries
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch vehicles
      const vehResponse = await fetch('/live-tracking/vehicles.json');
      if (!vehResponse.ok) {
        throw new Error('Failed to load vehicles configuration.');
      }
      const vehData: Vehicle[] = await vehResponse.json();

      // Fetch Geofences
      const gfResponse = await fetch('/live-tracking/geofences.json');
      if (!gfResponse.ok) {
        throw new Error('Failed to load geofences configuration.');
      }
      const gfData: GeoFence[] = await gfResponse.json();
      setGeofences(gfData);

      // Fetch CSV summaries
      const correctCsv = await fetchCorrectSummary('/live-tracking/csv/correct_summary.csv');
      const incorrectCsv = await fetchIncorrectSummary('/live-tracking/csv/incorrect_summary.csv');
      
      setCorrectSummaries(correctCsv);
      setIncorrectSummaries(incorrectCsv);
      setVehicles(vehData);

      // Pre-fetch all GPX files in the background to avoid map lag
      const gpxPaths = new Set<string>();
      vehData.forEach(v => {
        if (v.gpxPath) gpxPaths.add(v.gpxPath);
        if (v.plannedGpxPath) gpxPaths.add(v.plannedGpxPath);
      });

      const tempCache: Record<string, GPXData> = {};
      await Promise.all(
        Array.from(gpxPaths).map(async (path) => {
          try {
            const parsed = await fetchAndParseGPX(path);
            tempCache[path] = parsed;
          } catch (e) {
            console.error(`Failed to prefetch GPX file at ${path}`, e);
          }
        })
      );
      setGpxCache(tempCache);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper: Get summary for a specific vehicle
  const getVehicleSummary = (vehicle: Vehicle): JourneySummary | null => {
    if (vehicle.csvRowIndex === null || vehicle.csvType === null) return null;
    const summaries = vehicle.csvType === 'correct' ? correctSummaries : incorrectSummaries;
    return summaries[vehicle.csvRowIndex] ?? null;
  };

  // Helper: Get GPX data for a path
  const getGpxData = (path: string | null): GPXData | null => {
    if (!path) return null;
    return gpxCache[path] ?? null;
  };

  // 2. Enhance vehicles with runtime summary & track points
  const enhancedVehicles: EnhancedVehicle[] = useMemo(() => {
    return vehicles.map(v => {
      const summary = getVehicleSummary(v);
      const gpx = getGpxData(v.gpxPath);
      const plannedGpx = getGpxData(v.plannedGpxPath);

      // Determine simulated progress: distribute vehicles dynamically based on configuration
      const progress = v.simulatedProgress ?? 0.85;

      let currentCoords: { lat: number; lon: number } = { lat: 52.02628, lon: 1.22374 }; // Default to Orwell Logistics Park
      let lastUpdated: string = summary?.endTime ?? new Date().toISOString();
      let currentSpeedMph = v.speedMph;
      let travelledPoints: TrackPoint[] = [];

      const rawTrackPoints = gpx ? gpx.trackPoints : [];
      const snappedPlannedPoints = plannedGpx ? plannedGpx.trackPoints : [];

      if (rawTrackPoints.length > 0) {
        const index = Math.floor(rawTrackPoints.length * progress);
        travelledPoints = rawTrackPoints.slice(0, index + 1);
        const pt = rawTrackPoints[index] ?? rawTrackPoints[rawTrackPoints.length - 1];
        currentCoords = { lat: pt.lat, lon: pt.lon };
        lastUpdated = pt.time ?? summary?.endTime ?? new Date().toISOString();
        currentSpeedMph = pt.speedMph > 0 ? pt.speedMph : v.speedMph;
      }

      // Determine compliance status dynamically based on Go Zones and No-Go Zones.
      let complianceStatus: 'Correct' | 'Incorrect' | 'Pending' = 'Pending';
      let deviationPoint: TrackPoint | null = null;
      let firstViolationIndex = -1;

      // Find active exceptions for this vehicle
      const activeExceptions = exceptions.filter(exc => {
        if (exc.vehicleId !== v.id && exc.vehicleId !== 'all') return false;
        
        const from = new Date(exc.validFrom).getTime();
        const until = new Date(exc.validUntil).getTime();
        
        // 1. Check system time
        const now = Date.now();
        if (now >= from && now <= until) return true;
        
        // 2. Check simulation time if available
        if (lastUpdated) {
          const simTime = new Date(lastUpdated).getTime();
          if (!isNaN(simTime) && simTime >= from && simTime <= until) return true;
        }
        
        return false;
      });

      // Map geofence entry and exit states
      const gfStates: GeoFenceState[] = geofences.map(gf => {
        let entered = false;
        let firstEntryIndex = -1;

        if (gf.coordinates && gf.coordinates.length > 0) {
          const poly = gf.coordinates[0];
          for (let i = 0; i < travelledPoints.length; i++) {
            const pt = travelledPoints[i];
            if (isPointInPolygon(pt.lat, pt.lon, poly)) {
              entered = true;
              if (firstEntryIndex === -1) {
                firstEntryIndex = i;
              }
            }
          }
        }

        // Calculate progress levels along the planned route
        let plannedEntryIndex = -1;
        let plannedExitIndex = -1;
        
        if (gf.type === 'go' && gf.coordinates && gf.coordinates.length > 0) {
          const poly = gf.coordinates[0];
          const indices = snappedPlannedPoints
            .map((pt, idx) => isPointInPolygon(pt.lat, pt.lon, poly) ? idx : -1)
            .filter(idx => idx !== -1);
          
          if (indices.length > 0) {
            plannedEntryIndex = indices[0];
            plannedExitIndex = indices[indices.length - 1];
          }
        }

        const entryProgress = plannedEntryIndex !== -1 ? (plannedEntryIndex / snappedPlannedPoints.length) : 0.0;
        const exitProgress = plannedExitIndex !== -1 ? (plannedExitIndex / snappedPlannedPoints.length) : 0.0;
        
        // A Go Zone is bypassed if the vehicle's progress has passed the exit of the Go Zone
        // but the vehicle never entered it
        const bypassed = gf.type === 'go' && progress >= exitProgress && !entered && plannedExitIndex !== -1;

        // Find matching active exception for this geofence
        const appliedException = activeExceptions.find(exc => {
          return exc.geofenceIds.includes(gf.id);
        }) ?? null;

        return {
          geofence: gf,
          entered,
          firstEntryIndex,
          bypassed,
          entryProgress,
          exitProgress,
          plannedEntryIndex,
          appliedException
        };
      });

      // Compliance Logic:
      // 1. Check No-Go violations (immediate violation if entered and no exception applies)
      const violatedNoGo = gfStates.find(state => state.geofence.type === 'no-go' && state.entered && !state.appliedException);
      
      // 2. Check mandatory Go Zone bypasses (violation if bypassed and no exception applies)
      const bypassedMandatoryGo = gfStates.find(state => state.geofence.type === 'go' && state.geofence.mandatory && state.bypassed && !state.appliedException);

      if (violatedNoGo) {
        complianceStatus = 'Incorrect';
        if (violatedNoGo.firstEntryIndex !== -1 && travelledPoints.length > 0) {
          deviationPoint = travelledPoints[violatedNoGo.firstEntryIndex];
          firstViolationIndex = violatedNoGo.firstEntryIndex;
        }
      } else if (bypassedMandatoryGo) {
        complianceStatus = 'Incorrect';
        if (travelledPoints.length > 0 && progress > 0) {
          const ratio = bypassedMandatoryGo.entryProgress / progress;
          firstViolationIndex = Math.min(Math.floor(travelledPoints.length * ratio), travelledPoints.length - 1);
          deviationPoint = travelledPoints[firstViolationIndex] || travelledPoints[travelledPoints.length - 1];
        }
      } else {
        // 3. Determine if we are still Pending (not yet entered any mandatory Go Zone, and haven't bypassed any yet)
        const anyMandatoryGoEntered = gfStates.some(state => state.geofence.type === 'go' && state.geofence.mandatory && state.entered);
        
        if (!anyMandatoryGoEntered) {
          complianceStatus = 'Pending';
        } else {
          complianceStatus = 'Correct';
        }
      }

      // Segment actual path into correct (green) and incorrect (red) portions
      let correctTrackPoints: TrackPoint[] = travelledPoints;
      let incorrectTrackPoints: TrackPoint[] = [];

      if (complianceStatus === 'Incorrect' && deviationPoint && firstViolationIndex !== -1) {
        correctTrackPoints = travelledPoints.slice(0, firstViolationIndex + 1);
        incorrectTrackPoints = travelledPoints.slice(firstViolationIndex);
      }

      let startLocation = 'Orwell Logistics Park';
      let endLocation = 'Sizewell C';
      if (gpx && gpx.waypoints.length >= 2) {
        startLocation = gpx.waypoints[0].name.split(',')[0].trim();
        endLocation = gpx.waypoints[gpx.waypoints.length - 1].name.split(',')[0].replace(' Power Station', '').trim();
      }

      let routeTitle = `${startLocation.replace(' Logistics Park', '')} to ${endLocation}`;
      if (complianceStatus === 'Incorrect') {
        routeTitle += ' (Deviated)';
      }

      const mockDetails = MOCK_VEHICLE_DETAILS[v.id] || {
        reg: v.id,
        bookingId: '',
        haulier: v.supplier || '',
        contractor: 'Contractor A',
        bookingType: 'Standard',
        timePeriod: 'Morning',
        northSouth: 'North',
        postedSpeedLimit: 50,
        harshBraking: 0,
        harshAcceleration: 0,
        idleTimeMin: 0,
        routeAdherence: 100,
        trackingVsPlannedSlot: 'On Track',
        fmfEntry: '--',
        siteEntry: '--',
        holdingAreaEntry: '--',
        liveEta: '--',
        expectedEta: '--',
        etaDiff: '',
        ignitionStatus: 'ON',
        ignitionSince: '--',
        co3App: 'CO3'
      };

      return {
        ...v,
        ...mockDetails,
        status: complianceStatus, // Override status dynamically based on geofence compliance!
        summary,
        trackPoints: travelledPoints, // Only show the path travelled so far!
        plannedTrackPoints: snappedPlannedPoints,
        correctTrackPoints,
        incorrectTrackPoints,
        currentCoords,
        lastUpdated,
        progress,
        currentSpeedMph: mockDetails.currentSpeedMph || currentSpeedMph,
        deviationPoint,
        routeTitle,
        startLocation,
        endLocation,
        gfStates,
        hasException: gfStates.some(state => state.appliedException !== null),
      };
    });
  }, [vehicles, correctSummaries, incorrectSummaries, gpxCache, geofences, exceptions]);

  // 3. Compute Metrics
  const metrics = useMemo(() => {
    const total = enhancedVehicles.length;
    const correct = enhancedVehicles.filter(v => v.status === 'Correct').length;
    const incorrect = enhancedVehicles.filter(v => v.status === 'Incorrect').length;
    const pending = enhancedVehicles.filter(v => v.status === 'Pending').length;

    return { total, correct, incorrect, pending };
  }, [enhancedVehicles]);

  // 4. Apply Filters separately for Map and Listing views
  const filteredVehiclesMap = useMemo(() => {
    return enhancedVehicles.filter(v => {
      if (mapFilters.vehicleId && v.id !== mapFilters.vehicleId) return false;
      if (mapFilters.status && v.status !== mapFilters.status) return false;
      if (mapFilters.exception) {
        const wantsException = mapFilters.exception === 'applied';
        if (v.hasException !== wantsException) return false;
      }
      if (mapFilters.bookingId && !v.bookingId.toLowerCase().includes(mapFilters.bookingId.toLowerCase())) return false;
      if (mapFilters.co3App && v.co3App !== mapFilters.co3App) return false;
      if (mapFilters.haulier && v.haulier !== mapFilters.haulier) return false;
      if (mapFilters.contractor && v.contractor !== mapFilters.contractor) return false;
      if (mapFilters.bookingType && v.bookingType !== mapFilters.bookingType) return false;
      if (mapFilters.timePeriod && v.timePeriod !== mapFilters.timePeriod) return false;
      if (mapFilters.northSouth && v.northSouth !== mapFilters.northSouth) return false;
      if (mapFilters.vehicleReg && !v.reg.toLowerCase().includes(mapFilters.vehicleReg.toLowerCase()) && !v.id.toLowerCase().includes(mapFilters.vehicleReg.toLowerCase())) return false;
      
      if (mapFilters.direction && v.direction !== mapFilters.direction) return false;
      
      // History filters
      if (mapFilters.route && !v.routeTitle.toLowerCase().includes(mapFilters.route.toLowerCase())) return false;
      if (mapFilters.dateFrom) {
        const fromTime = new Date(mapFilters.dateFrom).getTime();
        const vehicleTime = new Date(v.lastUpdated).getTime();
        if (!isNaN(vehicleTime) && vehicleTime < fromTime) return false;
      }
      if (mapFilters.dateTo) {
        const toTime = new Date(mapFilters.dateTo).getTime();
        const vehicleTime = new Date(v.lastUpdated).getTime();
        if (!isNaN(vehicleTime) && vehicleTime > toTime) return false;
      }
      return true;
    });
  }, [enhancedVehicles, mapFilters]);

  const filteredVehiclesListing = useMemo(() => {
    return enhancedVehicles.filter(v => {
      if (listingFilters.vehicleId && v.id !== listingFilters.vehicleId) return false;
      if (listingFilters.status && v.status !== listingFilters.status) return false;
      if (listingFilters.exception) {
        const wantsException = listingFilters.exception === 'applied';
        if (v.hasException !== wantsException) return false;
      }
      if (listingFilters.bookingId && !v.bookingId.toLowerCase().includes(listingFilters.bookingId.toLowerCase())) return false;
      if (listingFilters.co3App && v.co3App !== listingFilters.co3App) return false;
      if (listingFilters.haulier && v.haulier !== listingFilters.haulier) return false;
      if (listingFilters.contractor && v.contractor !== listingFilters.contractor) return false;
      if (listingFilters.bookingType && v.bookingType !== listingFilters.bookingType) return false;
      if (listingFilters.timePeriod && v.timePeriod !== listingFilters.timePeriod) return false;
      if (listingFilters.northSouth && v.northSouth !== listingFilters.northSouth) return false;
      if (listingFilters.vehicleReg && !v.reg.toLowerCase().includes(v.reg.toLowerCase()) && !v.id.toLowerCase().includes(listingFilters.vehicleReg.toLowerCase())) return false;
      if (listingFilters.direction && v.direction !== listingFilters.direction) return false;
      
      // History filters
      if (listingFilters.route && !v.routeTitle.toLowerCase().includes(listingFilters.route.toLowerCase())) return false;
      if (listingFilters.dateFrom) {
        const fromTime = new Date(listingFilters.dateFrom).getTime();
        const vehicleTime = new Date(v.lastUpdated).getTime();
        if (!isNaN(vehicleTime) && vehicleTime < fromTime) return false;
      }
      if (listingFilters.dateTo) {
        const toTime = new Date(listingFilters.dateTo).getTime();
        const vehicleTime = new Date(v.lastUpdated).getTime();
        if (!isNaN(vehicleTime) && vehicleTime > toTime) return false;
      }
      return true;
    });
  }, [enhancedVehicles, listingFilters]);

  // 5. Selected vehicle details
  const selectedVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return enhancedVehicles.find(v => v.id === selectedVehicleId) ?? null;
  }, [enhancedVehicles, selectedVehicleId]);

  // Action handlers
  const handleSelectVehicle = (id: string | null) => {
    setSelectedVehicleId(id);
    if (id) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const handleMapFilterChange = (key: keyof LiveTrackingFilters, value: string) => {
    setMapFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'status' && prev.vehicleId) {
        const selected = enhancedVehicles.find(v => v.id === prev.vehicleId);
        if (selected && selected.status !== value && value !== '') {
          next.vehicleId = '';
        }
      }
      return next;
    });
  };

  const handleListingFilterChange = (key: keyof LiveTrackingFilters, value: string) => {
    setListingFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'status' && prev.vehicleId) {
        const selected = enhancedVehicles.find(v => v.id === prev.vehicleId);
        if (selected && selected.status !== value && value !== '') {
          next.vehicleId = '';
        }
      }
      return next;
    });
  };

  const resetMapFilters = () => {
    setMapFilters({
      vehicleId: '',
      status: '',
      exception: '',
      bookingId: '',
      co3App: '',
      haulier: '',
      contractor: '',
      bookingType: '',
      timePeriod: '',
      northSouth: '',
      vehicleReg: '',
      dateFrom: '',
      dateTo: '',
      route: '',
    });
  };

  const resetListingFilters = () => {
    setListingFilters({
      vehicleId: '',
      status: '',
      exception: '',
      bookingId: '',
      co3App: '',
      haulier: '',
      contractor: '',
      bookingType: '',
      timePeriod: '',
      northSouth: '',
      vehicleReg: '',
      dateFrom: '',
      dateTo: '',
      route: '',
    });
  };

  const refreshData = () => {
    loadData();
  };

  const addException = (exc: RouteException | RouteException[]) => {
    if (Array.isArray(exc)) {
      setExceptions(prev => [...prev, ...exc]);
    } else {
      setExceptions(prev => [...prev, exc]);
    }
  };

  const removeException = (id: string) => {
    setExceptions(prev => prev.filter(exc => exc.id !== id));
  };

  return {
    vehicles: enhancedVehicles,
    filteredVehiclesMap,
    filteredVehiclesListing,
    geofences,
    metrics,
    mapFilters,
    listingFilters,
    selectedVehicle,
    isModalOpen,
    setIsModalOpen,
    loading,
    error,
    handleSelectVehicle,
    handleMapFilterChange,
    handleListingFilterChange,
    resetMapFilters,
    resetListingFilters,
    refreshData,
    exceptions,
    addException,
    removeException,
  };
}
