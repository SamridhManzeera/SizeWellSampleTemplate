import { useState, useEffect, useMemo } from 'react';
import { Vehicle, GPXData, JourneySummary, LiveTrackingFilters, TrackPoint, EnhancedVehicle, GeoFence, RouteException, GeoFenceState } from '../types/liveTracking';
import { fetchAndParseGPX, isPointInPolygon } from '../utils/gpxParser';
import { fetchCorrectSummary, fetchIncorrectSummary } from '../utils/csvParser';


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
  });

  const [listingFilters, setListingFilters] = useState<LiveTrackingFilters>({
    vehicleId: '',
    status: '',
    exception: '',
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

      return {
        ...v,
        status: complianceStatus, // Override status dynamically based on geofence compliance!
        summary,
        trackPoints: travelledPoints, // Only show the path travelled so far!
        plannedTrackPoints: snappedPlannedPoints,
        correctTrackPoints,
        incorrectTrackPoints,
        currentCoords,
        lastUpdated,
        progress,
        currentSpeedMph,
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
    });
  };

  const resetListingFilters = () => {
    setListingFilters({
      vehicleId: '',
      status: '',
      exception: '',
    });
  };

  const refreshData = () => {
    loadData();
  };

  const addException = (exc: RouteException) => {
    setExceptions(prev => [...prev, exc]);
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
