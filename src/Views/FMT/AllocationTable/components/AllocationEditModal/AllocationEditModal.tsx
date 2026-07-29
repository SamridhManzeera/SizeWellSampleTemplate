import { useState, useEffect, FormEvent } from 'react';
import { FmtBooking, FmtCompany } from '../../../types';
import './AllocationEditModal.scss';

interface AllocationEditModalProps {
  open: boolean;
  company: FmtCompany | null;
  hour: number;
  selectedDate: string;
  currentDistributed: number;
  currentHourTotal: number;
  hourCapacity: number;
  totalSlotCapacity: number;
  existingBooking?: FmtBooking;
  onConfirm: (movementCount: number, notes: string) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(
    2,
    '0'
  )}:00`;
}

function AllocationEditModal({
  open,
  company,
  hour,
  selectedDate,
  currentDistributed,
  currentHourTotal,
  hourCapacity,
  totalSlotCapacity,
  existingBooking,
  onConfirm,
  onClose,
}: AllocationEditModalProps) {
  const [movementCount, setMovementCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const isEdit = !!existingBooking;
  const existingCount = existingBooking ? existingBooking.movementCount : 0;
  const remaining = company
    ? company.allocatedCapacity - currentDistributed + existingCount
    : 0;

  useEffect(() => {
    if (open) {
      setError('');
      setMovementCount(existingBooking ? existingBooking.movementCount : 0);
      setNotes(existingBooking ? existingBooking.notes : '');
    }
  }, [open, existingBooking]);

  if (!open || !company) return null;

  const isHourBlocked = hourCapacity === -1;
  const effectiveHourLimit = isHourBlocked
    ? 0
    : hourCapacity === 0
      ? totalSlotCapacity
      : hourCapacity;
  const hourRemaining = effectiveHourLimit - currentHourTotal;
  // Hour capacity is a hard physical limit; the daily allocated quota is not —
  // movements can exceed it, but the UI flags it in red when they do.
  const maxAllowed = Math.max(0, hourRemaining);

  const canIncrease = movementCount < maxAllowed;
  const canDecrease = movementCount > 0;

  const displayRemaining = remaining - movementCount;
  const isOverAllocated = displayRemaining < 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (movementCount === 0 && !isEdit) {
      setError('Add at least 1 movement.');
      return;
    }
    onConfirm(movementCount, notes);
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
    <div className="aem-backdrop" onClick={onClose} role="presentation">
      <div
        className="aem"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="aem__header">
          <div className="aem__header-left">
            <span
              className={`aem__mode-tag aem__mode-tag--${isEdit ? 'edit' : 'create'}`}
            >
              {isEdit ? 'Edit' : 'New'}
            </span>
            <div>
              <h2 className="aem__title">
                {isEdit ? 'Edit Allocation' : 'Allocate Movements'}
              </h2>
              <p className="aem__subtitle">
                {company.name} · {formatHour(hour)} ·{' '}
                {selectedDate.split('-').reverse().join('/')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="aem__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="aem__cap-strip">
          <div className="aem__cap-item">
            <span className="aem__cap-label">Daily Allocated</span>
            <span
              className={`aem__cap-val${isOverAllocated
                ? ' aem__cap-val--over'
                : displayRemaining === 0
                  ? ' aem__cap-val--warn'
                  : displayRemaining <= 2
                    ? ' aem__cap-val--low'
                    : ''
                }`}
            >
              {isOverAllocated
                ? `${Math.abs(displayRemaining)} over allocated (${company.allocatedCapacity})`
                : `${displayRemaining} remaining of ${company.allocatedCapacity}`}
            </span>
            <div className="aem__cap-bar">
              <div
                className={`aem__cap-fill${isOverAllocated ? ' aem__cap-fill--over' : ''}`}
                style={{
                  width: `${Math.min(
                    100,
                    usedPct +
                    Math.round(
                      (movementCount / company.allocatedCapacity) * 100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="aem__cap-divider" />
          <div className="aem__cap-item">
            <span className="aem__cap-label">Hour capacity</span>
            <span
              className={`aem__cap-val${isHourBlocked
                ? ' aem__cap-val--warn'
                : hourRemaining <= 2
                  ? ' aem__cap-val--low'
                  : ''
                }`}
            >
              {isHourBlocked
                ? 'Blocked'
                : `${currentHourTotal + movementCount} / ${effectiveHourLimit}`}
            </span>
            <div className="aem__cap-bar">
              {!isHourBlocked && (
                <div
                  className="aem__cap-fill aem__cap-fill--hour"
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

        <form className="aem__form" onSubmit={handleSubmit}>
          <div className="aem__stepper-wrap">
            <p className="aem__stepper-label">Movement Count</p>
            <div className="aem__stepper">
              <button
                type="button"
                className="aem__stepper-btn aem__stepper-btn--dec"
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
              <div className="aem__stepper-display">
                <input
                  type="number"
                  className={`aem__stepper-input${isOverAllocated ? ' aem__stepper-input--over' : ''}`}
                  value={movementCount}
                  min={0}
                  max={maxAllowed}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setMovementCount(
                      isNaN(v) ? 0 : Math.min(maxAllowed, Math.max(0, v))
                    );
                  }}
                  aria-label="Movement count"
                />
                <span
                  className={`aem__stepper-of${isOverAllocated ? ' aem__stepper-of--over' : ''}`}
                >
                  {isOverAllocated
                    ? `${Math.abs(displayRemaining)} over daily allocation`
                    : `of ${maxAllowed} available`}
                </span>
              </div>
              <button
                type="button"
                className="aem__stepper-btn aem__stepper-btn--inc"
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
              <div className="aem__stepper-progress">
                <div
                  className="aem__stepper-progress-fill"
                  style={{
                    width: `${Math.round((movementCount / maxAllowed) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="aem__field">
            <label htmlFor="aem-notes" className="aem__label">
              Notes / Remarks
            </label>
            <textarea
              id="aem-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="aem__textarea"
              rows={3}
              placeholder="Special instructions, load type, bay requirements..."
            />
          </div>

          {error && <p className="aem__error">{error}</p>}

          <div className="aem__actions">
            <button
              type="button"
              className="aem__btn aem__btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="aem__btn aem__btn--confirm"
              disabled={movementCount === 0 && !isEdit}
            >
              {isEdit ? 'Save Changes' : 'Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllocationEditModal;
