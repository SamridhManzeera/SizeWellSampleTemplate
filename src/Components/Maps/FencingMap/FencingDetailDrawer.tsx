import { FencingZone } from './fencingDummyData';
import './fencingDetailDrawer.scss';

interface FencingDetailDrawerProps {
  open: boolean;
  fence: FencingZone | null;
  areaSqMeters: number | null;
  onClose: () => void;
}

function CompanyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 9h.01M9 13h.01M15 9h.01M15 13h.01" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function FencingDetailDrawer({ open, fence, areaSqMeters, onClose }: FencingDetailDrawerProps) {
  if (!open || !fence) return null;

  return (
    <div className="fd">
      <div className="fd__accent" />

      <div className="fd__header">
        <span className="fd__badge">
          <span className="fd__badge-dot" />
          Space Request
        </span>
        <button type="button" className="fd__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="fd__body">
        <h3 className="fd__title">{fence.title}</h3>

        <div className="fd__meta-row">
          <CompanyIcon />
          <span>{fence.originatorCompanyName}</span>
        </div>
        <div className="fd__meta-row">
          <CalendarIcon />
          <span>Raised {fence.dateRaised}</span>
        </div>

        <div className="fd__section">
          <span className="fd__section-label">SRF Number</span>
          <div className="fd__section-value">{fence.srfNumber}</div>
        </div>

        <div className="fd__section">
          <span className="fd__section-label">Request Status</span>
          <div className={`fd__status fd__status--${fence.requestStatus.toLowerCase().replace(' ', '-')}`}>
            {fence.requestStatus}
          </div>
        </div>

        <div className="fd__section">
          <span className="fd__section-label">Organisation Details</span>
          <div className="fd__dl">
            <dt>Teamcenter Number</dt>
            <dd>{fence.teamcenterNumber}</dd>

            <dt>Revision</dt>
            <dd>{fence.revision}</dd>

            <dt>Project / Contract Ref</dt>
            <dd>{fence.projectContractRefNumber}</dd>
          </div>
        </div>

        <div className="fd__section">
          <span className="fd__section-label">Site Details</span>
          <div className="fd__dl">
            <dt>Mobilisation Date</dt>
            <dd>{fence.mobilisationDate}</dd>

            <dt>Demobilisation Date</dt>
            <dd>{fence.demobilisationDate}</dd>

            <dt>Plot Footprint</dt>
            <dd>{fence.plotFootprint}</dd>

            <dt>Site Zone</dt>
            <dd>{fence.siteZone}</dd>

            <dt>Mapped Area</dt>
            <dd>{areaSqMeters !== null ? `${Math.round(areaSqMeters).toLocaleString()} m²` : '-'}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
