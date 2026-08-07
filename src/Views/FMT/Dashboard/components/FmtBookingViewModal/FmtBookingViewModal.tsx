import { useNavigate } from 'react-router-dom';
import { FmtBooking, FmtCompany } from '../../../types';
import './FmtBookingViewModal.scss';

interface FmtBookingViewModalProps {
  open: boolean;
  booking: FmtBooking | null;
  company: FmtCompany | null;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(
    2,
    '0'
  )}:00`;
}

function FmtBookingViewModal({
  open,
  booking,
  company,
  onClose,
}: FmtBookingViewModalProps) {
  const navigate = useNavigate();

  if (!open || !booking || !company) return null;

  return (
    <div className="fbv-backdrop" onClick={onClose} role="presentation">
      <div
        className="fbv"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="fbv__header">
          <div className="fbv__header-left">
            <span className="fbv__mode-tag">View</span>
            <div>
              <h2 className="fbv__title">
                Booking Details
                {booking.isEmergency && (
                  <span className="fbv__emergency-tag">⚡ Emergency</span>
                )}
              </h2>
              <p className="fbv__subtitle">
                {company.name} · {formatHour(booking.hour)} ·{' '}
                {booking.date.split('-').reverse().join('/')}
                {booking.isEmergency && booking.requestId && (
                  <> · Request {booking.requestId}</>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="fbv__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="fbv__stats">
          <div className="fbv__stat">
            <span className="fbv__stat-label">Allocated</span>
            <span className="fbv__stat-val fbv__stat-val--alloc">
              {booking.movementCount}
            </span>
          </div>
          <div className="fbv__stat">
            <span className="fbv__stat-label">Booked</span>
            <span className="fbv__stat-val fbv__stat-val--booked">
              {booking.bookedCount}
            </span>
          </div>
        </div>

        <div className="fbv__breakdown">
          <span className="fbv__breakdown-title">Booked Breakdown</span>
          <div className="fbv__breakdown-row">
            <div className="fbv__breakdown-item fbv__breakdown-item--twoway">
              <span className="fbv__breakdown-num">{booking.twoWay}</span>
              <span className="fbv__breakdown-label">Two-way</span>
            </div>
            <div className="fbv__breakdown-item fbv__breakdown-item--inbound">
              <span className="fbv__breakdown-num">{booking.inbound}</span>
              <span className="fbv__breakdown-label">Inbound</span>
            </div>
            <div className="fbv__breakdown-item fbv__breakdown-item--outbound">
              <span className="fbv__breakdown-num">{booking.outbound}</span>
              <span className="fbv__breakdown-label">Outbound</span>
            </div>
          </div>
        </div>

        <div className="fbv__field">
          <span className="fbv__label">Notes</span>
          <p className="fbv__notes">{booking.notes || 'No notes added.'}</p>
        </div>

        <div className="fbv__actions">
          {booking.isEmergency && booking.requestId && (
            <button
              type="button"
              className="fbv__btn fbv__btn--view-request"
              onClick={() =>
                navigate(`/fmt/emergency-requests/${booking.requestId}`, {
                  state: { from: '/fmt/dashboard' },
                })
              }
            >
              View Request
            </button>
          )}
          <button
            type="button"
            className="fbv__btn fbv__btn--close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FmtBookingViewModal;
