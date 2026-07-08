import { RouteException, GeoFence } from '../../../types/liveTracking';
import './ConfirmModal.scss';

interface ConfirmModalProps {
  open: boolean;
  exception: RouteException | null;
  geofences: GeoFence[];
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  open,
  exception,
  geofences,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!open || !exception) return null;

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="co-backdrop" onClick={onClose} role="presentation">
      <div
        className="co-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="co-modal__header">
          <h2 className="co-modal__title">Disable Route Exception</h2>
          <button
            type="button"
            className="co-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="co-modal__body">
          <p className="co-modal__message">
            Disabling this route exception will immediately return the vehicle
            to normal compliance checks. Any skipped checkpoints or restricted
            entries will no longer be exempted.
          </p>

          {/* Section 1: Exception Details */}
          <div className="co-modal__section">
            <h4 className="co-modal__section-title">Exception Details</h4>
            <div className="co-modal__details-grid">
              <div className="co-modal__detail-item">
                <span className="co-modal__detail-lbl">Vehicle</span>
                <span className="co-modal__detail-val">
                  {exception.vehicleId}
                </span>
              </div>
              <div className="co-modal__detail-item">
                <span className="co-modal__detail-lbl">Reason</span>
                <span className="co-modal__detail-val">{exception.reason}</span>
              </div>
              <div className="co-modal__detail-item">
                <span className="co-modal__detail-lbl">Valid From</span>
                <span className="co-modal__detail-val">
                  {formatDateTime(exception.validFrom)}
                </span>
              </div>
              <div className="co-modal__detail-item">
                <span className="co-modal__detail-lbl">Valid Until</span>
                <span className="co-modal__detail-val">
                  {formatDateTime(exception.validUntil)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Allowed Exceptions */}
          <div className="co-modal__section">
            <h4 className="co-modal__section-title">Allowed Exceptions</h4>
            <div className="co-modal__exemptions-list">
              {exception.geofenceIds.map((gfId) => {
                const gf = geofences.find((g) => g.id === gfId);
                if (!gf) return null;
                const isGo = gf.type === 'go';
                const label = isGo
                  ? `Skip ${gf.name}`
                  : `Allow Entry to ${gf.name}`;
                return (
                  <div key={gfId} className="co-modal__exemption-row">
                    <span className="co-modal__exemption-icon">✓</span>
                    <span className="co-modal__exemption-text">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="co-modal__footer">
          <button
            type="button"
            className="co-modal__btn co-modal__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="co-modal__btn co-modal__btn--confirm"
            onClick={onConfirm}
          >
            Disable Exception
          </button>
        </div>
      </div>
    </div>
  );
}
