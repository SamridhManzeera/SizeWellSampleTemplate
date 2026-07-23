/* eslint-disable react/require-default-props */
import type { SectionReview } from '../spaceRequestFormTypes';
import './sectionReviewPanel.scss';

interface SectionReviewSummaryProps {
  sectionReview: SectionReview;
  onEdit?: () => void;
}

function statusSlug(status: string) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function SectionReviewSummary({
  sectionReview,
  onEdit,
}: SectionReviewSummaryProps) {
  return (
    <aside className="rvw__panel" aria-label="Review and feedback">
      <div className="rvw__panel-header">
        <h2 className="rvw__title">Review & Feedback</h2>
        {onEdit && (
          <button type="button" className="rvw__edit-btn" onClick={onEdit}>
            <EditIcon />
            Edit
          </button>
        )}
      </div>

      <div className="rvw__field">
        <span className="rvw__label">Status</span>
        <span
          className={`rvw__status-badge rvw__status-badge--${statusSlug(
            sectionReview.status
          )}`}
        >
          {sectionReview.status}
        </span>
      </div>

      <div className="rvw__field">
        <span className="rvw__label">Feedback / Comments</span>
        {sectionReview.comment ? (
          <p className="rvw__view-text">{sectionReview.comment}</p>
        ) : (
          <p className="rvw__empty-hint">No feedback provided yet.</p>
        )}
      </div>

      <div className="rvw__field">
        <span className="rvw__label">Attachments</span>
        {sectionReview.attachments.length === 0 ? (
          <p className="rvw__empty-hint">No attachments.</p>
        ) : (
          <ul className="rvw__attachment-list">
            {sectionReview.attachments.map((attachment) => (
              <li key={attachment.id} className="rvw__attachment-item">
                <span>{attachment.name}</span>
                <a
                  className="rvw__attachment-view"
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <EyeIcon />
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default SectionReviewSummary;
