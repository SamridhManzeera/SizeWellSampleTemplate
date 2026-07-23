import { useState } from 'react';
import type {
  ReviewStatus,
  SectionAttachment,
  SectionReview,
} from '../SpaceRequestForm/spaceRequestFormTypes';
import SectionReviewSummary from '../SpaceRequestForm/Shared/SectionReviewSummary';
import '../SpaceRequestForm/Shared/sectionReviewPanel.scss';

const MAX_COMMENT_LENGTH = 2000;

const STATUS_OPTIONS: ReviewStatus[] = [
  'Under Review',
  'Approved',
  'Rejected',
  'More Info',
];

/* eslint-disable react/require-default-props */
interface ReviewerDecisionPanelProps {
  sectionReview: SectionReview;
  onSaveDraft: (comment: string, attachments: SectionAttachment[]) => void;
  onSubmit: (
    status: ReviewStatus,
    comment: string,
    attachments: SectionAttachment[]
  ) => void;
  onClose?: () => void;
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
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

let attachmentIdCounter = 0;

function ReviewerDecisionPanel({
  sectionReview,
  onSaveDraft,
  onSubmit,
  onClose,
}: ReviewerDecisionPanelProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draftStatus, setDraftStatus] = useState<ReviewStatus>(
    sectionReview.status
  );
  const [draftComment, setDraftComment] = useState(sectionReview.comment);
  const [draftAttachments, setDraftAttachments] = useState<SectionAttachment[]>(
    sectionReview.attachments
  );

  const startEditing = () => {
    setDraftStatus(sectionReview.status);
    setDraftComment(sectionReview.comment);
    setDraftAttachments(sectionReview.attachments);
    setMode('edit');
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const newItems = Array.from(fileList).map((file) => {
      attachmentIdCounter += 1;
      return {
        id: `attachment-${attachmentIdCounter}`,
        name: file.name,
        url: URL.createObjectURL(file),
      };
    });
    setDraftAttachments((prev) => [...prev, ...newItems]);
  };

  const removeDraftAttachment = (id: string) => {
    setDraftAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveDraft = () => {
    onSaveDraft(draftComment, draftAttachments);
    setMode('view');
  };

  const handleSubmit = () => {
    onSubmit(draftStatus, draftComment, draftAttachments);
    setMode('view');
  };

  if (mode === 'view') {
    return (
      <SectionReviewSummary
        sectionReview={sectionReview}
        onEdit={startEditing}
        onClose={onClose}
      />
    );
  }

  return (
    <aside className="rvw__panel" aria-label="Review and feedback">
      <div className="rvw__panel-header">
        <h2 className="rvw__title">Review & Feedback</h2>
        {onClose && (
          <div className="rvw__panel-header-actions">
            <button
              type="button"
              className="rvw__close-btn"
              aria-label="Close review panel"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="rvw__field">
        <label className="rvw__label" htmlFor="review-status">
          Update Status
          <span className="rvw__info-icon">
            <InfoIcon />
          </span>
        </label>
        <select
          id="review-status"
          className="rvw__status-select"
          value={draftStatus}
          onChange={(event) =>
            setDraftStatus(event.target.value as ReviewStatus)
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="rvw__field">
        <label className="rvw__label" htmlFor="review-comment">
          Feedback / Comments
          <span className="rvw__info-icon">
            <InfoIcon />
          </span>
        </label>
        <textarea
          id="review-comment"
          maxLength={MAX_COMMENT_LENGTH}
          value={draftComment}
          placeholder="Enter your feedback or comments..."
          onChange={(event) => setDraftComment(event.target.value)}
        />
        <span className="rvw__char-count">
          {draftComment.length} / {MAX_COMMENT_LENGTH}
        </span>
      </div>

      <div className="rvw__field">
        <span className="rvw__label">
          Attachments (Optional)
          <span className="rvw__info-icon">
            <InfoIcon />
          </span>
        </span>
        <label className="rvw__dropzone">
          <input
            type="file"
            multiple
            onChange={(event) => handleFilesSelected(event.target.files)}
          />
          <UploadIcon />
          <span>Drag &amp; drop files here or click to upload</span>
          <span className="rvw__dropzone-hint">
            PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max. 10MB)
          </span>
        </label>
        {draftAttachments.length > 0 && (
          <ul className="rvw__attachment-list">
            {draftAttachments.map((attachment) => (
              <li key={attachment.id} className="rvw__attachment-item">
                <span>{attachment.name}</span>
                <span className="rvw__attachment-actions">
                  <a
                    className="rvw__attachment-view"
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${attachment.name}`}
                  >
                    <EyeIcon />
                  </a>
                  <button
                    type="button"
                    className="rvw__attachment-remove"
                    aria-label={`Remove ${attachment.name}`}
                    onClick={() => removeDraftAttachment(attachment.id)}
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rvw__actions">
        <button
          type="button"
          className="rvw__btn rvw__btn--ghost"
          onClick={() => setMode('view')}
        >
          Cancel
        </button>
        <div className="rvw__actions-primary">
          <button
            type="button"
            className="rvw__btn rvw__btn--secondary"
            onClick={handleSaveDraft}
          >
            <SaveIcon />
            Save as Draft
          </button>
          <button
            type="button"
            className="rvw__btn rvw__btn--primary"
            onClick={handleSubmit}
          >
            Submit Review
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ReviewerDecisionPanel;
