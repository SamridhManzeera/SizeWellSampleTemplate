import { GPXData, TrackPoint, Waypoint } from '../types/liveTracking';

/**
 * Calculates the distance between two coordinates in meters using the Haversine formula.
 */
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Parses GPX XML content.
 */
export function parseGPX(xmlText: string): GPXData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Metadata
  const metadataEl = xmlDoc.querySelector('metadata');
  const name = metadataEl?.querySelector('name')?.textContent ?? 'Unnamed Route';
  const description = metadataEl?.querySelector('desc')?.textContent ?? '';
  const startTime = metadataEl?.querySelector('time')?.textContent ?? null;

  // Waypoints
  const waypoints: Waypoint[] = [];
  const wptElements = xmlDoc.getElementsByTagName('wpt');
  for (let i = 0; i < wptElements.length; i++) {
    const el = wptElements[i];
    const lat = parseFloat(el.getAttribute('lat') ?? '0');
    const lon = parseFloat(el.getAttribute('lon') ?? '0');
    const wptName = el.querySelector('name')?.textContent ?? `Waypoint ${i + 1}`;
    const comment = el.querySelector('cmt')?.textContent ?? undefined;
    const desc = el.querySelector('desc')?.textContent ?? undefined;
    waypoints.push({ lat, lon, name: wptName, comment, desc });
  }

  // Trackpoints
  const trackPoints: TrackPoint[] = [];
  const trkptElements = xmlDoc.getElementsByTagName('trkpt');
  for (let i = 0; i < trkptElements.length; i++) {
    const el = trkptElements[i];
    const lat = parseFloat(el.getAttribute('lat') ?? '0');
    const lon = parseFloat(el.getAttribute('lon') ?? '0');
    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) continue;
    const time = el.querySelector('time')?.textContent ?? null;

    // Find speed tags ignoring namespace
    const extensionsEl = el.querySelector('extensions');
    let speedMps = 0;
    let speedMph = 0;

    if (extensionsEl) {
      const childs = Array.from(extensionsEl.getElementsByTagName('*'));
      const mpsEl = childs.find(child => child.localName === 'speed_mps');
      const mphEl = childs.find(child => child.localName === 'speed_mph');
      if (mpsEl?.textContent) {
        speedMps = parseFloat(mpsEl.textContent);
      }
      if (mphEl?.textContent) {
        speedMph = parseFloat(mphEl.textContent);
      }
    }

    const nameVal = el.querySelector('name')?.textContent ?? undefined;

    trackPoints.push({
      lat,
      lon,
      time,
      speedMps,
      speedMph,
      name: nameVal,
    });
  }

  return {
    name,
    description,
    startTime,
    waypoints,
    trackPoints,
  };
}

/**
 * Fetches and parses a GPX file.
 */
export async function fetchAndParseGPX(url: string): Promise<GPXData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch GPX file from ${url}`);
  }
  const text = await response.text();
  return parseGPX(text);
}

/**
 * Finds the first trackpoint in the actual track that is more than
 * `thresholdMeters` away from any trackpoint in the planned track.
 */
export function findDeviationPoint(
  plannedPoints: TrackPoint[],
  actualPoints: TrackPoint[],
  thresholdMeters = 100
): TrackPoint | null {
  if (plannedPoints.length === 0 || actualPoints.length === 0) return null;

  for (const actualPt of actualPoints) {
    let minDistance = Infinity;

    for (const plannedPt of plannedPoints) {
      const dist = getHaversineDistance(
        actualPt.lat,
        actualPt.lon,
        plannedPt.lat,
        plannedPt.lon
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
      // Optimization: if we find a point within 5 meters, we can stop searching for this node
      if (minDistance < 5) break;
    }

    if (minDistance > thresholdMeters) {
      return actualPt;
    }
  }

  return null;
}

/**
 * Checks if a coordinate is inside a polygon using the Ray-Casting algorithm.
 */
export function isPointInPolygon(lat: number, lon: number, polygon: number[][]): boolean {
  const x = lon;
  const y = lat;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
