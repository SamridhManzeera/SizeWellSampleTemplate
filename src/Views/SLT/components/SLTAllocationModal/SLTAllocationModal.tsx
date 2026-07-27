import { useState, useEffect, FormEvent } from 'react';
import { DeliveryRequest } from '../../../Requests/requestTypes';
import {
  formatDateFull,
  emptyCounts,
  rowTotal,
} from '../../../Requests/deliverySlotUtils';
import './SLTAllocationModal.scss';

interface SLTAllocationModalProps {
  open: boolean;
  request: DeliveryRequest | null;
  date: string;
  onConfirm: (allocatedTotal: number) => void;
  onClose: () => void;
}

function SLTAllocationModal({
  open,
  request,
  date,
  onConfirm,
  onClose,
}: SLTAllocationModalProps) {
  const [allocatedTotal, setAllocatedTotal] = useState(0);

  useEffect(() => {
    if (open && request) {
      const requestedTotal = rowTotal(request.dailySlots[date] ?? emptyCounts());
      const currentAllocated = rowTotal(
        request.allocatedSlots[date] ?? emptyCounts()
      );
      setAllocatedTotal(Math.min(currentAllocated, requestedTotal));
    }
  }, [open, request, date]);

  if (!open || !request) return null;

  const requestedCounts = request.dailySlots[date] ?? emptyCounts();
  const requestedTotal = rowTotal(requestedCounts);
  const canIncrease = allocatedTotal < requestedTotal;
  const canDecrease = allocatedTotal > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onConfirm(allocatedTotal);
  }

  return (
    <div className="sam-backdrop" onClick={onClose} role="presentation">
      <div
        className="sam"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sam__header">
          <div className="sam__header-left">
            <span className="sam__mode-tag">Edit</span>
            <div>
              <h2 className="sam__title">Edit Allocated Delivery</h2>
              <p className="sam__subtitle">
                {request.contractorName} · {request.id} ·{' '}
                {formatDateFull(date)}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="sam__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="sam__requested-card">
          <span className="sam__requested-title">Requested for this day</span>
          <div className="sam__requested-breakdown">
            <div className="sam__requested-item">
              <span className="sam__requested-num">
                {requestedCounts.twoWay}
              </span>
              <span className="sam__requested-label">Two-way</span>
            </div>
            <div className="sam__requested-item">
              <span className="sam__requested-num">
                {requestedCounts.inbound}
              </span>
              <span className="sam__requested-label">Inbound</span>
            </div>
            <div className="sam__requested-item">
              <span className="sam__requested-num">
                {requestedCounts.outbound}
              </span>
              <span className="sam__requested-label">Outbound</span>
            </div>
            <div className="sam__requested-item sam__requested-item--total">
              <span className="sam__requested-num">{requestedTotal}</span>
              <span className="sam__requested-label">Total</span>
            </div>
          </div>
        </div>

        <form className="sam__form" onSubmit={handleSubmit}>
          <div className="sam__stepper-wrap">
            <p className="sam__stepper-label">Allocated Slots</p>
            <div className="sam__stepper">
              <button
                type="button"
                className="sam__stepper-btn sam__stepper-btn--dec"
                onClick={() => {
                  if (canDecrease) setAllocatedTotal((c) => c - 1);
                }}
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
              <div className="sam__stepper-display">
                <span className="sam__stepper-num">{allocatedTotal}</span>
                <span className="sam__stepper-of">of {requestedTotal} requested</span>
              </div>
              <button
                type="button"
                className="sam__stepper-btn sam__stepper-btn--inc"
                onClick={() => {
                  if (canIncrease) setAllocatedTotal((c) => c + 1);
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
          </div>

          <div className="sam__actions">
            <button
              type="button"
              className="sam__btn sam__btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="sam__btn sam__btn--confirm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SLTAllocationModal;
