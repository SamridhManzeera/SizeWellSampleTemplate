import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EnhancedVehicle, GeoFence } from '../../../types/liveTracking';
import VehicleDetailsPanel from '../VehicleDetailsPanel/VehicleDetailsPanel';
import './LiveTrackingMap.scss';

// Configure Mapbox access token from environment, with public fallback
mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
  import.meta.env.VITE_MAPBOX_TOKEN ||
  '';

const MAP_STYLES = [
  {
    id: 'light-v10',
    name: 'Default View',
    url: 'mapbox://styles/mapbox/light-v10',
    icon: '🗺️',
  },
  {
    id: 'streets',
    name: 'Road View',
    url: 'mapbox://styles/mapbox/streets-v12',
    icon: '🛣️',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: '🛰️',
  },
];

interface LiveTrackingMapProps {
  vehicles: EnhancedVehicle[];
  filteredVehicles: EnhancedVehicle[];
  selectedVehicleId: string | null;
  filterVehicleId: string; // The filter dropdown selected vehicle ID
  onSelectVehicle: (id: string | null) => void;
  geofences: GeoFence[];
  metrics: {
    total: number;
    correct: number;
    incorrect: number;
    pending: number;
  };
  mode: 'live' | 'history';
  onAddException: () => void;
}

export default function LiveTrackingMap({
  vehicles,
  filteredVehicles,
  selectedVehicleId,
  filterVehicleId,
  onSelectVehicle,
  geofences,
  metrics,
  mode,
  onAddException,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [activeStyle, setActiveStyle] = useState('mapbox://styles/mapbox/light-v10');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showPlannedRoute, setShowPlannedRoute] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: activeStyle,
      center: [1.42, 52.12], // Suffolk center
      zoom: 9.8,
      attributionControl: false,
      scrollZoom: false, // Disabled by default to allow natural page scrolling
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    // Enable zoom on click, disable on mouseleave
    map.on('click', () => {
      map.scrollZoom.enable();
      setIsZoomEnabled(true);
    });

    map.on('mouseleave', () => {
      map.scrollZoom.disable();
      setIsZoomEnabled(false);
    });

    // Listen to style.load to ensure layers are drawn initially and on style changes
    map.on('style.load', () => {
      setMapLoaded(true);
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStyleChange = (styleUrl: string) => {
    if (!mapRef.current || styleUrl === activeStyle) return;
    setMapLoaded(false);
    setActiveStyle(styleUrl);
    mapRef.current.setStyle(styleUrl);
  };

  // Update layers and markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    map.resize();

    // 1. Clean up existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 2. Clean up existing route, geofence and deviation layers and sources dynamically from the style
    if (map.getStyle()) {
      const layers = map.getStyle().layers || [];
      layers.forEach(layer => {
        if (
          layer.id.startsWith('layer-actual-') ||
          layer.id.startsWith('layer-planned-') ||
          layer.id.startsWith('layer-geofence-') ||
          layer.id.startsWith('layer-deviation-')
        ) {
          map.removeLayer(layer.id);
        }
      });

      const sources = map.getStyle().sources || {};
      Object.keys(sources).forEach(sourceId => {
        if (
          sourceId.startsWith('source-actual-') ||
          sourceId.startsWith('source-planned-') ||
          sourceId.startsWith('source-geofence-') ||
          sourceId.startsWith('source-deviation-')
        ) {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        }
      });
    }

    // 3. Draw approved geofence corridors
    geofences.forEach(gf => {
      const sourceId = `source-geofence-${gf.id}`;
      const fillLayerId = `layer-geofence-fill-${gf.id}`;
      const strokeLayerId = `layer-geofence-stroke-${gf.id}`;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: gf.name,
            description: gf.description,
          },
          geometry: {
            type: 'Polygon',
            coordinates: gf.coordinates,
          },
        },
      });

      const isGo = gf.type === 'go';
      const typeLabel = isGo ? 'Go Zone' : 'No-Go Zone';
      const mandatoryLabel = gf.mandatory ? 'Yes' : 'No';
      const fillColor = isGo ? '#6366f1' : '#ef4444';
      const strokeColor = isGo ? '#6366f1' : '#ef4444';
      const fillOpacity = isGo ? 0.12 : 0.18;

      // Semi-transparent fill
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': fillColor,
          'fill-opacity': fillOpacity,
        },
      });

      // Border outline
      map.addLayer({
        id: strokeLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': strokeColor,
          'line-width': 2.0,
          'line-opacity': 0.7,
          'line-dasharray': [2, 2],
        },
      });

      // Click event for details popup containing geofence metadata
      map.on('click', fillLayerId, (e) => {
        // Prevent click from bubbling to the map canvas
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }

        const popup = new mapboxgl.Popup({ offset: 10 })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="lt-map-popup" style="font-family: inherit; padding: 4px;">
              <strong style="font-size: 13px; display: block; margin-bottom: 4px; color: #1e293b;">${gf.name}</strong>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #475569; line-height: 1.4;">${gf.description}</p>
              <div style="display: grid; grid-template-columns: 80px auto; gap: 4px 8px; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 6px; font-weight: 500;">
                <span style="color: #64748b;">Type:</span>
                <span style="color: ${isGo ? '#6366f1' : '#ef4444'}; font-weight: 600;">${typeLabel}</span>
                
                ${isGo ? `
                  <span style="color: #64748b;">Mandatory:</span>
                  <span style="color: #1e293b; font-weight: 600;">${mandatoryLabel}</span>
                ` : ''}
                
                <span style="color: #64748b;">Priority:</span>
                <span style="color: ${gf.priority === 'P1' ? '#dc2626' : gf.priority === 'P2' ? '#d97706' : '#2563eb'}; font-weight: 600;">${gf.priority}</span>
              </div>
            </div>
          `)
          .addTo(map);

        const popupEl = popup.getElement();
        if (popupEl) {
          popupEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
          });
        }
      });

      map.on('mouseenter', fillLayerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', fillLayerId, () => {
        map.getCanvas().style.cursor = '';
      });
    });







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

      const correctPoints = (activeVehicle as any).correctTrackPoints || [];
      const incorrectPoints = (activeVehicle as any).incorrectTrackPoints || [];

      // Draw correct segment of actual route (Green)
      if (correctPoints.length > 0) {
        const correctSourceId = `source-actual-correct-${activeVehicle.id}`;
        const correctLayerId = `layer-actual-correct-${activeVehicle.id}`;
        const coordinates = correctPoints.map((pt: any) => [pt.lon, pt.lat]);

        map.addSource(correctSourceId, {
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
          id: correctLayerId,
          type: 'line',
          source: correctSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#16a34a', // Green
            'line-width': 4.5,
            'line-opacity': 0.85,
          },
        });
      }

      // Draw incorrect segment of actual route (Red)
      if (incorrectPoints.length > 0) {
        const incorrectSourceId = `source-actual-incorrect-${activeVehicle.id}`;
        const incorrectLayerId = `layer-actual-incorrect-${activeVehicle.id}`;
        const coordinates = incorrectPoints.map((pt: any) => [pt.lon, pt.lat]);

        map.addSource(incorrectSourceId, {
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

        const isDotted = showPlannedRoute;

        map.addLayer({
          id: incorrectLayerId,
          type: 'line',
          source: incorrectSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#dc2626', // Red
            'line-width': isDotted ? 3.0 : 4.5,
            'line-opacity': isDotted ? 0.70 : 0.85,
            ...(isDotted ? { 'line-dasharray': [1.5, 1.5] } : {}),
          },
        });

        // Add interactive tooltip popup when clicking the incorrect path
        map.on('click', incorrectLayerId, (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<div class="lt-map-popup"><strong>Route Deviation</strong><br/>${activeVehicle.name} went off route here.</div>`)
            .addTo(map);
        });

        map.on('mouseenter', incorrectLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', incorrectLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }

      // C. Draw Vehicle Marker
      const isHighlighted = selectedVehicleId === activeVehicle.id;
      const markerEl = document.createElement('div');
      markerEl.className = `lt-marker lt-marker--${activeVehicle.status.toLowerCase()}${
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

      const activeStatusClass = activeVehicle.status.toLowerCase();
      const activeStatusLabel = 
        activeVehicle.status === 'Correct' ? 'Correct' : 
        activeVehicle.status === 'Incorrect' ? 'Incorrect' : 'Pending Validation';
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
        .setHTML(`<div class="lt-map-popup"><strong>${activeVehicle.name}</strong> (${activeVehicle.id})<br/><span class="lt-map-popup__status lt-map-popup__status--${activeStatusClass}">${activeStatusLabel}</span></div>`);

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

      // Draw Deviation Marker if vehicle is incorrect and showPlannedRoute is checked (Compare Mode)
      if (activeVehicle.status === 'Incorrect' && activeVehicle.deviationPoint && showPlannedRoute) {
        const devSourceId = 'source-deviation-point';
        const devLayerId = 'layer-deviation-point';

        map.addSource(devSourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [activeVehicle.deviationPoint.lon, activeVehicle.deviationPoint.lat],
            },
          },
        });

        map.addLayer({
          id: devLayerId,
          type: 'symbol',
          source: devSourceId,
          layout: {
            'text-field': '⚠️',
            'text-size': 22,
            'text-allow-overlap': true,
          },
        });

        // Add interactive popup on click
        map.on('click', devLayerId, (e) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          const popup = new mapboxgl.Popup({ offset: 10 })
            .setLngLat(e.lngLat)
            .setHTML(`<div class="lt-map-popup"><strong>Deviation Point</strong><br/>Vehicle left approved corridor here.</div>`)
            .addTo(map);

          const popupEl = popup.getElement();
          if (popupEl) {
            popupEl.addEventListener('click', (ev) => {
              ev.stopPropagation();
            });
          }
        });

        map.on('mouseenter', devLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', devLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }

      // D. Draw bounds and focus map

      // E. Fit Bounds to active track
      const pointsForBounds =
        activeVehicle.status === 'Incorrect' ? [...plannedPoints, ...trackPoints] : plannedPoints;

      if (pointsForBounds.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        pointsForBounds.forEach((pt: any) => bounds.extend([pt.lon, pt.lat]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
      }
    } else {
      // --- FLEET OVERVIEW MODE ---


      // Draw routes for all active vehicles
      filteredVehicles.forEach(v => {
        const correctPoints = (v as any).correctTrackPoints || [];
        const incorrectPoints = (v as any).incorrectTrackPoints || [];

        // Draw correct segment of actual route (Green)
        if (correctPoints.length > 0) {
          const correctSourceId = `source-actual-correct-${v.id}`;
          const correctLayerId = `layer-actual-correct-${v.id}`;
          const coordinates = correctPoints.map((pt: any) => [pt.lon, pt.lat]);

          map.addSource(correctSourceId, {
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
            id: correctLayerId,
            type: 'line',
            source: correctSourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#16a34a', // Green
              'line-width': v.id === selectedVehicleId ? 5.5 : 3.5,
              'line-opacity': 0.85,
            },
          });
        }

        // Draw incorrect segment of actual route (Red)
        if (incorrectPoints.length > 0) {
          const incorrectSourceId = `source-actual-incorrect-${v.id}`;
          const incorrectLayerId = `layer-actual-incorrect-${v.id}`;
          const coordinates = incorrectPoints.map((pt: any) => [pt.lon, pt.lat]);

          map.addSource(incorrectSourceId, {
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
            id: incorrectLayerId,
            type: 'line',
            source: incorrectSourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#dc2626', // Red
              'line-width': v.id === selectedVehicleId ? 5.5 : 3.5,
              'line-opacity': 0.85,
            },
          });

          // Add interactive tooltip popup when clicking the incorrect path
          map.on('click', incorrectLayerId, (e) => {
            if (e.originalEvent) {
              e.originalEvent.stopPropagation();
            }
            const popup = new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`<div class="lt-map-popup"><strong>Route Deviation</strong><br/>${v.name} went off route here.</div>`)
              .addTo(map);

            const popupEl = popup.getElement();
            if (popupEl) {
              popupEl.addEventListener('click', (ev) => {
                ev.stopPropagation();
              });
            }
          });

          map.on('mouseenter', incorrectLayerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', incorrectLayerId, () => {
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
        const lastPt = (v as any).plannedTrackPoints && (v as any).plannedTrackPoints.length > 0
          ? (v as any).plannedTrackPoints[(v as any).plannedTrackPoints.length - 1]
          : trackPoints[trackPoints.length - 1];

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
        const statusClass = v.status.toLowerCase();
        
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

        const statusLabel = 
          v.status === 'Correct' ? 'Correct' : 
          v.status === 'Incorrect' ? 'Incorrect' : 'Pending Validation';
        const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
          .setHTML(`<div class="lt-map-popup"><strong>${v.name}</strong> (${v.id})<br/><span class="lt-map-popup__status lt-map-popup__status--${statusClass}">${statusLabel}</span></div>`);

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
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) ?? null;

  return (
    <div className="lt-map-container">
      <div ref={mapContainerRef} className="lt-mapbox-map" />

      {/* Floating Vehicle Details overlay */}
      {selectedVehicle && (
        <VehicleDetailsPanel
          vehicle={selectedVehicle}
          onClose={() => onSelectVehicle(null)}
        />
      )}

      {/* Map Style Switcher overlay */}
      <div className="lt-map-style-switcher">
        {MAP_STYLES.map(style => (
          <button
            key={style.id}
            type="button"
            className={`lt-map-style-switcher__btn ${
              activeStyle === style.url ? 'lt-map-style-switcher__btn--active' : ''
            }`}
            onClick={() => handleStyleChange(style.url)}
            title={style.name}
          >
            <span className="lt-map-style-switcher__icon">{style.icon}</span>
            <span className="lt-map-style-switcher__label">{style.name}</span>
          </button>
        ))}
      </div>

      {isAnalysisMode && activeVehicle && activeVehicle.status === 'Incorrect' && (
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

      {/* Add Exception button positioned top-right (where legend was) */}
      {mode !== 'history' && (
        <button
          type="button"
          className="lt-map-exception-btn"
          onClick={onAddException}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '6px' }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Exception
        </button>
      )}

      {/* Bottom Left Overlay Card: Validation Metrics */}
      <div className="lt-map-metrics-card">
        <div className="lt-map-metrics-card__item">
          <span className="lt-map-metrics-card__dot lt-map-metrics-card__dot--correct" />
          <span className="lt-map-metrics-card__label">Correct:</span>
          <span className="lt-map-metrics-card__val">{metrics.correct}</span>
        </div>
        <div className="lt-map-metrics-card__item">
          <span className="lt-map-metrics-card__dot lt-map-metrics-card__dot--incorrect" />
          <span className="lt-map-metrics-card__label">Incorrect:</span>
          <span className="lt-map-metrics-card__val">{metrics.incorrect}</span>
        </div>
        <div className="lt-map-metrics-card__item">
          <span className="lt-map-metrics-card__dot lt-map-metrics-card__dot--pending" />
          <span className="lt-map-metrics-card__label">Pending:</span>
          <span className="lt-map-metrics-card__val">{metrics.pending}</span>
        </div>
      </div>

      {/* Bottom Right Overlay Card: Live Vehicles by Type */}
      <div className="lt-vehicles-type-card">
        <h5 className="lt-vehicles-type-card__title">Live Vehicles By Type</h5>
        <div className="lt-vehicles-type-card__content">
          <div className="lt-vehicles-type-card__chart-wrapper">
            <svg width="68" height="68" viewBox="0 0 100 100">
              {/* Green Segment (53%): Dasharray "116.6 220", Offset "0" */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray="116.6 220"
                strokeDashoffset="0"
              />
              {/* Blue Segment (35%): Dasharray "77 220", Offset "-116.6" */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="10"
                strokeDasharray="77 220"
                strokeDashoffset="-116.6"
              />
              {/* Red Segment (12%): Dasharray "26.4 220", Offset "-193.6" */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="10"
                strokeDasharray="26.4 220"
                strokeDashoffset="-193.6"
              />
              <text
                x="50%"
                y="46%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="18"
                fontWeight="800"
                fill="#1e293b"
              >
                80
              </text>
              <text
                x="50%"
                y="66%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#64748b"
                letterSpacing="0.05em"
              >
                TOTAL
              </text>
            </svg>
          </div>
          <ul className="lt-vehicles-type-card__list">
            <li className="lt-vehicles-type-card__item">
              <span className="lt-vehicles-type-card__dot lt-vehicles-type-card__dot--hgv" />
              <span className="lt-vehicles-type-card__label">HGV</span>
              <span className="lt-vehicles-type-card__val">42 (53%)</span>
            </li>
            <li className="lt-vehicles-type-card__item">
              <span className="lt-vehicles-type-card__dot lt-vehicles-type-card__dot--lgv" />
              <span className="lt-vehicles-type-card__label">LGV</span>
              <span className="lt-vehicles-type-card__val">28 (35%)</span>
            </li>
            <li className="lt-vehicles-type-card__item">
              <span className="lt-vehicles-type-card__dot lt-vehicles-type-card__dot--other" />
              <span className="lt-vehicles-type-card__label">OTHER</span>
              <span className="lt-vehicles-type-card__val">10 (12%)</span>
            </li>
          </ul>
        </div>
      </div>

      {!isZoomEnabled && (
        <div className="lt-map-zoom-tip">
          💡 Click anywhere on the map to enable zoom
        </div>
      )}
    </div>
  );
}
