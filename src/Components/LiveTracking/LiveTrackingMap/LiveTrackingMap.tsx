import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EnhancedVehicle } from '../../../types/liveTracking';
import Legend from '../Legend/Legend';
import './LiveTrackingMap.scss';

// Configure Mapbox access token from environment, with public fallback
mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
  import.meta.env.VITE_MAPBOX_TOKEN ||
  '';

interface LiveTrackingMapProps {
  vehicles: EnhancedVehicle[];
  filteredVehicles: EnhancedVehicle[];
  selectedVehicleId: string | null;
  filterVehicleId: string; // The filter dropdown selected vehicle ID
  onSelectVehicle: (id: string) => void;
}

export default function LiveTrackingMap({
  vehicles,
  filteredVehicles,
  selectedVehicleId,
  filterVehicleId,
  onSelectVehicle,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showPlannedRoute, setShowPlannedRoute] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v10', // clean professional light style
      center: [1.42, 52.12], // Suffolk center
      zoom: 9.8,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layers and markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    map.resize();

    // 1. Clean up existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 2. Clean up existing route sources and layers dynamically from the active style
    if (map.getStyle()) {
      const layers = map.getStyle().layers || [];
      layers.forEach(layer => {
        if (
          layer.id.startsWith('layer-actual-') ||
          layer.id.startsWith('layer-planned-')
        ) {
          map.removeLayer(layer.id);
          const sourceId = layer.id.replace('layer-', 'source-');
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        }
      });
    }







    // Determine Map Mode
    const isAnalysisMode = !!filterVehicleId;

    if (isAnalysisMode) {
      // --- ANALYSIS MODE ---
      // Show only the filtered vehicle
      const activeVehicle = vehicles.find(v => v.id === filterVehicleId);
      if (!activeVehicle) return;

      const trackPoints = (activeVehicle as any).trackPoints || [];
      const plannedPoints = (activeVehicle as any).plannedTrackPoints || [];

      // A. Draw planned route in Green (prominent) if showPlannedRoute is checked
      if (plannedPoints.length > 0 && showPlannedRoute) {
        const sourceId = `source-planned-${activeVehicle.id}`;
        const layerId = `layer-planned-${activeVehicle.id}`;
        const coordinates = plannedPoints.map((pt: any) => [pt.lon, pt.lat]);

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#16a34a', // prominent Green
            'line-width': 7.0,      // thicker, more visible
            'line-opacity': 0.9,
          },
        });
      }

      if (trackPoints.length > 0) {
        const sourceId = `source-actual-${activeVehicle.id}`;
        const layerId = `layer-actual-${activeVehicle.id}`;
        const coordinates = trackPoints.map((pt: any) => [pt.lon, pt.lat]);

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        const isDotted = showPlannedRoute && activeVehicle.status === 'Off Route';

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': activeVehicle.status === 'On Route' ? '#16a34a' : '#dc2626',
            'line-width': isDotted ? 3.0 : 4.5,      // thinner red dots
            'line-opacity': isDotted ? 0.70 : 0.85, // less visible red dots
            ...(isDotted ? { 'line-dasharray': [1.5, 1.5] } : {}),
          },
        });

        // Add interactive tooltip popup when clicking the actual route line if deviated
        if (activeVehicle.status === 'Off Route') {
          map.on('click', layerId, (e) => {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`<div class="lt-map-popup"><strong>Route Deviation</strong><br/>${activeVehicle.name} went off route here.</div>`)
              .addTo(map);
          });

          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }
      }

      // C. Draw Vehicle Marker
      const isHighlighted = selectedVehicleId === activeVehicle.id;
      const markerEl = document.createElement('div');
      markerEl.className = `lt-marker lt-marker--${activeVehicle.status.toLowerCase().replace(' ', '-')}${
        isHighlighted ? ' lt-marker--highlighted' : ''
      }`;
      
      const truckSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>';
      const vanSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"></path><path d="M18 9h4l2 3v4h-6V9z"></path><circle cx="7.5" cy="18.5" r="2.5"></circle><circle cx="19.5" cy="18.5" r="2.5"></circle></svg>';
      const typeLabel = activeVehicle.type === 'Truck' ? truckSvg : vanSvg;
      
      markerEl.innerHTML = `
        <span class="lt-marker__icon">${typeLabel}</span>
      `;
      
      markerEl.addEventListener('click', e => {
        e.stopPropagation();
        onSelectVehicle(activeVehicle.id);
      });

      const activeStatusClass = activeVehicle.status.toLowerCase().replace(' ', '-');
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
        .setHTML(`<div class="lt-map-popup"><strong>${activeVehicle.name}</strong> (${activeVehicle.id})<br/><span class="lt-map-popup__status lt-map-popup__status--${activeStatusClass}">${activeVehicle.status}</span></div>`);

      const vehicleMarker = new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
        .setLngLat([activeVehicle.currentCoords.lon, activeVehicle.currentCoords.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(vehicleMarker);

      // Draw dynamic start and end markers for active vehicle
      if (plannedPoints.length > 0) {
        const startPt = plannedPoints[0];
        const endPt = plannedPoints[plannedPoints.length - 1];

        // Start marker (Red)
        const startEl = document.createElement('div');
        startEl.className = 'lt-marker-start';
        startEl.title = `Start: ${activeVehicle.startLocation}`;
        const startPopup = new mapboxgl.Popup({ offset: 10, closeButton: false })
          .setHTML(`<div class="lt-map-popup"><strong>Start Origin</strong><br/>${activeVehicle.startLocation}</div>`);
        const startMarker = new mapboxgl.Marker({ element: startEl })
          .setLngLat([startPt.lon, startPt.lat])
          .setPopup(startPopup)
          .addTo(map);
        markersRef.current.push(startMarker);

        // End marker (Green)
        const endEl = document.createElement('div');
        endEl.className = 'lt-marker-end';
        endEl.title = `Destination: ${activeVehicle.endLocation}`;
        const endPopup = new mapboxgl.Popup({ offset: 10, closeButton: false })
          .setHTML(`<div class="lt-map-popup"><strong>Destination Target</strong><br/>${activeVehicle.endLocation}</div>`);
        const endMarker = new mapboxgl.Marker({ element: endEl })
          .setLngLat([endPt.lon, endPt.lat])
          .setPopup(endPopup)
          .addTo(map);
        markersRef.current.push(endMarker);
      }

      // D. Draw bounds and focus map

      // E. Fit Bounds to active track
      const pointsForBounds =
        activeVehicle.status === 'Off Route' ? [...plannedPoints, ...trackPoints] : plannedPoints;

      if (pointsForBounds.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        pointsForBounds.forEach((pt: any) => bounds.extend([pt.lon, pt.lat]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
      }
    } else {
      // --- FLEET OVERVIEW MODE ---
      // A. Draw the unified planned path in Fleet Overview Mode from start to end (uncropped)
      const representativeVehicle = vehicles.find(v => (v as any).plannedTrackPoints && (v as any).plannedTrackPoints.length > 0);
      if (representativeVehicle) {
        const plannedPoints = (representativeVehicle as any).plannedTrackPoints;
        const sourceId = 'source-planned-fleet';
        const layerId = 'layer-planned-fleet';
        const coordinates = plannedPoints.map((pt: any) => [pt.lon, pt.lat]);

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#16a34a', // prominent Green
            'line-width': 7.0,
            'line-opacity': 0.85,
          },
        });
      }

      // Draw routes for all active vehicles
      filteredVehicles.forEach(v => {
        const trackPoints = (v as any).trackPoints || [];
        if (trackPoints.length === 0) return;

        const sourceId = `source-actual-${v.id}`;
        const layerId = `layer-actual-${v.id}`;
        const coordinates = trackPoints.map((pt: any) => [pt.lon, pt.lat]);
        const color = v.status === 'On Route' ? '#16a34a' : '#dc2626';

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': v.id === selectedVehicleId ? 5.5 : 3.5,
            'line-opacity': 0.85,
          },
        });

        // Add interactive tooltip popup when clicking the deviation path
        if (v.status === 'Off Route') {
          map.on('click', layerId, (e) => {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`<div class="lt-map-popup"><strong>Route Deviation</strong><br/>${v.name} went off route here.</div>`)
              .addTo(map);
          });

          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }
      });

      // Draw dynamic start and end markers for all unique routes in Fleet Overview
      const drawnStartKeys = new Set<string>();
      const drawnEndKeys = new Set<string>();

      filteredVehicles.forEach(v => {
        const trackPoints = (v as any).trackPoints || [];
        if (trackPoints.length === 0) return;

        const firstPt = trackPoints[0];
        const lastPt = trackPoints[trackPoints.length - 1];

        if (firstPt && lastPt) {
          const startKey = `${firstPt.lon.toFixed(5)},${firstPt.lat.toFixed(5)}`;
          const endKey = `${lastPt.lon.toFixed(5)},${lastPt.lat.toFixed(5)}`;

          if (!drawnStartKeys.has(startKey)) {
            drawnStartKeys.add(startKey);
            const startEl = document.createElement('div');
            startEl.className = 'lt-marker-start';
            startEl.title = `Start: ${v.startLocation}`;
            const startPopup = new mapboxgl.Popup({ offset: 10, closeButton: false })
              .setHTML(`<div class="lt-map-popup"><strong>Start Origin</strong><br/>${v.startLocation}</div>`);
            const startMarker = new mapboxgl.Marker({ element: startEl })
              .setLngLat([firstPt.lon, firstPt.lat])
              .setPopup(startPopup)
              .addTo(map);
            markersRef.current.push(startMarker);
          }

          if (!drawnEndKeys.has(endKey)) {
            drawnEndKeys.add(endKey);
            const endEl = document.createElement('div');
            endEl.className = 'lt-marker-end';
            endEl.title = `Destination: ${v.endLocation}`;
            const endPopup = new mapboxgl.Popup({ offset: 10, closeButton: false })
              .setHTML(`<div class="lt-map-popup"><strong>Destination Target</strong><br/>${v.endLocation}</div>`);
            const endMarker = new mapboxgl.Marker({ element: endEl })
              .setLngLat([lastPt.lon, lastPt.lat])
              .setPopup(endPopup)
              .addTo(map);
            markersRef.current.push(endMarker);
          }
        }
      });

      // Draw markers for all filtered vehicles
      filteredVehicles.forEach(v => {
        const isHighlighted = selectedVehicleId === v.id;
        const markerEl = document.createElement('div');
        const statusClass = v.status.toLowerCase().replace(' ', '-');
        
        markerEl.className = `lt-marker lt-marker--${statusClass}${
          isHighlighted ? ' lt-marker--highlighted' : ''
        }`;
        
        const truckSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>';
        const vanSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"></path><path d="M18 9h4l2 3v4h-6V9z"></path><circle cx="7.5" cy="18.5" r="2.5"></circle><circle cx="19.5" cy="18.5" r="2.5"></circle></svg>';
        const typeLabel = v.type === 'Truck' ? truckSvg : vanSvg;
        
        markerEl.innerHTML = `
          <span class="lt-marker__icon">${typeLabel}</span>
        `;
        
        markerEl.addEventListener('click', e => {
          e.stopPropagation();
          onSelectVehicle(v.id);
        });

        const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
          .setHTML(`<div class="lt-map-popup"><strong>${v.name}</strong> (${v.id})<br/><span class="lt-map-popup__status lt-map-popup__status--${statusClass}">${v.status}</span></div>`);

        // Apply a small offset to prevent markers from stacking directly on top of each other on shared route geometry
        let lng = v.currentCoords.lon;
        let lat = v.currentCoords.lat;
        const index = vehicles.findIndex(veh => veh.id === v.id);
        if (index !== -1) {
          // approx 10-15 meters separation
          lng += (index - 3) * 0.00015;
          lat += (index - 3) * 0.00010;
        }

        const marker = new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);

      });

      // Fit bounds to show Orwell to Sizewell
      map.fitBounds(
        [
          [1.18, 52.0],
          [1.7, 52.25],
        ],
        { padding: 40, duration: 800 }
      );
    }
  }, [filteredVehicles, selectedVehicleId, filterVehicleId, mapLoaded, vehicles, showPlannedRoute]);

  const isAnalysisMode = !!filterVehicleId;
  const activeVehicle = isAnalysisMode ? vehicles.find(v => v.id === filterVehicleId) : null;

  return (
    <div className="lt-map-container">
      <div ref={mapContainerRef} className="lt-mapbox-map" />
      {isAnalysisMode && activeVehicle && activeVehicle.status === 'Off Route' && (
        <div className="lt-map-overlay">
          <label className="lt-map-overlay__checkbox-label">
            <input
              type="checkbox"
              checked={showPlannedRoute}
              onChange={e => setShowPlannedRoute(e.target.checked)}
              className="lt-map-overlay__checkbox"
            />
            Compare Planned Route
          </label>
        </div>
      )}
      <Legend />
    </div>
  );
}
