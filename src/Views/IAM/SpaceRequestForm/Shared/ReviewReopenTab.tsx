import './sectionReviewPanel.scss';

interface ReviewReopenTabProps {
  onClick: () => void;
}

function ReviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    </svg>
  );
}

function ReviewReopenTab({ onClick }: ReviewReopenTabProps) {
  return (
    <button type="button" className="rvw__toggle-btn" onClick={onClick}>
      <ReviewIcon />
      Review & Feedback
    </button>
  );
}

export default ReviewReopenTab;
