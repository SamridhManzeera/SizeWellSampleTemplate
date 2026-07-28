import { formatDateShort, formatDayName } from '../../../Requests/deliverySlotUtils';
import './SLTCapacityModal.scss';

interface DayCapacity {
  date: string;
  capacity: number;
}

interface SLTCapacityModalProps {
  open: boolean;
  weekLabel: string;
  totalCapacity: number;
  days: DayCapacity[];
  onClose: () => void;
}

function SLTCapacityModal({
  open,
  weekLabel,
  totalCapacity,
  days,
  onClose,
}: SLTCapacityModalProps) {
  if (!open) return null;

  return (
    <div className="scm-backdrop" onClick={onClose} role="presentation">
      <div
        className="scm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="scm__header">
          <div>
            <h2 className="scm__title">Weekly Slot Capacity</h2>
            <p className="scm__subtitle">
              From Schedule Config · {weekLabel}
            </p>
          </div>
          <button
            type="button"
            className="scm__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="scm__list">
          {days.map(({ date, capacity }) => (
            <div key={date} className="scm__row">
              <div className="scm__row-date">
                <span className="scm__row-date-num">
                  {formatDateShort(date)}
                </span>
                <span className="scm__row-day-name">
                  {formatDayName(date)}
                </span>
              </div>
              <span className="scm__row-capacity">{capacity}</span>
            </div>
          ))}
        </div>

        <div className="scm__footer">
          <span className="scm__footer-label">Total for the week</span>
          <span className="scm__footer-val">{totalCapacity}</span>
        </div>
      </div>
    </div>
  );
}

export default SLTCapacityModal;
