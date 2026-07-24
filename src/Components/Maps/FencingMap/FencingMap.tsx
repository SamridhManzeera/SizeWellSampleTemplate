import { useEffect, useRef, useState } from 'react';
import esriConfig from '@arcgis/core/config.js';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';

import '@arcgis/core/assets/esri/themes/light/main.css';
import { deriveFenceRenderStatus, DUMMY_FENCING_ZONES, FencingZone } from './fencingDummyData';
import FencingDetailDrawer from './FencingDetailDrawer';
import './fencingMap.scss';

const ACTIVE_FENCE_COLOR = [239, 68, 68]; // Red for active fencing
const PLANNED_FENCE_COLOR = [217, 119, 6]; // Amber for planned fencing

const SITE_CENTER: [number, number] = [1.618, 52.213]; // Sizewell C site area, Suffolk
const DEFAULT_ZOOM = 15;

/**
 * Exchanges the ArcGIS Client ID and Client Secret for a temporary OAuth access token.
 * Runs before map initialization so satellite tiles load using authorized credentials.
 */
async function fetchArcGISToken(clientId: string, clientSecret: string) {
  try {
    const response = await fetch('https://www.arcgis.com/sharing/rest/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        f: 'json',
      }),
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

export default function FencingMap() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const [hoverTooltip, setHoverTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const [selectedFence, setSelectedFence] = useState<{
    zone: FencingZone;
    areaSqMeters: number;
  } | null>(null);

  // Map Initialization: sets up the ArcGIS satellite map centered on the site,
  // wires the graphics layer, and attaches a hover listener for fence tooltips.
  useEffect(() => {
    let active = true;
    let view: MapView | null = null;
    let currentHoveredFenceId: string | null = null;
    let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

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
        map,
        center: SITE_CENTER,
        zoom: DEFAULT_ZOOM,
      });
      viewRef.current = view;

      view.ui.remove('zoom');

      const graphicsLayer = new GraphicsLayer();
      graphicsLayerRef.current = graphicsLayer;
      map.add(graphicsLayer);

      view.on('click', async (event: any) => {
        const hit = await view!.hitTest(event);
        const graphicResult = hit.results.find(
          (r: any) => r.graphic && r.graphic.layer === graphicsLayerRef.current
        ) as any;

        const fenceId = graphicResult?.graphic?.attributes?.fenceId;
        if (fenceId) {
          const zone = DUMMY_FENCING_ZONES.find((z) => z.id === fenceId);
          if (zone) {
            const geom = graphicResult.graphic.geometry as Polygon;
            const area = Math.abs(geometryEngine.geodesicArea(geom, 'square-meters'));
            setSelectedFence({ zone, areaSqMeters: area });
          }
        } else {
          setSelectedFence(null);
        }
      });

      view.on('pointer-move', async (event: any) => {
        const hit = await view!.hitTest(event);
        const graphicResult = hit.results.find(
          (r: any) => r.graphic && r.graphic.layer === graphicsLayerRef.current
        ) as any;

        if (graphicResult?.graphic?.geometry?.type === 'polygon') {
          const geom = graphicResult.graphic.geometry as Polygon;
          const attributes = graphicResult.graphic.attributes;
          const fenceId = attributes?.fenceId || 'temp';

          if (view!.container) view!.container.style.cursor = 'pointer';
          setHoverTooltip((prev) => (prev ? { ...prev, x: event.x, y: event.y } : prev));

          if (currentHoveredFenceId !== fenceId) {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            currentHoveredFenceId = fenceId;

            const area = Math.abs(geometryEngine.geodesicArea(geom, 'square-meters'));
            const formattedArea = Math.round(area).toLocaleString() + ' m²';
            const label = attributes?.title ? `${attributes.title} — ${formattedArea}` : formattedArea;

            hoverTimeout = setTimeout(() => {
              setHoverTooltip({ text: label, x: event.x, y: event.y });
            }, 400);
          }
        } else if (currentHoveredFenceId !== null) {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
          }
          currentHoveredFenceId = null;
          if (view!.container) view!.container.style.cursor = 'default';
          setHoverTooltip(null);
        }
      });

      setMapReady(true);
    };

    initMap();

    return () => {
      active = false;
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (view) view.destroy();
    };
  }, []);

  // Draws the dummy fencing zones as filled polygons once the map is ready.
  useEffect(() => {
    const graphicsLayer = graphicsLayerRef.current;
    if (!graphicsLayer || !mapReady) return;

    graphicsLayer.removeAll();

    DUMMY_FENCING_ZONES.forEach((zone) => {
      const points = zone.points.map(
        ([longitude, latitude]) =>
          new Point({ longitude, latitude, spatialReference: { wkid: 4326 } })
      );
      const renderStatus = deriveFenceRenderStatus(zone.requestStatus);
      const color = renderStatus === 'active' ? ACTIVE_FENCE_COLOR : PLANNED_FENCE_COLOR;

      const rings = points.map((p) => [p.longitude!, p.latitude!]);
      rings.push([points[0].longitude!, points[0].latitude!]); // close loop

      const polygon = new Polygon({
        rings: [rings] as any,
        spatialReference: { wkid: 4326 },
      });

      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: 'simple-fill',
          color: [...color, 0.25] as any,
          outline: {
            color,
            width: 2.5,
            style: renderStatus === 'active' ? 'solid' : 'dash',
          },
        } as any,
        attributes: {
          fenceId: zone.id,
          title: zone.title,
          type: 'polygon',
        },
      });
      graphicsLayer.add(polygonGraphic);
    });
  }, [mapReady]);

  const handleZoomIn = () => {
    if (viewRef.current) viewRef.current.goTo({ zoom: viewRef.current.zoom + 1 });
  };

  const handleZoomOut = () => {
    if (viewRef.current) viewRef.current.goTo({ zoom: viewRef.current.zoom - 1 });
  };

  const handleResetView = () => {
    if (viewRef.current) {
      viewRef.current.goTo({ center: SITE_CENTER, zoom: DEFAULT_ZOOM, tilt: 0, heading: 0 } as any);
    }
  };

  return (
    <div className="fencing-map-wrapper">
      <div className="fencing-map-zoom-controls">
        <button type="button" className="fencing-map-zoom-btn" onClick={handleZoomIn}>
          +
        </button>
        <button type="button" className="fencing-map-zoom-btn" onClick={handleZoomOut}>
          &minus;
        </button>
      </div>

      <button type="button" className="fencing-map-reset-btn" onClick={handleResetView}>
        Reset View
      </button>

      {hoverTooltip && (
        <div className="fencing-map-hover-tooltip" style={{ left: hoverTooltip.x + 12, top: hoverTooltip.y + 12 }}>
          {hoverTooltip.text}
        </div>
      )}

      <div className="fencing-map-legend">
        <div className="fencing-map-legend-item">
          <span className="fencing-map-legend-dot fencing-map-legend-dot--active" />
          <span>Active Fencing</span>
        </div>
        <div className="fencing-map-legend-item">
          <span className="fencing-map-legend-dot fencing-map-legend-dot--planned" />
          <span>Planned Fencing</span>
        </div>
      </div>

      <div ref={mapDivRef} className="fencing-map" />

      <FencingDetailDrawer
        open={!!selectedFence}
        fence={selectedFence?.zone ?? null}
        areaSqMeters={selectedFence?.areaSqMeters ?? null}
        onClose={() => setSelectedFence(null)}
      />
    </div>
  );
}
