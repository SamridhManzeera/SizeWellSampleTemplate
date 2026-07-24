import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../Store';
import { useSpaceRequests } from '../SpaceRequestsContext';
import esriConfig from '@arcgis/core/config.js';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polyline from '@arcgis/core/geometry/Polyline.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';

import '@arcgis/core/assets/esri/themes/light/main.css';
import '../Shared/workArea.scss';

// =========================================================================
// TYPES & CONSTANTS
// =========================================================================
interface Place {
  id: string;
  name: string;
  points: Point[];
}

const CURRENT_PLACE_COLOR = [34, 197, 94]; // Green color for the current form's drawing
const SUBMITTED_PLACE_COLOR = [239, 68, 68]; // Red color for submitted / occupied areas

/**
 * OAuth Token Fetcher:
 * Exchanges the ArcGIS Client ID and Client Secret credentials for a temporary OAuth access token.
 */
async function fetchArcGISToken(clientId: string, clientSecret: string) {
  try {
    const response = await fetch('https://www.arcgis.com/sharing/rest/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        f: 'json'
      })
    });

    const data = await response.json();
    if (data.access_token) {
      return data.access_token;
    } else if (data.error) {
      console.error('ArcGIS OAuth token generation error details:', data.error);
    }
  } catch (error) {
    console.error('Failed to request token from ArcGIS REST API:', error);
  }
  return null;
}

