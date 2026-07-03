import { JourneySummary } from '../types/liveTracking';

/**
 * Parses correct_summary.csv text into JourneySummary objects.
 */
export function parseCorrectSummaryCSV(csvText: string): JourneySummary[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const summaries: JourneySummary[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = line.split(',');
    if (cols.length < 10) continue;

    summaries.push({
      speedMph: parseFloat(cols[0]),
      speedKphOrKmh: parseFloat(cols[1]),
      speedMps: parseFloat(cols[2]),
      distanceKm: parseFloat(cols[3]),
      distanceMiles: parseFloat(cols[4]),
      durationSeconds: parseFloat(cols[5]),
      durationHms: cols[6],
      trackPointsCount: parseInt(cols[7], 10),
      startTime: cols[8],
      endTime: cols[9],
    });
  }
  return summaries;
}

/**
 * Parses incorrect_summary.csv text into JourneySummary objects.
 */
export function parseIncorrectSummaryCSV(csvText: string): JourneySummary[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const summaries: JourneySummary[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',');
    if (cols.length < 9) continue;

    summaries.push({
      speedMph: parseFloat(cols[0]),
      speedKphOrKmh: parseFloat(cols[1]), // speed_kmh
      speedMps: parseFloat(cols[2]),
      distanceKm: parseFloat(cols[3]), // route_distance_km
      distanceMiles: parseFloat(cols[4]), // route_distance_miles
      durationSeconds: 0, // Not explicitly in incorrect, can be computed or set to 0. Wait, we have end_time - start_time or duration_hhmmss!
      durationHms: cols[8], // journey_duration_hhmmss
      trackPointsCount: parseInt(cols[5], 10),
      startTime: cols[6],
      endTime: cols[7],
    });
  }
  return summaries;
}

/**
 * Fetches and parses correct_summary.csv
 */
export async function fetchCorrectSummary(url: string): Promise<JourneySummary[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch correct CSV summary from ${url}`);
  }
  const text = await response.text();
  return parseCorrectSummaryCSV(text);
}

/**
 * Fetches and parses incorrect_summary.csv
 */
export async function fetchIncorrectSummary(url: string): Promise<JourneySummary[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch incorrect CSV summary from ${url}`);
  }
  const text = await response.text();
  return parseIncorrectSummaryCSV(text);
}
