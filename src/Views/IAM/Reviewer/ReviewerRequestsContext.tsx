import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReviewRecord, ReviewDecision } from './reviewerTypes';
import { REVIEWER_MOCK_DATA } from './reviewerMockData';

interface ReviewerRequestsCtx {
  reviews: ReviewRecord[];
  getReview: (id: string) => ReviewRecord | undefined;
  submitReview: (id: string, decision: ReviewDecision, comment: string) => void;
}

const Ctx = createContext<ReviewerRequestsCtx>({
  reviews: [],
  getReview: () => undefined,
  submitReview: () => {},
});

export function ReviewerRequestsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [reviews, setReviews] = useState<ReviewRecord[]>(REVIEWER_MOCK_DATA);

  function getReview(id: string) {
    return reviews.find((r) => r.id === id);
  }

  function submitReview(id: string, decision: ReviewDecision, comment: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: decision, reviewComment: comment } : r
      )
    );
  }

  return (
    <Ctx.Provider value={{ reviews, getReview, submitReview }}>
      {children}
    </Ctx.Provider>
  );
}

export function useReviewerRequests() {
  return useContext(Ctx);
}