export default function SpaceWorkAreaForm() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const { requests } = useSpaceRequests();

  // Redux date selectors for Work Area Start and End Dates
  const mobilisationDate = useSelector((state: RootState) => state.requestForm.mobilisationDate);
  const demobilisationDate = useSelector((state: RootState) => state.requestForm.demobilisationDate);

  // Sync refs to avoid stale closures in listeners
  const mobilisationDateRef = useRef(mobilisationDate);
  const demobilisationDateRef = useRef(demobilisationDate);
  useEffect(() => {
    mobilisationDateRef.current = mobilisationDate;
    demobilisationDateRef.current = demobilisationDate;
  }, [mobilisationDate, demobilisationDate]);

  // State for active place popover to remove marker area (active green areas with 3 or 4 points)
  const [activePlacePopover, setActivePlacePopover] = useState<{
    placeId: string;
    placeName: string;
    x: number;
    y: number;
  } | null>(null);

  // State for hovering area tooltip
  const [hoverTooltip, setHoverTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // State for tracking active cursor location on the map (for drawing draft dotted lines)
  const [cursorMapPoint, setCursorMapPoint] = useState<Point | null>(null);

  // State to hold active overlap warning toast messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // state Hook for Mapped Places:
  // Reconstructs point coordinates as ArcGIS Point instances upon loading.
  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem('sizewell_work_area_places');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => ({
          id: p.id,
          name: p.name,
          points: p.points.map(
            (pt: any) =>
              new Point({
                longitude: pt[0],
                latitude: pt[1],
                spatialReference: { wkid: 4326 }
              })
          )
        }));
      } catch (e) {
        console.error('Failed to parse saved places from localStorage:', e);
        return [];
      }
    }
    return [];
  });

  // Map & graphics layers references
  const viewRef = useRef<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);

  // Sync Hook for Event Listeners
  const placesRef = useRef(places);
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  // Sync Hook for Placing Marker State
  const isPlacingMarkerRef = useRef(isPlacingMarker);
  useEffect(() => {
    isPlacingMarkerRef.current = isPlacingMarker;
    if (viewRef.current && viewRef.current.container) {
      viewRef.current.container.style.cursor = isPlacingMarker ? 'crosshair' : 'default';
    }
    if (!isPlacingMarker) {
      setCursorMapPoint(null);
    }
  }, [isPlacingMarker]);

  // Persistence Hook
  useEffect(() => {
    const serialized = places.map((place) => ({
      id: place.id,
      name: place.name,
      points: place.points.map((p) => [p.longitude!, p.latitude!])
    }));
    localStorage.setItem('sizewell_work_area_places', JSON.stringify(serialized));
  }, [places]);

  // Map Initialization Hook
  useEffect(() => {
    let active = true;
    let view: MapView | null = null;
    let currentHoveredPlaceId: string | null = null;
    let hoverTimeout: NodeJS.Timeout | null = null;

    const initMap = async () => {
      const clientId = import.meta.env.VITE_ARCGIS_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_ARCGIS_CLIENT_SECRET;
      const staticToken = import.meta.env.VITE_ARCGIS_TOKEN;
      let activeToken = null;

      if (clientId && clientSecret && clientId !== 'YOUR_CLIENT_ID' && clientSecret !== 'YOUR_CLIENT_SECRET') {
        activeToken = await fetchArcGISToken(clientId, clientSecret);
      }

      if (activeToken) {
        esriConfig.apiKey = activeToken;
      } else if (staticToken) {
        esriConfig.apiKey = staticToken;
      }

      if (!active) return;

      const map = new Map({
        basemap: 'satellite'
      });

      view = new MapView({
        container: mapDivRef.current!,
        map: map,
        center: [1.618, 52.213], // Centered at Sizewell C site area in Suffolk
        zoom: 15
      });
      viewRef.current = view;

      // Remove default zoom controls for custom toolbar look
      view.ui.remove('zoom');

      // Add graphics layer to render custom placed markers and boundaries
      const graphicsLayer = new GraphicsLayer();
      graphicsLayerRef.current = graphicsLayer;
      map.add(graphicsLayer);

      // Handle map clicks
      view.on('click', async (event: any) => {
        if (isPlacingMarkerRef.current) {
          const mapPoint = view!.toMap({ x: event.x, y: event.y });
          if (mapPoint) {
            handleMapClick(mapPoint);
          }
          return;
        }

        const hit = await view!.hitTest(event);
        const results = hit.results;
        const graphicResult = results.find(
          (r: any) => r.graphic && r.graphic.layer === graphicsLayerRef.current
        ) as any;

        if (graphicResult) {
          const attributes = graphicResult.graphic.attributes;
          if (attributes && attributes.placeId) {
            const isSubmitted = !!attributes.isSubmitted;
            if (isSubmitted) {
              setActivePlacePopover(null);
            } else {
              const matchedPlace = placesRef.current.find((p) => p.id === attributes.placeId);
              if (matchedPlace && (matchedPlace.points.length === 3 || matchedPlace.points.length === 4)) {
                // Show active place deletion popover (for current drawing green areas)
                setActivePlacePopover({
                  placeId: matchedPlace.id,
                  placeName: matchedPlace.name,
                  x: event.x,
                  y: event.y
                });
              }
            }
          }
        } else {
          setActivePlacePopover(null);
        }
      });

      // Handle pointer moves (for measurement tooltips & dotted draft drawing guides)
      view.on('pointer-move', async (event: any) => {
        const mapPoint = view!.toMap({ x: event.x, y: event.y });
        if (isPlacingMarkerRef.current && mapPoint) {
          setCursorMapPoint(mapPoint);
        }

        const hit = await view!.hitTest(event);
        const results = hit.results;
        const graphicResult = results.find(
          (r: any) => r.graphic && r.graphic.layer === graphicsLayerRef.current
        ) as any;

        if (graphicResult && graphicResult.graphic && graphicResult.graphic.geometry && graphicResult.graphic.geometry.type === 'polygon') {
          const geom = graphicResult.graphic.geometry as Polygon;
          const attributes = graphicResult.graphic.attributes;
          const placeId = attributes?.placeId || 'temp';

          setHoverTooltip((prev) => {
            if (prev) {
              return { ...prev, x: event.x, y: event.y };
            }
            return null;
          });

          if (currentHoveredPlaceId !== placeId) {
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }
            currentHoveredPlaceId = placeId;

            const area = Math.abs(geometryEngine.geodesicArea(geom, 'square-meters'));
            const formattedArea = Math.round(area).toLocaleString() + ' m²';

            hoverTimeout = setTimeout(() => {
              setHoverTooltip({
                text: formattedArea,
                x: event.x,
                y: event.y
              });
            }, 500);
          }
        } else {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
          }
          currentHoveredPlaceId = null;
          setHoverTooltip(null);
        }
      });

      setMapReady(true);
    };

    initMap();

    return () => {
      active = false;
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (view) view.destroy();
    };
  }, []);

  // Syncs the display graphics layers whenever places state changes or the map view loads.
  useEffect(() => {
    const graphicsLayer = graphicsLayerRef.current;
    if (!graphicsLayer || !viewRef.current || !mapReady) return;

    graphicsLayer.removeAll();

    // 1. Render all submitted places from requests in RED
    requests.forEach((req: any) => {
      if (req.places && req.places.length > 0) {
        req.places.forEach((place: any) => {
          const points = place.points.map((pt: any) => new Point({
            longitude: pt[0],
            latitude: pt[1],
            spatialReference: { wkid: 4326 }
          }));

          const color = SUBMITTED_PLACE_COLOR;

          if (points.length >= 3) {
            const rings = points.map((p: Point) => [p.longitude!, p.latitude!]);
            rings.push([points[0].longitude!, points[0].latitude!]); // close loop

            const polygon = new Polygon({
              rings: [rings] as any,
              spatialReference: { wkid: 4326 }
            });

            const polygonGraphic = new Graphic({
              geometry: polygon,
              symbol: {
                type: 'simple-fill',
                color: [...color, 0.25] as any,
                outline: {
                  color: color,
                  width: 2.5,
                  style: 'solid'
                }
              } as any,
              attributes: {
                placeId: place.id,
                type: 'polygon',
                isSubmitted: true
              }
            });
            graphicsLayer.add(polygonGraphic);

            // Add center location marker pin at polygon centroid
            const centerMarkerGraphic = new Graphic({
              geometry: polygon.centroid,
              symbol: {
                type: 'simple-marker',
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                color: color,
                size: 13,
                yoffset: 6,
                outline: {
                  color: '#ffffff',
                  width: 1
                }
              } as any,
              attributes: {
                placeId: place.id,
                type: 'polygon',
                isSubmitted: true
              }
            });
            graphicsLayer.add(centerMarkerGraphic);
          }
        });
      }
    });

    // 2. Render current form active places in GREEN
    places.forEach((place) => {
      const color = CURRENT_PLACE_COLOR;

      // Draw markers for all clicked vertices
      place.points.forEach((p, idx) => {
        const markerGraphic = new Graphic({
          geometry: p,
          symbol: {
            type: 'simple-marker',
            color: color,
            size: idx === 0 ? 10 : 8,
            outline: {
              color: '#ffffff',
              width: 1.5
            }
          } as any,
          attributes: {
            placeId: place.id,
            type: 'vertex'
          }
        });
        graphicsLayer.add(markerGraphic);
      });

      // Draw polyline border if 2 vertices placed
      if (place.points.length === 2) {
        const polyline = new Polyline({
          paths: [[
            [place.points[0].longitude!, place.points[0].latitude!],
            [place.points[1].longitude!, place.points[1].latitude!]
          ]],
          spatialReference: { wkid: 4326 }
        });
        const lineGraphic = new Graphic({
          geometry: polyline,
          symbol: {
            type: 'simple-line',
            color: color,
            width: 2.5
          } as any,
          attributes: {
            placeId: place.id,
            type: 'line'
          }
        });
        graphicsLayer.add(lineGraphic);
      }

      // Draw polygon area if 3 or 4 vertices placed
      if (place.points.length >= 3) {
        const rings = place.points.map((p) => [p.longitude!, p.latitude!]);
        rings.push([place.points[0].longitude!, place.points[0].latitude!]); // close

        const polygon = new Polygon({
          rings: [rings],
          spatialReference: { wkid: 4326 }
        });

        const polygonGraphic = new Graphic({
          geometry: polygon,
          symbol: {
            type: 'simple-fill',
            color: [...color, 0.2] as any,
            outline: {
              color: color,
              width: 2.5,
              style: 'solid'
            }
          } as any,
          attributes: {
            placeId: place.id,
            type: 'polygon'
          }
        });
        graphicsLayer.add(polygonGraphic);
      }
    });

    // 3. Render current active drawing guideline dotted lines
    const incompletePlace = places.find((p) => p.points.length < 4);
    if (incompletePlace && incompletePlace.points.length > 0 && cursorMapPoint) {
      const activeColor = CURRENT_PLACE_COLOR;
      const pts = incompletePlace.points;

      // Draw dotted guide line from last vertex to current cursor position
      const lastPt = pts[pts.length - 1];
      const dottedGuideLine = new Polyline({
        paths: [[[lastPt.longitude!, lastPt.latitude!], [cursorMapPoint.longitude!, cursorMapPoint.latitude!]]],
        spatialReference: { wkid: 4326 }
      });
      const dottedGraphic = new Graphic({
        geometry: dottedGuideLine,
        symbol: {
          type: 'simple-line',
          color: activeColor,
          width: 1.5,
          style: 'dash'
        } as any
      });
      graphicsLayer.add(dottedGraphic);

      // If drawing a 3rd or 4th point, also draw dotted guide back to the first vertex
      if (pts.length >= 2) {
        const firstPt = pts[0];
        const dottedClosingLine = new Polyline({
          paths: [[[firstPt.longitude!, firstPt.latitude!], [cursorMapPoint.longitude!, cursorMapPoint.latitude!]]],
          spatialReference: { wkid: 4326 }
        });
        const dottedClosingGraphic = new Graphic({
          geometry: dottedClosingLine,
          symbol: {
            type: 'simple-line',
            color: activeColor,
            width: 1.5,
            style: 'dash'
          } as any
        });
        graphicsLayer.add(dottedClosingGraphic);
      }
    }
  }, [places, mapReady, cursorMapPoint, requests]);

  // Helper to check if new coordinate overlaps with already submitted occupied places
  const checkCollision = (newPt: Point, activePlacePoints: Point[]): any | null => {
    for (const req of requests) {
      if (req.places && req.places.length > 0) {
        for (const p of req.places) {
          if (p.points && p.points.length >= 3) {
            const rings = p.points.map((pt: any) => [pt[0], pt[1]]);
            if (rings[0][0] !== rings[rings.length - 1][0] || rings[0][1] !== rings[rings.length - 1][1]) {
              rings.push([rings[0][0], rings[0][1]]);
            }
            const submittedPoly = new Polygon({
              rings: [rings],
              spatialReference: { wkid: 4326 }
            });

            // Case 1: Point is inside the occupied polygon
            if (geometryEngine.contains(submittedPoly, newPt)) {
              return req;
            }

            // Case 2: Polyline segment from last point to this point intersects the occupied polygon
            if (activePlacePoints.length > 0) {
              const lastPt = activePlacePoints[activePlacePoints.length - 1];
              const polyline = new Polyline({
                paths: [[[lastPt.longitude!, lastPt.latitude!], [newPt.longitude!, newPt.latitude!]]],
                spatialReference: { wkid: 4326 }
              });
              if (geometryEngine.intersects(submittedPoly, polyline)) {
                return req;
              }
            }
          }
        }
      }
    }
    return null;
  };

  // Map Click Handler: Adds coordinates to the list of places.
  const handleMapClick = (mapPoint: Point) => {
    const currentPlacesList = placesRef.current;

    // Check if drawing limit is reached
    const incompleteIndex = currentPlacesList.findIndex((p) => p.points.length < 4);
    const activePoints = incompleteIndex !== -1 ? currentPlacesList[incompleteIndex].points : [];

    // Perform collision check with already submitted/occupied spaces
    const collidingReq = checkCollision(mapPoint, activePoints);
    if (collidingReq) {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToastMessage(`Area is occupied from ${collidingReq.mobilisationDate} to ${collidingReq.demobilisationDate}, please select a different date.`);
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return; // Block adding coordinates!
    }

    if (incompleteIndex !== -1) {
      // Add point to the existing active place
      setPlaces((prev) => {
        const next = [...prev];
        const updatedPoints = [...next[incompleteIndex].points, mapPoint];
        next[incompleteIndex] = {
          ...next[incompleteIndex],
          points: updatedPoints
        };
        return next;
      });
    } else {
      // All places completed. Start a new one if limit not reached
      if (currentPlacesList.length < 4) {
        const newPlace: Place = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: `Place ${currentPlacesList.length + 1}`,
          points: [mapPoint]
        };
        setPlaces((prev) => [...prev, newPlace]);
      }
    }
  };

  // Place Deletion Handler
  const handleDeletePlace = (placeId: string) => {
    setPlaces((prev) => {
      const filtered = prev.filter((p) => p.id !== placeId);
      return filtered.map((p, idx) => ({
        ...p,
        name: `Place ${idx + 1}`
      }));
    });
  };

  // Zoom In Handler
  const handleZoomIn = () => {
    if (viewRef.current) {
      viewRef.current.goTo({ zoom: viewRef.current.zoom + 1 });
    }
  };

  // Zoom Out Handler
  const handleZoomOut = () => {
    if (viewRef.current) {
      viewRef.current.goTo({ zoom: viewRef.current.zoom - 1 });
    }
  };

  // Reset View Handler
  const handleResetView = () => {
    if (viewRef.current) {
      viewRef.current.goTo({
        center: [1.618, 52.213],
        zoom: 15,
        tilt: 0,
        heading: 0
      } as any);
    }
  };

  return (
    <div className="work-area-layout work-area-layout--full">
      <div className="work-area-map-wrapper">
        {/* Upper Left Toolbar */}
        <div className="work-area-toolbar">
          <button
            type="button"
            className={`work-area-place-marker-btn ${isPlacingMarker ? 'work-area-place-marker-btn--active' : ''}`}
            onClick={() => setIsPlacingMarker(!isPlacingMarker)}
          >
            <svg className="work-area-pin-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <line x1="12" y1="7" x2="12" y2="13" />
              <line x1="9" y1="10" x2="15" y2="10" />
            </svg>
            Place Marker
          </button>
        </div>

        {/* Upper Right Zoom Controls */}
        <div className="work-area-zoom-controls">
          <button type="button" className="work-area-zoom-btn" onClick={handleZoomIn}>
            +
          </button>
          <button type="button" className="work-area-zoom-btn" onClick={handleZoomOut}>
            −
          </button>
        </div>

        {/* Bottom Right Reset View Button */}
        <button type="button" className="work-area-reset-btn" onClick={handleResetView}>
          <span className="work-area-icon-reset">🧭</span> Reset View
        </button>

        {/* Hover area measurement details tooltip overlay */}
        {hoverTooltip && (
          <div
            className="work-area-hover-tooltip"
            style={{ left: hoverTooltip.x + 12, top: hoverTooltip.y + 12 }}
          >
            {hoverTooltip.text}
          </div>
        )}

        {/* Interactive deletion popover bubble for active drawn places */}
        {activePlacePopover && (
          <div
            className="work-area-active-popover"
            style={{ left: activePlacePopover.x, top: activePlacePopover.y }}
          >
            <div className="work-area-active-popover-content">
              <span>{activePlacePopover.placeName}</span>
              <button
                type="button"
                className="work-area-active-popover-delete"
                onClick={() => {
                  handleDeletePlace(activePlacePopover.placeId);
                  setActivePlacePopover(null);
                }}
              >
                Remove Marker Area
              </button>
            </div>
            <button
              type="button"
              className="work-area-active-popover-close"
              onClick={() => setActivePlacePopover(null)}
              title="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* Mapped status legend capsule */}
        <div className="work-area-legend-capsule">
          <div className="work-area-legend-capsule-item">
            <span className="legend-dot-ring">
              <span className="legend-dot legend-dot--occupied" />
            </span>
            <span>Occupied</span>
          </div>
          <div className="work-area-legend-capsule-item">
            <span className="legend-dot-ring">
              <span className="legend-dot legend-dot--unoccupied" />
            </span>
            <span>My Markers</span>
          </div>
        </div>

        {toastMessage && (
          <div className="work-area-toast">
            <span className="work-area-toast-icon">⚠️</span>
            <span className="work-area-toast-text">{toastMessage}</span>
          </div>
        )}

        {/* The ArcGIS Div */}
        <div ref={mapDivRef} className="work-area-map" />
      </div>
    </div>
  );
}
