import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../Shared/Constants';
import { useSpaceRequests } from '../SpaceRequestsContext';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';

import esriConfig from '@arcgis/core/config.js';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';

import '@arcgis/core/assets/esri/themes/light/main.css';
import '../Shared/workArea.scss';

// Color for displaying the submitted request's own places (red / occupied)
const VIEW_PLACE_COLOR = [239, 68, 68]; // Red color for submitted / occupied areas

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5f3bf3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="15" y1="22" x2="15" y2="16" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <path d="M9 6h6M9 10h6M9 14h6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5f3bf3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

interface SpaceViewWorkAreaFormProps {
  request: SpaceRequestRecord;
  role?: 'supplier' | 'view';
}

/**
 * OAuth Token Fetcher (same as SpaceWorkAreaForm)
 */
async function fetchArcGISToken(clientId: string, clientSecret: string) {
  try {
    const response = await fetch('https://www.arcgis.com/sharing/rest/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        f: 'json'
      })
    });
    const data = await response.json();
    if (data.access_token) return data.access_token;
    if (data.error) console.error('ArcGIS token error:', data.error);
  } catch (error) {
    console.error('Failed to fetch ArcGIS token:', error);
  }
  return null;
}

export default function SpaceViewWorkAreaForm({ request, role = 'supplier' }: SpaceViewWorkAreaFormProps) {
  const isEnabled = request.modules.workArea;

  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const { requests } = useSpaceRequests();

  const [mapReady, setMapReady] = useState(false);

  const [activePopup, setActivePopup] = useState<boolean>(false);

  const requestRef = useRef(request);
  const roleRef = useRef(role);
  useEffect(() => {
    requestRef.current = request;
    roleRef.current = role;
  }, [request, role]);

  // State for hovering area tooltip
  const [hoverTooltip, setHoverTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // If the work area module wasn't enabled for this request, show a fallback
  if (!isEnabled) {
    const generalPath = `${ROUTES.SPACE_REQUESTS}/${request.id}`;
    return (
      <div className="sgf__card">
        <h2 className="sgf__section-title">Work Area</h2>
        <p>
          This module wasn&apos;t enabled for SRF {request.srfNumber}. Go back
          to <Link to={generalPath}>General</Link> to see what was submitted.
        </p>
      </div>
    );
  }

  // Initialize ArcGIS map on mount
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

      const map = new Map({ basemap: 'satellite' });

      view = new MapView({
        container: mapDivRef.current!,
        map: map,
        center: [1.618, 52.213],
        zoom: 15
      });
      viewRef.current = view;

      // Remove default zoom controls
      view.ui.remove('zoom');

      // Graphics layer for rendering submitted places
      const graphicsLayer = new GraphicsLayer();
      graphicsLayerRef.current = graphicsLayer;
      map.add(graphicsLayer);

      // Handle map hover (pointer-move)
      view.on('pointer-move', async (event: any) => {
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

      // Handle map clicks for reviewer details popup
      view.on('click', async (event: any) => {
        const hit = await view!.hitTest(event);
        const results = hit.results;
        const graphicResult = results.find(
          (r: any) => r.graphic && r.graphic.layer === graphicsLayerRef.current
        ) as any;

        if (graphicResult && roleRef.current === 'view') {
          setActivePopup(true);
        } else {
          setActivePopup(false);
        }
      });

      setMapReady(true);
    };

    initMap();

    return () => {
      active = false;
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (view) view.destroy();
    };
  }, []);

  // Draw request places on the map once it's ready, filtered by role and statusFilter
  useEffect(() => {
    const graphicsLayer = graphicsLayerRef.current;
    if (!graphicsLayer || !viewRef.current || !mapReady) return;

    graphicsLayer.removeAll();

    let placesToDraw: { place: any; color: number[] }[] = [];

    const getStatusColor = (status: string) => {
      if (status === 'Approved') return [34, 197, 94]; // Green
      if (status === 'Pending' || status === 'Submitted') return [249, 115, 22]; // Orange
      if (status === 'Rejected') return [239, 68, 68]; // Red
      return [239, 68, 68]; // Red (Draft, etc.)
    };

    if (role === 'view') {
      const color = getStatusColor(request.status);
      const places = request.places || [];
      places.forEach((pl: any) => {
        placesToDraw.push({ place: pl, color });
      });
    } else {
      // supplier role: only draw current request places in RED
      const color = VIEW_PLACE_COLOR; // Red [239, 68, 68]
      const places = request.places || [];
      places.forEach((pl: any) => {
        placesToDraw.push({ place: pl, color });
      });
    }

    placesToDraw.forEach(({ place, color }) => {
      const points = place.points.map((pt: any) => new Point({
        longitude: pt[0],
        latitude: pt[1],
        spatialReference: { wkid: 4326 }
      }));

      // Draw polygon for 3+ points
      if (points.length >= 3) {
        const rings = points.map((p: Point) => [p.longitude!, p.latitude!]);
        rings.push([points[0].longitude!, points[0].latitude!]); // close

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
            placeName: place.name || 'Place',
            type: 'polygon'
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
            placeName: place.name || 'Place',
            type: 'polygon'
          }
        });
        graphicsLayer.add(centerMarkerGraphic);
      }
    });

    // Auto-zoom to fit all places if any exist
    if (placesToDraw.length > 0) {
      const allPoints: Point[] = [];
      placesToDraw.forEach(({ place }) => {
        place.points.forEach((pt: any) => {
          allPoints.push(new Point({
            longitude: pt[0],
            latitude: pt[1],
            spatialReference: { wkid: 4326 }
          }));
        });
      });

      if (allPoints.length > 0 && viewRef.current) {
        viewRef.current.goTo(allPoints).catch((err: any) => {
          console.error('Failed to zoom to places:', err);
        });
      }
    }
  }, [requests, mapReady, role, request]);

  // Zoom handlers
  const handleZoomIn = () => {
    if (viewRef.current) {
      viewRef.current.goTo({ zoom: (viewRef.current.zoom || 15) + 1 });
    }
  };
  const handleZoomOut = () => {
    if (viewRef.current) {
      viewRef.current.goTo({ zoom: (viewRef.current.zoom || 15) - 1 });
    }
  };
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

        {/* Click details popup overlay for reviewer role */}
        {activePopup && (
          <div
            className="work-area-details-rich-popup"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 45,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '12px 16px',
              width: '280px',
              maxHeight: 'calc(100% - 20px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'var(--font-family, sans-serif)',
              textAlign: 'left',
            }}
          >
            {/* Header: Badge & Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: '#f3f0ff',
                  color: '#5f3bf3',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#5f3bf3', lineHeight: 1 }}>•</span> SPACE REQUEST
              </span>
              <button
                type="button"
                onClick={() => setActivePopup(false)}
                style={{
                  backgroundColor: '#121826',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  outline: 'none',
                }}
              >
                ✕
              </button>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '2px 0 0 0',
                lineHeight: '1.25',
              }}
            >
              {request.title || 'HTR Compound Boundary Fencing'}
            </h2>

            {/* Meta Rows (Company & Date Raised) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '2px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.78rem', fontWeight: 500 }}>
                <BuildingIcon />
                <span>{request.originatorCompanyName || 'Balfour Beatty'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.78rem', fontWeight: 500 }}>
                <CalendarIcon />
                <span>Raised {request.dateRaised || '03/11/2025'}</span>
              </div>
            </div>

            {/* SRF Number */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#5f3bf3', letterSpacing: '0.03em', textTransform: 'uppercase' }}>SRF Number</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', padding: '0px' }}>
                {request.srfNumber || '0041'}
              </div>
            </div>

            {/* Request Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#5f3bf3', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Request Status</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              </div>
              <div style={{ paddingTop: '2px' }}>
                <span
                  style={{
                    backgroundColor: request.status === 'Approved' ? '#22c55e' : request.status === 'Rejected' ? '#ef4444' : '#f97316',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'inline-block',
                  }}
                >
                  {request.status || 'Approved'}
                </span>
              </div>
            </div>

            {/* Organisation Details */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#5f3bf3', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Organisation Details</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>Teamcenter Number</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{request.teamcenterNumber || '101556014'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>Revision</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{request.revision || '001'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>Project / Contract Ref</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{request.projectContractRefNumber || 'ADW000-042'}</span>
                </div>
              </div>
            </div>

            {/* Site Details */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#5f3bf3', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Site Details</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>Mobilisation Date</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{request.mobilisationDate || '10/11/2025'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>Demobilisation Date</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{request.demobilisationDate || '31/12/2026'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>Plot Footprint</span>
                  <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{request.plotFootprint || 'Compound boundary 55m x 55m'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>Site Zone</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{request.siteZone || 'Zone 8'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hover area measurement details tooltip overlay */}
        {hoverTooltip && (
          <div
            className="work-area-hover-tooltip"
            style={{ left: hoverTooltip.x + 12, top: hoverTooltip.y + 12 }}
          >
            {hoverTooltip.text}
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

        {/* The ArcGIS Map */}
        <div ref={mapDivRef} className="work-area-map" />
      </div>
    </div>
  );
}
