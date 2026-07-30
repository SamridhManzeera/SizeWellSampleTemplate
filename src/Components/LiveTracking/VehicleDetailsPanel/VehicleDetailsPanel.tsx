import { EnhancedVehicle } from '../../../types/liveTracking';
import './VehicleDetailsPanel.scss';

// Reusable icons
function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function TruckDetailsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function LinkGreenIcon() {
  return (
    <span className="lt-details-panel__green-link-icon">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </span>
  );
}

interface VehicleDetailsPanelProps {
  vehicle: EnhancedVehicle;
  onClose: () => void;
}

export default function VehicleDetailsPanel({ vehicle, onClose }: VehicleDetailsPanelProps) {
  // Determine badge colors and labels
  const isIncorrect = vehicle.status === 'Incorrect';
  const isPending = vehicle.status === 'Pending';
  
  let statusBadgeLabel = 'In Transit';
  let statusBadgeClass = 'in-transit';
  if (isIncorrect) {
    statusBadgeLabel = 'Deviated';
    statusBadgeClass = 'deviated';
  } else if (isPending) {
    statusBadgeLabel = 'Validation';
    statusBadgeClass = 'validation';
  }

  // Formatting helper for event severity
  const getSeverityBadge = (count: number) => {
    if (count === 0) return { text: 'None', className: 'none' };
    if (count <= 2) return { text: 'Low', className: 'low' };
    if (count <= 4) return { text: 'Med', className: 'medium' };
    return { text: 'High', className: 'high' };
  };

  const brakingSeverity = getSeverityBadge(vehicle.harshBraking);
  const accelSeverity = getSeverityBadge(vehicle.harshAcceleration);

  // Speed Limit Circle logic
  const isOverSpeed = vehicle.currentSpeedMph > vehicle.postedSpeedLimit;

  return (
    <div className="lt-details-panel">
      {/* Top Header Row */}
      <div className="lt-details-panel__header">
        <button type="button" className="lt-details-panel__back" onClick={onClose} aria-label="Go back">
          <BackArrowIcon />
          <span>Vehicle Details</span>
        </button>
        <button type="button" className="lt-details-panel__close" onClick={onClose} aria-label="Close panel">✕</button>
      </div>

      {/* Main Content Area (Scrollable if content overflows slightly) */}
      <div className="lt-details-panel__body">
        
        {/* Profile Card */}
        <div className="lt-details-panel__profile">
          <div className="lt-details-panel__profile-avatar">
            <TruckDetailsIcon />
            <span className="lt-details-panel__profile-type-label">HGV</span>
          </div>
          <div className="lt-details-panel__profile-info">
            <div className="lt-details-panel__profile-reg-row">
              <h2 className="lt-details-panel__profile-reg">{vehicle.reg}</h2>
              <span className={`lt-details-panel__profile-badge lt-details-panel__profile-badge--${statusBadgeClass}`}>
                {statusBadgeLabel}
              </span>
            </div>
            <p className="lt-details-panel__profile-meta">
              <strong>Booking ID:</strong> <span className="lt-details-panel__profile-meta-val">{vehicle.bookingId}</span>
            </p>
            <p className="lt-details-panel__profile-meta">
              <strong>Haulier:</strong> <span className="lt-details-panel__profile-meta-val">{vehicle.haulier}</span>
            </p>
          </div>
        </div>

        {/* Speed vs Limit Card Section */}
        <div className="lt-details-panel__section">
          <h4 className="lt-details-panel__section-title">Vehicle Speed vs Posted Speed Limit</h4>
          <div className="lt-details-panel__speed-row">
            <div className="lt-details-panel__speed-card lt-details-panel__speed-card--current">
              <span className="lt-details-panel__speed-card-lbl">Current Speed</span>
              <span className="lt-details-panel__speed-card-val">
                {vehicle.currentSpeedMph.toFixed(0)} <span className="lt-details-panel__speed-card-unit">mph</span>
              </span>
            </div>
            <div className="lt-details-panel__speed-card lt-details-panel__speed-card--limit">
              <span className="lt-details-panel__speed-card-lbl">Posted Speed Limit</span>
              <div className={`lt-details-panel__speed-limit-sign ${isOverSpeed ? 'lt-details-panel__speed-limit-sign--warning' : ''}`}>
                <span className="lt-details-panel__speed-limit-num">{vehicle.postedSpeedLimit}</span>
                <span className="lt-details-panel__speed-limit-unit">mph</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Stats Cards */}
        <div className="lt-details-panel__stats-grid">
          <div className="lt-details-panel__stat-card">
            <span className="lt-details-panel__stat-lbl">Harsh Braking</span>
            <div className="lt-details-panel__stat-val-row">
              <span className="lt-details-panel__stat-val">{vehicle.harshBraking}</span>
              <span className="lt-details-panel__stat-unit">Events</span>
            </div>
            <span className={`lt-details-panel__stat-badge lt-details-panel__stat-badge--${brakingSeverity.className}`}>
              • {brakingSeverity.text}
            </span>
          </div>

          <div className="lt-details-panel__stat-card">
            <span className="lt-details-panel__stat-lbl">Harsh Accel.</span>
            <div className="lt-details-panel__stat-val-row">
              <span className="lt-details-panel__stat-val">{vehicle.harshAcceleration}</span>
              <span className="lt-details-panel__stat-unit">Events</span>
            </div>
            <span className={`lt-details-panel__stat-badge lt-details-panel__stat-badge--${accelSeverity.className}`}>
              • {accelSeverity.text}
            </span>
          </div>

          <div className="lt-details-panel__stat-card">
            <span className="lt-details-panel__stat-lbl">Idle Time</span>
            <div className="lt-details-panel__stat-val-row">
              <span className="lt-details-panel__stat-val">{vehicle.idleTimeMin}</span>
              <span className="lt-details-panel__stat-unit">min</span>
            </div>
          </div>
        </div>

        {/* Adherence Progress Bar */}
        <div className="lt-details-panel__section">
          <div className="lt-details-panel__progress-label-row">
            <span className="lt-details-panel__progress-title">Route Adherence</span>
            <span className={`lt-details-panel__progress-val ${isIncorrect ? 'lt-details-panel__progress-val--deviated' : ''}`}>
              {vehicle.routeAdherence}%
            </span>
          </div>
          <div className="lt-details-panel__progress-bg">
            <div 
              className={`lt-details-panel__progress-fill lt-details-panel__progress-fill--adherence ${isIncorrect ? 'lt-details-panel__progress-fill--deviated' : ''}`} 
              style={{ width: `${vehicle.routeAdherence}%` }} 
            />
          </div>
        </div>

        {/* Planned Slot Progress Bar */}
        <div className="lt-details-panel__section">
          <div className="lt-details-panel__progress-label-row">
            <span className="lt-details-panel__progress-title">Tracking vs Planned Slot</span>
            <span className="lt-details-panel__progress-status-text">{vehicle.trackingVsPlannedSlot}</span>
          </div>
          <div className="lt-details-panel__progress-bg">
            <div 
              className="lt-details-panel__progress-fill lt-details-panel__progress-fill--slot" 
              style={{ width: vehicle.trackingVsPlannedSlot === 'Off Track' ? '40%' : '100%' }} 
            />
          </div>
        </div>

        {/* Key Timestamps Timeline */}
        <div className="lt-details-panel__section">
          <h4 className="lt-details-panel__section-title">Key Timestamps</h4>
          <div className="lt-details-panel__timeline">
            
            <div className="lt-details-panel__timeline-item">
              <div className="lt-details-panel__timeline-bullet lt-details-panel__timeline-bullet--completed" />
              <div className="lt-details-panel__timeline-content">
                <span className="lt-details-panel__timeline-label">FMF Entry</span>
                <div className="lt-details-panel__timeline-time">
                  <strong>{vehicle.fmfEntry !== '--' ? vehicle.fmfEntry.split(' ')[0] : '--'}</strong>
                  <span className="lt-details-panel__timeline-date">{vehicle.fmfEntry !== '--' ? vehicle.fmfEntry.split(' ').slice(1).join(' ') : ''}</span>
                </div>
              </div>
            </div>

            <div className="lt-details-panel__timeline-item">
              <div className={`lt-details-panel__timeline-bullet ${vehicle.siteEntry !== '--' ? 'lt-details-panel__timeline-bullet--completed' : ''}`} />
              <div className="lt-details-panel__timeline-content">
                <span className="lt-details-panel__timeline-label">Site Entry</span>
                <div className="lt-details-panel__timeline-time">
                  <strong>{vehicle.siteEntry !== '--' ? vehicle.siteEntry.split(' ')[0] : '--'}</strong>
                  <span className="lt-details-panel__timeline-date">{vehicle.siteEntry !== '--' ? vehicle.siteEntry.split(' ').slice(1).join(' ') : ''}</span>
                </div>
              </div>
            </div>

            <div className="lt-details-panel__timeline-item">
              <div className={`lt-details-panel__timeline-bullet ${vehicle.holdingAreaEntry !== '--' ? 'lt-details-panel__timeline-bullet--completed' : ''}`} />
              <div className="lt-details-panel__timeline-content">
                <span className="lt-details-panel__timeline-label">Holding Area Entry</span>
                <div className="lt-details-panel__timeline-time">
                  <strong>{vehicle.holdingAreaEntry !== '--' ? vehicle.holdingAreaEntry.split(' ')[0] : '--'}</strong>
                  <span className="lt-details-panel__timeline-date">{vehicle.holdingAreaEntry !== '--' ? vehicle.holdingAreaEntry.split(' ').slice(1).join(' ') : ''}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom ETA & Ignition cards */}
        <div className="lt-details-panel__bottom-row">
          <div className="lt-details-panel__bottom-card">
            <span className="lt-details-panel__bottom-card-lbl">Live ETA</span>
            <span className="lt-details-panel__bottom-card-val">{vehicle.liveEta}</span>
            <span className="lt-details-panel__bottom-card-sub">vs Expected: {vehicle.expectedEta}</span>
            <span className="lt-details-panel__bottom-card-diff">{vehicle.etaDiff}</span>
          </div>

          <div className="lt-details-panel__bottom-card">
            <span className="lt-details-panel__bottom-card-lbl">Ignition Status</span>
            <span className="lt-details-panel__bottom-card-val lt-details-panel__bottom-card-val--ignition">{vehicle.ignitionStatus}</span>
            <span className="lt-details-panel__bottom-card-sub" style={{ marginTop: '16px' }}>Since {vehicle.ignitionSince}</span>
          </div>
        </div>

        {/* History of Timestamps Section */}
        <div className="lt-details-panel__section lt-details-panel__section--history">
          <h4 className="lt-details-panel__section-title">History of Timestamps</h4>
          <div className="lt-details-panel__history-timeline">
            {vehicle.ignitionSince && vehicle.ignitionSince !== '--' && (
              <div className="lt-details-panel__history-item">
                <div className="lt-details-panel__history-indicator" />
                <span className="lt-details-panel__history-time">{vehicle.ignitionSince}</span>
                <LinkGreenIcon />
                <span className="lt-details-panel__history-label">Ignition ON</span>
              </div>
            )}
            {vehicle.fmfEntry && vehicle.fmfEntry !== '--' && (
              <div className="lt-details-panel__history-item">
                <div className="lt-details-panel__history-indicator" />
                <span className="lt-details-panel__history-time">{vehicle.fmfEntry.split(' ')[0]}</span>
                <LinkGreenIcon />
                <span className="lt-details-panel__history-label">Entered FMF</span>
              </div>
            )}
            {vehicle.siteEntry && vehicle.siteEntry !== '--' && (
              <div className="lt-details-panel__history-item">
                <div className="lt-details-panel__history-indicator" />
                <span className="lt-details-panel__history-time">{vehicle.siteEntry.split(' ')[0]}</span>
                <LinkGreenIcon />
                <span className="lt-details-panel__history-label">Entered Site</span>
              </div>
            )}
            {vehicle.holdingAreaEntry && vehicle.holdingAreaEntry !== '--' && (
              <div className="lt-details-panel__history-item">
                <div className="lt-details-panel__history-indicator" />
                <span className="lt-details-panel__history-time">{vehicle.holdingAreaEntry.split(' ')[0]}</span>
                <LinkGreenIcon />
                <span className="lt-details-panel__history-label">Entered Holding Area</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
