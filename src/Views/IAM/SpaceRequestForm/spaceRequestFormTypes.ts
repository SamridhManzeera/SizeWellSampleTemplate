import type { RequestFormModuleKey } from '../../../Store/RequestForm';

export type SpaceRequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Rejected';

export interface WorkforceMonthData {
  counts: Record<string, number>;
}

export type ReviewStatus =
  | 'Approved'
  | 'Rejected'
  | 'Under Review'
  | 'More Info';

export interface SectionAttachment {
  id: string;
  name: string;
  url: string;
}

export interface SectionReview {
  status: ReviewStatus;
  comment: string;
  attachments: SectionAttachment[];
}

export interface SpaceRequestRecord {
  id: string;
  srfNumber: string;
  dateRaised: string;
  teamcenterNumber: string;
  revision: string;
  title: string;
  originatorCompanyName: string;
  projectContractRefNumber: string;
  mobilisationDate: string;
  demobilisationDate: string;
  plotFootprint: string;
  developmentSiteType: 'MDS' | 'OSI';
  mainDevelopmentSiteArea: string;
  siteZone: string;
  requestTypeMds: string;
  laydownWarehousePort: string;
  areaOsi: string;
  requestTypeOsi: string;
  status: SpaceRequestStatus;
  modules: Record<RequestFormModuleKey, boolean>;
  workforceData: WorkforceMonthData;
  sectionReviews: Record<string, SectionReview>;
}
