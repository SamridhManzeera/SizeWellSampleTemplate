import { useState } from 'react';
import type { ReviewDecision, ReviewRecord } from './reviewerTypes';
import '../SpaceRequestForm/Shared/spaceGeneralForm.scss';

interface ReviewerDecisionPanelProps {
  review: ReviewRecord;
  onSubmit: (decision: ReviewDecision, comment: string) => void;
}

function ReviewerDecisionPanel({
  review,
  onSubmit,
}: ReviewerDecisionPanelProps) {
  const [comment, setComment] = useState(review.reviewComment);

  const isDecided =
    review.status === 'Approved' || review.status === 'Rejected';

  return (
    <div className="sgf__card">
      <h2 className="sgf__section-title">Review Decision</h2>
      <p className="sgf__section-hint">
        Approve or reject SRF {review.srfNumber} and leave a comment explaining
        your decision.
      </p>

      {isDecided && (
        <span
          className={`sgf__review-status sgf__review-status--${review.status.toLowerCase()}`}
        >
          Currently {review.status}
        </span>
      )}

      <div className="sgf__field sgf__field--wide">
        <label htmlFor="review-comment">
          Comment
          <textarea
            id="review-comment"
            name="reviewComment"
            value={comment}
            placeholder="Explain your decision..."
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
      </div>

      <div className="sgf__review-actions">
        <button
          type="button"
          className="sgf__review-btn sgf__review-btn--approve"
          onClick={() => onSubmit('Approved', comment)}
        >
          Approve
        </button>
        <button
          type="button"
          className="sgf__review-btn sgf__review-btn--reject"
          onClick={() => onSubmit('Rejected', comment)}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default ReviewerDecisionPanel;
