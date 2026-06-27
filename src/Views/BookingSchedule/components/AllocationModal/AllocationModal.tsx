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
  hourCapacity: number;      // -1 = blocked, 0 = unlimited (capped at totalSlotCapacity), >0 = specific limit
  totalSlotCapacity: number;
  existingAllocation?: Allocation;
  onConfirm: (data: { inboundCount: number; outboundCount: number; twoWayCount: number; notes: string }) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`;
}

function AllocationModal({
  open, mode, hour, selectedDate, company, currentAllocated,
  currentHourTotal, hourCapacity, totalSlotCapacity, existingAllocation, onConfirm, onClose,
}: AllocationModalProps) {
  const [inbound,  setInbound]  = useState(0);
  const [outbound, setOutbound] = useState(0);
  const [twoWay,   setTwoWay]   = useState(0);
  const [notes,    setNotes]    = useState('');
  const [error,    setError]    = useState('');

  const isEdit = mode === 'edit';

  const existing  = isEdit && existingAllocation
    ? existingAllocation.inboundCount + existingAllocation.outboundCount + existingAllocation.twoWayCount * 2
    : 0;
  const remaining = company ? company.assignedDeliveries - currentAllocated + existing : 0;

  // twoWay counts as 2 towards total
  const total    = inbound + outbound + twoWay * 2;
  const usedPct  = company ? Math.round(((company.assignedDeliveries - remaining) / company.assignedDeliveries) * 100) : 0;
  const availPct = company ? Math.round((remaining / company.assignedDeliveries) * 100) : 0;

  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && existingAllocation) {
        setInbound(existingAllocation.inboundCount);
        setOutbound(existingAllocation.outboundCount);
        setTwoWay(existingAllocation.twoWayCount);
        setNotes(existingAllocation.notes);
      } else {
        setInbound(0);
        setOutbound(0);
        setTwoWay(0);
        setNotes('');
      }
    }
  }, [open, isEdit, existingAllocation]);

  if (!open || !company) return null;

  // 0 = no specific limit (uses totalSlotCapacity), -1 = blocked, >0 = specific limit
  const isHourBlocked      = hourCapacity === -1;
  const effectiveHourLimit = isHourBlocked ? 0 : (hourCapacity === 0 ? totalSlotCapacity : hourCapacity);
  const hourRemaining      = effectiveHourLimit - currentHourTotal;
  const canAdd         = total + 1 <= remaining && total + 1 <= hourRemaining;
  const canAddTwoWay   = total + 2 <= remaining && total + 2 <= hourRemaining;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (total === 0) { setError('Add at least 1 inbound, outbound, or two-way delivery.'); return; }
    onConfirm({ inboundCount: inbound, outboundCount: outbound, twoWayCount: twoWay, notes });
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
                <button type="button" className="am__counter-btn" onClick={() => setInbound(c => Math.max(0, c - 1))} disabled={inbound === 0} aria-label="Decrease inbound">−</button>
                <span className="am__counter-val am__counter-val--inbound">{inbound}</span>
                <button type="button" className="am__counter-btn" onClick={() => { if (canAdd) setInbound(c => c + 1); }} disabled={!canAdd} aria-label="Increase inbound">+</button>
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
                <button type="button" className="am__counter-btn" onClick={() => setOutbound(c => Math.max(0, c - 1))} disabled={outbound === 0} aria-label="Decrease outbound">−</button>
                <span className="am__counter-val am__counter-val--outbound">{outbound}</span>
                <button type="button" className="am__counter-btn" onClick={() => { if (canAdd) setOutbound(c => c + 1); }} disabled={!canAdd} aria-label="Increase outbound">+</button>
              </div>
              <div className="am__card-footer">
                <span className="am__card-total-label">Total</span>
                <span className="am__card-total-val am__card-total-val--outbound">{outbound}</span>
              </div>
            </div>

            {/* Two Way */}
            <div className="am__card am__card--twoway">
              <div className="am__card-header">
                <span className="am__card-icon am__card-icon--twoway">↕</span>
                <span className="am__card-name">Two Way</span>
              </div>
              <span className="am__card-label">↑ + ↓ each (×2)</span>
              <div className="am__counter">
                <button type="button" className="am__counter-btn" onClick={() => setTwoWay(c => Math.max(0, c - 1))} disabled={twoWay === 0} aria-label="Decrease two-way">−</button>
                <span className="am__counter-val am__counter-val--twoway">{twoWay}</span>
                <button type="button" className="am__counter-btn" onClick={() => { if (canAddTwoWay) setTwoWay(c => c + 1); }} disabled={!canAddTwoWay} aria-label="Increase two-way">+</button>
              </div>
              <div className="am__card-footer">
                <span className="am__card-total-label">Counts as</span>
                <span className="am__card-total-val am__card-total-val--twoway">{twoWay * 2}</span>
              </div>
            </div>
          </div>

          <div className="am__total-bar">
            <span className="am__total-bar-text">↕ Two Way counts as ×2</span>
            <div className="am__total-bar-stats">
              <span className="am__total-bar-num">Company: {total} / {remaining}</span>
              <span className={`am__total-bar-num${hourRemaining <= 0 ? ' am__total-bar-num--warn' : hourRemaining <= 2 ? ' am__total-bar-num--low' : ''}`}>
                {isHourBlocked ? 'Hour: Blocked' : `Hour: ${currentHourTotal + total} / ${effectiveHourLimit}`}
              </span>
            </div>
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
