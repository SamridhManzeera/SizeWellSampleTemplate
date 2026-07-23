import type {
  SpaceRequestRecord,
  SpaceRequestStatus,
} from '../SpaceRequestForm/spaceRequestFormTypes';

export type ReviewDecision = Extract<
  SpaceRequestStatus,
  'Approved' | 'Rejected'
>;

export interface ReviewRecord extends SpaceRequestRecord {
  reviewComment: string;
}
