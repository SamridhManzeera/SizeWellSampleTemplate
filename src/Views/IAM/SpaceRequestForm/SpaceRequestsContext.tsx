import { createContext, useContext, useState, ReactNode } from 'react';
import { SpaceRequestRecord } from './spaceRequestFormTypes';
import type {
  ReviewStatus,
  SectionAttachment,
  SectionReview,
} from './spaceRequestFormTypes';
import { SPACE_REQUEST_MOCK_DATA } from './spaceRequestFormMockData';

const EMPTY_SECTION_REVIEW: SectionReview = {
  status: 'Under Review',
  comment: '',
  attachments: [],
};

export function getSectionReview(
  request: SpaceRequestRecord,
  sectionId: string
): SectionReview {
  return request.sectionReviews[sectionId] ?? EMPTY_SECTION_REVIEW;
}

interface SpaceRequestsCtx {
  requests: SpaceRequestRecord[];
  addRequest: (r: SpaceRequestRecord) => void;
  getRequest: (id: string) => SpaceRequestRecord | undefined;
  saveSectionDraft: (
    requestId: string,
    sectionId: string,
    comment: string,
    attachments: SectionAttachment[]
  ) => void;
  submitSectionReview: (
    requestId: string,
    sectionId: string,
    status: ReviewStatus,
    comment: string,
    attachments: SectionAttachment[]
  ) => void;
}

const Ctx = createContext<SpaceRequestsCtx>({
  requests: [],
  addRequest: () => {},
  getRequest: () => undefined,
  saveSectionDraft: () => {},
  submitSectionReview: () => {},
});

export function SpaceRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<SpaceRequestRecord[]>(
    SPACE_REQUEST_MOCK_DATA
  );

  function addRequest(r: SpaceRequestRecord) {
    setRequests((prev) => [r, ...prev]);
  }

  function getRequest(id: string) {
    return requests.find((r) => r.id === id);
  }

  function updateSection(
    requestId: string,
    sectionId: string,
    patch: Partial<SectionReview>
  ) {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const existing = r.sectionReviews[sectionId] ?? EMPTY_SECTION_REVIEW;
        return {
          ...r,
          sectionReviews: {
            ...r.sectionReviews,
            [sectionId]: { ...existing, ...patch },
          },
        };
      })
    );
  }

  function saveSectionDraft(
    requestId: string,
    sectionId: string,
    comment: string,
    attachments: SectionAttachment[]
  ) {
    updateSection(requestId, sectionId, { comment, attachments });
  }

  function submitSectionReview(
    requestId: string,
    sectionId: string,
    status: ReviewStatus,
    comment: string,
    attachments: SectionAttachment[]
  ) {
    updateSection(requestId, sectionId, { status, comment, attachments });
  }

  return (
    <Ctx.Provider
      value={{
        requests,
        addRequest,
        getRequest,
        saveSectionDraft,
        submitSectionReview,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSpaceRequests() {
  return useContext(Ctx);
}
