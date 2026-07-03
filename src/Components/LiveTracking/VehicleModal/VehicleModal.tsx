import { EnhancedVehicle } from '../../../types/liveTracking';
import './VehicleModal.scss';

interface VehicleModalProps {
  open: boolean;
  vehicle: EnhancedVehicle | null; // Enhanced vehicle object
  onClose: () => void;
}

export default function VehicleModal({ open, vehicle, onClose }: VehicleModalProps) {
  if (!open || !vehicle) return null;

  const statusClass = 
    vehicle.status === 'On Route' ? 'on-route' :
    vehicle.status === 'Off Route' ? 'off-route' : 'idle';

  const formatDateTime = (timeStr?: string | null) => {
    if (!timeStr) return '--';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const progressPercent = Math.round(vehicle.progress * 100);

  return (
    <div className="vm-backdrop" onClick={onClose} role="presentation">
      <div className="vm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="vm__header">
          <div className="vm__header-left">
            <span className={`vm__status-tag vm__status-tag--${statusClass}`}>
              {vehicle.status}
            </span>
            <div>
              <h2 className="vm__title">{vehicle.name} Details</h2>
              <p className="vm__subtitle">Vehicle Monitoring & Compliance Log</p>
            </div>
          </div>
          <button type="button" className="vm__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Modal Content */}
        <div className="vm__body">
          {/* Progress Section */}
          <div className="vm__progress-section">
            <div className="vm__progress-label-row">
              <span className="vm__progress-lbl">Journey Progress</span>
              <span className="vm__progress-val">{progressPercent}%</span>
            </div>
            <div className="vm__progress-bar">
              <div 
                className={`vm__progress-fill vm__progress-fill--${statusClass}`}
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="vm__grid">
            <div className="vm__field vm__field--full">
              <span className="vm__label">Route Status</span>
              <span className={`vm__value vm__value--status-${statusClass}`}>
                {vehicle.status}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Vehicle ID</span>
              <span className="vm__value vm__value--highlight">{vehicle.id}</span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Vehicle Type</span>
              <span className="vm__value">{vehicle.type}</span>
            </div>
            <div className="vm__field vm__field--full">
              <span className="vm__label">Assigned Route</span>
              <span className="vm__value">
                {vehicle.routeTitle}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Current Speed</span>
              <span className="vm__value">
                {`${vehicle.currentSpeedMph.toFixed(0)} mph`}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Average Speed</span>
              <span className="vm__value">
                {vehicle.summary ? `${vehicle.summary.speedMph.toFixed(0)} mph (${vehicle.summary.speedKphOrKmh.toFixed(0)} km/h)` : '--'}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Total Distance</span>
              <span className="vm__value">
                {vehicle.summary ? `${vehicle.summary.distanceKm.toFixed(2)} km (${vehicle.summary.distanceMiles.toFixed(2)} mi)` : '--'}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Journey Duration</span>
              <span className="vm__value">
                {vehicle.summary ? vehicle.summary.durationHms : '--'}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Start Time (UTC)</span>
              <span className="vm__value">{formatDateTime(vehicle.summary?.startTime)}</span>
            </div>
            <div className="vm__field">
              <span className="vm__label">End Time (UTC)</span>
              <span className="vm__value">
                {vehicle.summary ? `${formatDateTime(vehicle.summary.endTime)} (Est)` : '--'}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Current Coordinates</span>
              <span className="vm__value vm__value--coords">
                Lat: {vehicle.currentCoords.lat.toFixed(5)}, Lon: {vehicle.currentCoords.lon.toFixed(5)}
              </span>
            </div>
            <div className="vm__field">
              <span className="vm__label">Last Updated</span>
              <span className="vm__value">{formatDateTime(vehicle.lastUpdated)}</span>
            </div>
          </div>

          {vehicle.status === 'Off Route' && (
            <div className="vm__alert vm__alert--danger">
              <span className="vm__alert-icon">⚠️</span>
              <div className="vm__alert-content">
                <h4 className="vm__alert-title">Route Compliance Alert</h4>
                <p className="vm__alert-desc">
                  This vehicle has deviated from its scheduled planned path. An incorrect route was detected.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="vm__footer">
          <button type="button" className="vm__btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
