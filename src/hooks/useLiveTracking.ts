import { useState, useEffect, useMemo } from 'react';
import { Vehicle, GPXData, JourneySummary, LiveTrackingFilters, TrackPoint, EnhancedVehicle, GeoFence } from '../types/liveTracking';
import { fetchAndParseGPX, isPointInPolygon } from '../utils/gpxParser';
import { fetchCorrectSummary, fetchIncorrectSummary } from '../utils/csvParser';


export function useLiveTracking() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [correctSummaries, setCorrectSummaries] = useState<JourneySummary[]>([]);
  const [incorrectSummaries, setIncorrectSummaries] = useState<JourneySummary[]>([]);
  const [geofences, setGeofences] = useState<GeoFence[]>([]);
  
  // Cache for parsed GPX files: key is gpxPath
  const [gpxCache, setGpxCache] = useState<Record<string, GPXData>>({});
  
  const [mapFilters, setMapFilters] = useState<LiveTrackingFilters>({
    vehicleId: '',
    status: '',
  });

  const [listingFilters, setListingFilters] = useState<LiveTrackingFilters>({
    vehicleId: '',
    status: '',
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

      // Determine compliance status dynamically based on geofence entry and route deviation.
      let complianceStatus: 'On Route' | 'Off Route' | 'Monitoring Not Started' = 'Monitoring Not Started';
      let enteredGF1 = false;
      let firstGF1Index = -1;
      let enteredGF2 = false;

      const gf1 = geofences.find(gf => gf.id === 'geofence-1');
      const gf2 = geofences.find(gf => gf.id === 'geofence-2');

      // Check geofence entries in travelledPoints
      if (gf1 && gf1.coordinates && gf1.coordinates.length > 0) {
        const poly = gf1.coordinates[0];
        for (let i = 0; i < travelledPoints.length; i++) {
          const pt = travelledPoints[i];
          if (isPointInPolygon(pt.lat, pt.lon, poly)) {
            enteredGF1 = true;
            if (firstGF1Index === -1) {
              firstGF1Index = i;
            }
          }
        }
      }

      if (gf2 && gf2.coordinates && gf2.coordinates.length > 0) {
        const poly = gf2.coordinates[0];
        enteredGF2 = travelledPoints.some(pt => isPointInPolygon(pt.lat, pt.lon, poly));
      }

      // Compliance Logic:
      // - If enteredGF1 is false, monitoring has NOT started yet. Status = 'Monitoring Not Started'.
      // - If enteredGF1 is true, monitoring has started:
      //   - A vehicle is On Route (Correct) between GeoFence 1 and GeoFence 2. Detours are permitted.
      //   - It is only Off Route (Incorrect) if it passes GeoFence 2's checkpoint range (progress >= 90%)
      //     but has NOT entered the GeoFence 2 polygon.
      let deviationPoint: TrackPoint | null = null;

      if (enteredGF1 && firstGF1Index !== -1) {
        const hasPassedGF2 = progress >= 0.90;
        if (hasPassedGF2 && !enteredGF2) {
          complianceStatus = 'Off Route';
          // Since detours between GF1 and GF2 are allowed, the path only becomes wrong
          // once it enters the final Leiston/Sizewell zone (latitude >= 52.21) having bypassed GeoFence 2.
          deviationPoint = travelledPoints.find(pt => pt.lat >= 52.21) || null;
          if (!deviationPoint && travelledPoints.length > 0) {
            deviationPoint = travelledPoints[travelledPoints.length - 1];
          }
        } else {
          complianceStatus = 'On Route';
        }
      } else {
        complianceStatus = 'Monitoring Not Started';
      }

      // Segment actual path into correct (green) and incorrect (red) portions
      let correctTrackPoints: TrackPoint[] = travelledPoints;
      let incorrectTrackPoints: TrackPoint[] = [];

      if (complianceStatus === 'Off Route' && deviationPoint) {
        const dp = deviationPoint;
        const devIndex = travelledPoints.findIndex(
          pt => pt.lat === dp.lat && pt.lon === dp.lon
        );
        if (devIndex !== -1) {
          correctTrackPoints = travelledPoints.slice(0, devIndex + 1);
          incorrectTrackPoints = travelledPoints.slice(devIndex);
        }
      }

      let startLocation = 'Orwell Logistics Park';
      let endLocation = 'Sizewell C';
      if (gpx && gpx.waypoints.length >= 2) {
        startLocation = gpx.waypoints[0].name.split(',')[0].trim();
        endLocation = gpx.waypoints[gpx.waypoints.length - 1].name.split(',')[0].replace(' Power Station', '').trim();
      }

      let routeTitle = `${startLocation.replace(' Logistics Park', '')} to ${endLocation}`;
      if (complianceStatus === 'Off Route') {
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
      };
    });
  }, [vehicles, correctSummaries, incorrectSummaries, gpxCache, geofences]);

  // 3. Compute Metrics
  const metrics = useMemo(() => {
    const total = enhancedVehicles.length;
    const onRoute = enhancedVehicles.filter(v => v.status === 'On Route').length;
    const offRoute = enhancedVehicles.filter(v => v.status === 'Off Route').length;
    const monitoringNotStarted = enhancedVehicles.filter(v => v.status === 'Monitoring Not Started').length;

    return { total, onRoute, offRoute, monitoringNotStarted };
  }, [enhancedVehicles]);

  // 4. Apply Filters separately for Map and Listing views
  const filteredVehiclesMap = useMemo(() => {
    return enhancedVehicles.filter(v => {
      if (mapFilters.vehicleId && v.id !== mapFilters.vehicleId) return false;
      if (mapFilters.status && v.status !== mapFilters.status) return false;
      return true;
    });
  }, [enhancedVehicles, mapFilters]);

  const filteredVehiclesListing = useMemo(() => {
    return enhancedVehicles.filter(v => {
      if (listingFilters.vehicleId && v.id !== listingFilters.vehicleId) return false;
      if (listingFilters.status && v.status !== listingFilters.status) return false;
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
    }
  };

  const handleMapFilterChange = (key: keyof LiveTrackingFilters, value: string) => {
    setMapFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleListingFilterChange = (key: keyof LiveTrackingFilters, value: string) => {
    setListingFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetMapFilters = () => {
    setMapFilters({
      vehicleId: '',
      status: '',
    });
  };

  const resetListingFilters = () => {
    setListingFilters({
      vehicleId: '',
      status: '',
    });
  };

  const refreshData = () => {
    loadData();
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
  };
}
