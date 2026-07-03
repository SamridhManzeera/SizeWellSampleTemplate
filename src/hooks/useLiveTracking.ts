import { useState, useEffect, useMemo } from 'react';
import { Vehicle, GPXData, JourneySummary, LiveTrackingFilters, TrackPoint, EnhancedVehicle } from '../types/liveTracking';
import { fetchAndParseGPX, findDeviationPoint } from '../utils/gpxParser';
import { fetchCorrectSummary, fetchIncorrectSummary } from '../utils/csvParser';

export function useLiveTracking() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [correctSummaries, setCorrectSummaries] = useState<JourneySummary[]>([]);
  const [incorrectSummaries, setIncorrectSummaries] = useState<JourneySummary[]>([]);
  
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

      // Determine simulated progress: distribute vehicles at different sections along the route
      let progress = 0.85;
      if (v.id === 'VEH-001') progress = 0.35;      // Near Woodbridge deviation point (incorrect path)
      else if (v.id === 'VEH-002') progress = 0.50; // At midpoint
      else if (v.id === 'VEH-003') progress = 0.95; // Near destination target
      else if (v.id === 'VEH-004') progress = 0.15; // Near starting point
      else if (v.id === 'VEH-005') progress = 0.75; // At three-quarter marker

      let currentCoords: { lat: number; lon: number } = { lat: 52.02628, lon: 1.22374 }; // Default to Orwell Logistics Park
      let lastUpdated: string = summary?.endTime ?? new Date().toISOString();
      let currentSpeedMph = v.speedMph;

      if (gpx && gpx.trackPoints.length > 0) {
        const index = Math.floor(gpx.trackPoints.length * progress);
        const pt = gpx.trackPoints[index] ?? gpx.trackPoints[gpx.trackPoints.length - 1];
        currentCoords = { lat: pt.lat, lon: pt.lon };
        lastUpdated = pt.time ?? summary?.endTime ?? new Date().toISOString();
        currentSpeedMph = pt.speedMph > 0 ? pt.speedMph : v.speedMph;
      }

      // Calculate deviation point if applicable
      let deviationPoint: TrackPoint | null = null;
      if (v.status === 'Off Route' && gpx && plannedGpx) {
        deviationPoint = findDeviationPoint(plannedGpx.trackPoints, gpx.trackPoints, 120);
      }

      let startLocation = 'Orwell Logistics Park';
      let endLocation = 'Sizewell C';
      if (gpx && gpx.waypoints.length >= 2) {
        startLocation = gpx.waypoints[0].name.split(',')[0].trim();
        endLocation = gpx.waypoints[gpx.waypoints.length - 1].name.split(',')[0].replace(' Power Station', '').trim();
      }

      let routeTitle = `${startLocation.replace(' Logistics Park', '')} to ${endLocation}`;
      if (v.status === 'Off Route') {
        routeTitle += ' (Deviated)';
      }

      return {
        ...v,
        summary,
        trackPoints: gpx?.trackPoints ?? [],
        plannedTrackPoints: plannedGpx?.trackPoints ?? [],
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
  }, [vehicles, correctSummaries, incorrectSummaries, gpxCache]);

  // 3. Compute Metrics
  const metrics = useMemo(() => {
    const total = enhancedVehicles.length;
    const onRoute = enhancedVehicles.filter(v => v.status === 'On Route').length;
    const offRoute = enhancedVehicles.filter(v => v.status === 'Off Route').length;

    return { total, onRoute, offRoute };
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
