import type { SpaceRequestStatus } from '../../../Views/IAM/SpaceRequestForm/spaceRequestFormTypes';

// Mirrors the "Section A" general fields captured on the Space Request Form
// (see SpaceGeneralForm / SpaceViewFormGeneral) so a fenced area on the map
// can show the same request details a reviewer sees on the form itself.
export interface FencingZone {
  id: string;
  srfNumber: string;
  title: string;
  dateRaised: string;
  teamcenterNumber: string;
  revision: string;
  originatorCompanyName: string;
  projectContractRefNumber: string;
  mobilisationDate: string;
  demobilisationDate: string;
  plotFootprint: string;
  siteZone: string;
  requestStatus: SpaceRequestStatus;
  // [longitude, latitude] pairs describing the fence boundary
  points: [number, number][];
}

// Approved requests render as solid/occupied fencing on the map; anything
// still in progress (Draft/Submitted) or turned down renders as planned.
export function deriveFenceRenderStatus(requestStatus: SpaceRequestStatus): 'active' | 'planned' {
  return requestStatus === 'Approved' ? 'active' : 'planned';
}

// Builds a small, irregular polygon fence line (not a uniform box) around a
// center [longitude, latitude] point. `radii` gives one relative distance per
// vertex (spaced evenly around the center), so varying the values produces a
// natural, uneven fence outline roughly 40-60m across.
function fencePolygon(center: [number, number], radii: number[]): [number, number][] {
  const [lon, lat] = center;
  const sides = radii.length;
  return radii.map((r, i) => {
    const angle = (2 * Math.PI * i) / sides;
    return [lon + r * 0.00065 * Math.cos(angle), lat + r * 0.00042 * Math.sin(angle)] as [number, number];
  });
}

// Dummy fencing zones spread across the Sizewell C site area, used until the
// real fencing data source is wired up.
export const DUMMY_FENCING_ZONES: FencingZone[] = [
  {
    id: 'fence-1',
    srfNumber: '0041',
    title: 'HTR Compound Boundary Fencing',
    dateRaised: '03/11/2025',
    teamcenterNumber: '101556014',
    revision: '001',
    originatorCompanyName: 'Balfour Beatty',
    projectContractRefNumber: 'ADW000-042',
    mobilisationDate: '10/11/2025',
    demobilisationDate: '31/12/2026',
    plotFootprint: 'Compound boundary 55m x 55m',
    siteZone: 'Zone 8',
    requestStatus: 'Approved',
    points: fencePolygon([1.61, 52.213], [1, 0.75, 1.15, 0.9, 1.2, 0.85]),
  },
  {
    id: 'fence-2',
    srfNumber: '0042',
    title: 'Compound Extension Fencing – Area B',
    dateRaised: '10/11/2025',
    teamcenterNumber: '101556091',
    revision: '001',
    originatorCompanyName: 'Balfour Beatty',
    projectContractRefNumber: 'ADW000-042',
    mobilisationDate: '18/11/2025',
    demobilisationDate: '31/12/2026',
    plotFootprint: 'Compound extension 50m x 45m',
    siteZone: 'Zone 8',
    requestStatus: 'Approved',
    points: fencePolygon([1.615, 52.216], [0.9, 1.2, 0.8, 1.1, 0.95]),
  },
  {
    id: 'fence-3',
    srfNumber: '0043',
    title: 'Access Road Traffic Barrier Fencing',
    dateRaised: '01/12/2025',
    teamcenterNumber: '101556142',
    revision: '002',
    originatorCompanyName: 'Kier Group',
    projectContractRefNumber: 'ADW000-076',
    mobilisationDate: '08/12/2025',
    demobilisationDate: '30/06/2026',
    plotFootprint: 'Barrier run 60m x 40m',
    siteZone: 'Zone 3',
    requestStatus: 'Submitted',
    points: fencePolygon([1.605, 52.21], [1.1, 0.8, 0.85, 1.25, 0.9, 1.0, 0.8]),
  },
  {
    id: 'fence-4',
    srfNumber: '0044',
    title: 'Marine Off-Loading Works Fencing',
    dateRaised: '15/06/2026',
    teamcenterNumber: '101556188',
    revision: '001',
    originatorCompanyName: 'Van Oord',
    projectContractRefNumber: 'ADW000-118',
    mobilisationDate: '15/08/2026',
    demobilisationDate: '31/03/2027',
    plotFootprint: 'Temporary works fence 50m x 45m',
    siteZone: 'Zone 1 (Marine)',
    requestStatus: 'Draft',
    points: fencePolygon([1.62, 52.212], [0.85, 1.15, 0.95, 1.2, 0.8]),
  },
  {
    id: 'fence-5',
    srfNumber: '0045',
    title: 'Laydown & Storage Yard Fencing',
    dateRaised: '22/10/2025',
    teamcenterNumber: '101556221',
    revision: '001',
    originatorCompanyName: 'Balfour Beatty',
    projectContractRefNumber: 'ADW000-055',
    mobilisationDate: '29/10/2025',
    demobilisationDate: '31/03/2027',
    plotFootprint: 'Storage yard 60m x 50m',
    siteZone: 'Zone 8',
    requestStatus: 'Approved',
    points: fencePolygon([1.612, 52.208], [1.2, 0.85, 1.05, 0.75, 1.1, 0.9]),
  },
  {
    id: 'fence-6',
    srfNumber: '0046',
    title: 'Substation High-Security Fencing',
    dateRaised: '14/09/2025',
    teamcenterNumber: '101556265',
    revision: '002',
    originatorCompanyName: 'National Grid',
    projectContractRefNumber: 'ADW000-089',
    mobilisationDate: '21/09/2025',
    demobilisationDate: '28/02/2027',
    plotFootprint: 'Palisade fence 45m x 45m',
    siteZone: 'Zone 5',
    requestStatus: 'Rejected',
    points: fencePolygon([1.617, 52.209], [0.8, 1.1, 0.9, 1.2, 0.85, 1.05]),
  },
];
