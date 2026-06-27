import { useState, useEffect, FormEvent } from 'react';
import { Allocation, Company, ModalMode } from '../../types';
import './AllocationModal.scss';

interface AllocationModalProps {
  open: boolean;
  mode: ModalMode;
  hour: number;
  selectedDate: string;
  company: Company | null;
  currentAllocated: number;
  currentHourTotal: number;
  hourCapacity: number;
  totalSlotCapacity: number;
  existingAllocation?: Allocation;
  onConfirm: (data: { totalCount: number; notes: string }) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`;
}

function AllocationModal({
  open, mode, hour, selectedDate, company, currentAllocated,
  currentHourTotal, hourCapacity, totalSlotCapacity, existingAllocation, onConfirm, onClose,
}: AllocationModalProps) {
  const [totalCount, setTotalCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  const existingTotal = isEdit && existingAllocation
    ? existingAllocation.inboundCount + existingAllocation.outboundCount + existingAllocation.twoWayCount * 2
    : 0;
  const remaining = company ? company.assignedDeliveries - currentAllocated + existingTotal : 0;
  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && existingAllocation) {
        setTotalCount(
          existingAllocation.inboundCount + existingAllocation.outboundCount + existingAllocation.twoWayCount * 2
        );
        setNotes(existingAllocation.notes);
      } else {
        setTotalCount(0);
        setNotes('');
      }
    }
  }, [open, isEdit, existingAllocation]);

  if (!open || !company) return null;

  const isHourBlocked      = hourCapacity === -1;
  const effectiveHourLimit = isHourBlocked ? 0 : (hourCapacity === 0 ? totalSlotCapacity : hourCapacity);
  const hourRemaining      = effectiveHourLimit - currentHourTotal;
  const maxAllowed         = Math.min(remaining, hourRemaining);

  const canIncrease = totalCount < maxAllowed;
  const canDecrease = totalCount > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (totalCount === 0) { setError('Add at least 1 delivery.'); return; }
    onConfirm({ totalCount, notes });
  }

  const companyUsedPct = company.assignedDeliveries > 0
    ? Math.round(((company.assignedDeliveries - remaining) / company.assignedDeliveries) * 100)
    : 0;

  return (
    <div className="am-backdrop" onClick={onClose} role="presentation">
      <div className="am" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="am__header">
          <div className="am__header-left">
            <span className={`am__mode-tag am__mode-tag--${isEdit ? 'edit' : 'create'}`}>
              {isEdit ? 'Edit' : 'New'}
            </span>
            <div>
              <h2 className="am__title">{isEdit ? 'Edit Allocation' : 'Allocate Delivery Slot'}</h2>
              <p className="am__subtitle">{company.name} · {formatHour(hour)} · {selectedDate.split('-').reverse().join('/')}</p>
            </div>
          </div>
          <button type="button" className="am__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Capacity strip ────────────────────────────────── */}
        <div className="am__cap-strip">
          <div className="am__cap-item">
            <span className="am__cap-label">Company slots</span>
            <span className={`am__cap-val${remaining === 0 ? ' am__cap-val--warn' : remaining <= 2 ? ' am__cap-val--low' : ''}`}>
              {remaining - totalCount < 0 ? 0 : remaining - totalCount} remaining of {company.assignedDeliveries}
            </span>
            <div className="am__cap-bar">
              <div className="am__cap-fill" style={{ width: `${companyUsedPct + Math.round((totalCount / company.assignedDeliveries) * 100)}%` }} />
            </div>
          </div>
          <div className="am__cap-divider" />
          <div className="am__cap-item">
            <span className="am__cap-label">Hour capacity</span>
            <span className={`am__cap-val${isHourBlocked ? ' am__cap-val--warn' : hourRemaining <= 2 ? ' am__cap-val--low' : ''}`}>
              {isHourBlocked ? 'Blocked' : `${currentHourTotal + totalCount} / ${effectiveHourLimit}`}
            </span>
            <div className="am__cap-bar">
              {!isHourBlocked && (
                <div className="am__cap-fill am__cap-fill--hour"
                  style={{ width: `${Math.min(100, Math.round(((currentHourTotal + totalCount) / effectiveHourLimit) * 100))}%` }} />
              )}
            </div>
          </div>
        </div>

        <form className="am__form" onSubmit={handleSubmit}>

          {/* ── Stepper ───────────────────────────────────────── */}
          <div className="am__stepper-wrap">
            <p className="am__stepper-label">Total Deliveries</p>
            <div className="am__stepper">
              <button
                type="button"
                className="am__stepper-btn am__stepper-btn--dec"
                onClick={() => setTotalCount(c => Math.max(0, c - 1))}
                disabled={!canDecrease}
                aria-label="Decrease"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <div className="am__stepper-display">
                <span className="am__stepper-num">{totalCount}</span>
                <span className="am__stepper-of">of {maxAllowed} available</span>
              </div>
              <button
                type="button"
                className="am__stepper-btn am__stepper-btn--inc"
                onClick={() => { if (canIncrease) setTotalCount(c => c + 1); }}
                disabled={!canIncrease}
                aria-label="Increase"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            {maxAllowed > 0 && (
              <div className="am__stepper-progress">
                <div className="am__stepper-progress-fill" style={{ width: `${Math.round((totalCount / maxAllowed) * 100)}%` }} />
              </div>
            )}
          </div>

          {/* ── Notes ─────────────────────────────────────────── */}
          <div className="am__field">
            <label htmlFor="am-notes" className="am__label">Notes / Remarks</label>
            <textarea
              id="am-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="am__textarea"
              rows={3}
              placeholder="Special instructions, load type, bay requirements..."
            />
          </div>

          {error && <p className="am__error">{error}</p>}

          <div className="am__actions">
            <button type="button" className="am__btn am__btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="am__btn am__btn--confirm" disabled={remaining === 0}>
              {isEdit ? 'Save Changes' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllocationModal;
