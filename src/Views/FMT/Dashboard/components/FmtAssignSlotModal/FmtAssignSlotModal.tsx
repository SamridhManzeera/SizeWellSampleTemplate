import { useState, useEffect, FormEvent } from 'react';
import { FmtBooking, FmtCompany, FmtModalMode } from '../../types';
import './FmtAssignSlotModal.scss';

interface FmtAssignSlotModalProps {
  open: boolean;
  mode: FmtModalMode;
  hour: number;
  selectedDate: string;
  company: FmtCompany | null;
  currentDistributed: number;
  currentHourTotal: number;
  hourCapacity: number;
  totalSlotCapacity: number;
  existingBooking?: FmtBooking;
  onConfirm: (data: { movementCount: number; notes: string }) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(
    2,
    '0'
  )}:00`;
}

function FmtAssignSlotModal({
  open,
  mode,
  hour,
  selectedDate,
  company,
  currentDistributed,
  currentHourTotal,
  hourCapacity,
  totalSlotCapacity,
  existingBooking,
  onConfirm,
  onClose,
}: FmtAssignSlotModalProps) {
  const [movementCount, setMovementCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  const existingCount =
    isEdit && existingBooking ? existingBooking.movementCount : 0;
  const remaining = company
    ? company.allocatedCapacity - currentDistributed + existingCount
    : 0;

  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && existingBooking) {
        setMovementCount(existingBooking.movementCount);
        setNotes(existingBooking.notes);
      } else {
        setMovementCount(0);
        setNotes('');
      }
    }
  }, [open, isEdit, existingBooking]);

  if (!open || !company) return null;

  const isHourBlocked = hourCapacity === -1;
  const effectiveHourLimit = isHourBlocked
    ? 0
    : hourCapacity === 0
      ? totalSlotCapacity
      : hourCapacity;
  const hourRemaining = effectiveHourLimit - currentHourTotal;
  const maxAllowed = Math.max(0, Math.min(remaining, hourRemaining));

  const canIncrease = movementCount < maxAllowed;
  const canDecrease = movementCount > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (movementCount === 0) {
      setError('Add at least 1 movement.');
      return;
    }
    onConfirm({ movementCount, notes });
  }

  const usedPct =
    company.allocatedCapacity > 0
      ? Math.round(
        ((company.allocatedCapacity - remaining) /
          company.allocatedCapacity) *
        100
      )
      : 0;

  return (
    <div className="fam-backdrop" onClick={onClose} role="presentation">
      <div
        className="fam"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="fam__header">
          <div className="fam__header-left">
            <span
              className={`fam__mode-tag fam__mode-tag--${isEdit ? 'edit' : 'create'
                }`}
            >
              {isEdit ? 'Edit' : 'New'}
            </span>
            <div>
              <h2 className="fam__title">
                {isEdit ? 'Edit Distribute Allocated Delivery' : 'Distribute Allocated Delivery'}
              </h2>
              <p className="fam__subtitle">
                {company.name} · {formatHour(hour)} ·{' '}
                {selectedDate.split('-').reverse().join('/')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="fam__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="fam__cap-strip">
          <div className="fam__cap-item">
            <span className="fam__cap-label">Allocated Company Slot</span>
            <span
              className={`fam__cap-val${remaining === 0
                ? ' fam__cap-val--warn'
                : remaining <= 2
                  ? ' fam__cap-val--low'
                  : ''
                }`}
            >
              {remaining - movementCount < 0 ? 0 : remaining - movementCount}{' '}
              remaining of {company.allocatedCapacity}
            </span>
            <div className="fam__cap-bar">
              <div
                className="fam__cap-fill"
                style={{
                  width: `${usedPct +
                    Math.round(
                      (movementCount / company.allocatedCapacity) * 100
                    )
                    }%`,
                }}
              />
            </div>
          </div>
          <div className="fam__cap-divider" />
          <div className="fam__cap-item">
            <span className="fam__cap-label">Hour capacity</span>
            <span
              className={`fam__cap-val${isHourBlocked
                ? ' fam__cap-val--warn'
                : hourRemaining <= 2
                  ? ' fam__cap-val--low'
                  : ''
                }`}
            >
              {isHourBlocked
                ? 'Blocked'
                : `${currentHourTotal + movementCount} / ${effectiveHourLimit}`}
            </span>
            <div className="fam__cap-bar">
              {!isHourBlocked && (
                <div
                  className="fam__cap-fill fam__cap-fill--hour"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((currentHourTotal + movementCount) /
                          effectiveHourLimit) *
                        100
                      )
                    )}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <form className="fam__form" onSubmit={handleSubmit}>
          <div className="fam__stepper-wrap">
            <p className="fam__stepper-label">Movement Count</p>
            <div className="fam__stepper">
              <button
                type="button"
                className="fam__stepper-btn fam__stepper-btn--dec"
                onClick={() => setMovementCount((c) => Math.max(0, c - 1))}
                disabled={!canDecrease}
                aria-label="Decrease"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <div className="fam__stepper-display">
                <span className="fam__stepper-num">{movementCount}</span>
                <span className="fam__stepper-of">
                  of {maxAllowed} available
                </span>
              </div>
              <button
                type="button"
                className="fam__stepper-btn fam__stepper-btn--inc"
                onClick={() => {
                  if (canIncrease) setMovementCount((c) => c + 1);
                }}
                disabled={!canIncrease}
                aria-label="Increase"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            {maxAllowed > 0 && (
              <div className="fam__stepper-progress">
                <div
                  className="fam__stepper-progress-fill"
                  style={{
                    width: `${Math.round((movementCount / maxAllowed) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="fam__field">
            <label htmlFor="fam-notes" className="fam__label">
              Notes / Remarks
            </label>
            <textarea
              id="fam-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="fam__textarea"
              rows={3}
              placeholder="Special instructions, load type, bay requirements..."
            />
          </div>

          {error && <p className="fam__error">{error}</p>}

          <div className="fam__actions">
            <button
              type="button"
              className="fam__btn fam__btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fam__btn fam__btn--confirm"
              disabled={remaining === 0}
            >
              {isEdit ? 'Save Changes' : 'Assign Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FmtAssignSlotModal;
