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
  existingAllocation?: Allocation;
  onConfirm: (data: { inboundCount: number; outboundCount: number; notes: string }) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`;
}

function AllocationModal({
  open, mode, hour, selectedDate, company, currentAllocated, existingAllocation, onConfirm, onClose,
}: AllocationModalProps) {
  const [inbound,  setInbound]  = useState(0);
  const [outbound, setOutbound] = useState(0);
  const [notes,    setNotes]    = useState('');
  const [error,    setError]    = useState('');

  const isEdit = mode === 'edit';

  const existing = isEdit && existingAllocation ? existingAllocation.inboundCount + existingAllocation.outboundCount : 0;
  const remaining = company ? company.assignedDeliveries - currentAllocated + existing : 0;

  const total    = inbound + outbound;
  const usedPct  = company ? Math.round(((company.assignedDeliveries - remaining) / company.assignedDeliveries) * 100) : 0;
  const availPct = company ? Math.round((remaining / company.assignedDeliveries) * 100) : 0;

  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && existingAllocation) {
        setInbound(existingAllocation.inboundCount);
        setOutbound(existingAllocation.outboundCount);
        setNotes(existingAllocation.notes);
      } else {
        setInbound(0);
        setOutbound(0);
        setNotes('');
      }
    }
  }, [open, isEdit, existingAllocation]);

  if (!open || !company) return null;

  const canAdd = total < remaining;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (total === 0) { setError('Add at least 1 inbound or outbound delivery.'); return; }
    onConfirm({ inboundCount: inbound, outboundCount: outbound, notes });
  }

  return (
    <div className="am-backdrop" onClick={onClose} role="presentation">
      <div className="am" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="am__header">
          <div className="am__header-left">
            <span className={`am__mode-tag am__mode-tag--${isEdit ? 'edit' : 'create'}`}>
              {isEdit ? 'Edit' : 'New'}
            </span>
            <div className="am__title-block">
              <h2 className="am__title">{isEdit ? 'Edit Allocation' : 'Allocate Delivery Slot'}</h2>
              <p className="am__subtitle">Set inbound and outbound delivery counts</p>
            </div>
          </div>
          <button type="button" className="am__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Meta ────────────────────────────────────────── */}
        <div className="am__meta">
          <div className="am__meta-item">
            <span className="am__meta-label">Structure</span>
            <span className="am__meta-value">{company.name}</span>
          </div>
          <div className="am__meta-item">
            <span className="am__meta-label">Time Slot</span>
            <span className="am__meta-value">{formatHour(hour)}</span>
          </div>
          <div className="am__meta-item">
            <span className="am__meta-label">Date</span>
            <span className="am__meta-value">{selectedDate.split('-').reverse().join('/')}</span>
          </div>
          <div className="am__meta-item">
            <span className={`am__meta-value${remaining === 0 ? ' am__meta-value--warn' : remaining <= 2 ? ' am__meta-value--low' : ''}`}>
              {remaining} / {company.assignedDeliveries} remaining
            </span>
            <div className="am__capacity-bar">
              <div className="am__capacity-fill" style={{ width: `${usedPct}%` }} />
            </div>
            <span className="am__capacity-pct">{availPct}% available</span>
          </div>
        </div>

        <form className="am__form" onSubmit={handleSubmit}>

          {/* ── Counter cards ────────────────────────────── */}
          <div className="am__cards">

            {/* Inbound */}
            <div className="am__card am__card--inbound">
              <div className="am__card-header">
                <span className="am__card-icon am__card-icon--inbound">↑</span>
                <span className="am__card-name">Inbound</span>
              </div>
              <span className="am__card-label">Deliveries</span>
              <div className="am__counter">
                <button
                  type="button"
                  className="am__counter-btn"
                  onClick={() => setInbound(c => Math.max(0, c - 1))}
                  disabled={inbound === 0}
                  aria-label="Decrease inbound"
                >
                  −
                </button>
                <span className="am__counter-val am__counter-val--inbound">{inbound}</span>
                <button
                  type="button"
                  className="am__counter-btn"
                  onClick={() => { if (canAdd) setInbound(c => c + 1); }}
                  disabled={!canAdd}
                  aria-label="Increase inbound"
                >
                  +
                </button>
              </div>
              <div className="am__card-footer">
                <span className="am__card-total-label">Total</span>
                <span className="am__card-total-val am__card-total-val--inbound">{inbound}</span>
              </div>
            </div>

            {/* Outbound */}
            <div className="am__card am__card--outbound">
              <div className="am__card-header">
                <span className="am__card-icon am__card-icon--outbound">↓</span>
                <span className="am__card-name">Outbound</span>
              </div>
              <span className="am__card-label">Deliveries</span>
              <div className="am__counter">
                <button
                  type="button"
                  className="am__counter-btn"
                  onClick={() => setOutbound(c => Math.max(0, c - 1))}
                  disabled={outbound === 0}
                  aria-label="Decrease outbound"
                >
                  −
                </button>
                <span className="am__counter-val am__counter-val--outbound">{outbound}</span>
                <button
                  type="button"
                  className="am__counter-btn"
                  onClick={() => { if (canAdd) setOutbound(c => c + 1); }}
                  disabled={!canAdd}
                  aria-label="Increase outbound"
                >
                  +
                </button>
              </div>
              <div className="am__card-footer">
                <span className="am__card-total-label">Total</span>
                <span className="am__card-total-val am__card-total-val--outbound">{outbound}</span>
              </div>
            </div>
          </div>

          <div className="am__total-bar">
            <span className="am__total-bar-text">
              ⓘ Total deliveries for this slot
            </span>
            <span className="am__total-bar-num">Total: {total}</span>
          </div>

          {/* ── Notes ───────────────────────────────────── */}
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
