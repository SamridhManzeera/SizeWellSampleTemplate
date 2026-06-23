import { useState, useEffect, FormEvent } from 'react';
import { Allocation, Company, ModalMode, VehicleRow } from '../../types';
import './AllocationModal.scss';

interface AllocationModalProps {
  open: boolean;
  mode: ModalMode;
  hour: number;
  selectedDate: string;
  company: Company | null;
  currentAllocated: number;
  existingAllocation?: Allocation;
  onConfirm: (data: { vehicles: VehicleRow[]; notes: string }) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`;
}

const EXAMPLE_VEHICLES = ['WK21PPF', 'MH12AB1234', 'DL1LAE3456', 'GJ01AB7890', 'TS09XY1234'];
const EXAMPLE_DRIVERS  = ['James Harlow', 'Michael Brown', 'Rajesh Kumar', 'Amit Singh', 'Suresh Patel'];

let _vid = 0;
const newVid = () => `vr-${Date.now()}-${++_vid}`;

function AllocationModal({
  open, mode, hour, selectedDate, company, currentAllocated, existingAllocation, onConfirm, onClose,
}: AllocationModalProps) {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [notes, setNotes]       = useState('');
  const [error, setError]       = useState('');

  const isEdit = mode === 'edit';

  const remaining = company
    ? company.assignedDeliveries - currentAllocated + (isEdit && existingAllocation ? existingAllocation.vehicles.length : 0)
    : 0;

  const oneWayCount = vehicles.filter(v => v.routeType === 'one-way').length;
  const twoWayCount = vehicles.filter(v => v.routeType === 'two-way').length;
  const totalCount  = vehicles.length;

  const usedPct = company ? Math.round(((company.assignedDeliveries - remaining) / company.assignedDeliveries) * 100) : 0;
  const availPct = company ? Math.round((remaining / company.assignedDeliveries) * 100) : 0;

  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && existingAllocation) {
        setVehicles(existingAllocation.vehicles.map(v => ({ ...v })));
        setNotes(existingAllocation.notes);
      } else {
        setVehicles([{ id: newVid(), routeType: 'one-way', vehicleNumber: '', driverName: '' }]);
        setNotes('');
      }
    }
  }, [open, isEdit, existingAllocation]);

  if (!open || !company) return null;

  function addRow() {
    if (totalCount >= remaining) return;
    setVehicles(prev => [...prev, { id: newVid(), routeType: 'one-way', vehicleNumber: '', driverName: '' }]);
  }

  function removeRow(id: string) {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }

  function updateRow(id: string, patch: Partial<VehicleRow>) {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
  }

  function toggleRouteType(id: string) {
    setVehicles(prev => prev.map(v =>
      v.id === id ? { ...v, routeType: v.routeType === 'one-way' ? 'two-way' : 'one-way' } : v
    ));
  }

  function autoFill() {
    setVehicles(prev => prev.map((v, i) => ({
      ...v,
      vehicleNumber: v.vehicleNumber || EXAMPLE_VEHICLES[i % EXAMPLE_VEHICLES.length],
      driverName:    v.driverName    || EXAMPLE_DRIVERS[i % EXAMPLE_DRIVERS.length],
    })));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (totalCount === 0) { setError('Add at least one vehicle.'); return; }
    const missing = vehicles.some(v => !v.vehicleNumber.trim());
    if (missing) { setError('Vehicle number is required for all rows.'); return; }
    onConfirm({
      vehicles: vehicles.map(v => ({ ...v, vehicleNumber: v.vehicleNumber.trim().toUpperCase() })),
      notes,
    });
  }

  return (
    <div className="am-backdrop" onClick={onClose} role="presentation">
      <div className="am" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="am__header">
          <div className="am__header-left">
            <span className={`am__mode-tag am__mode-tag--${isEdit ? 'edit' : 'create'}`}>
              {isEdit ? 'Edit' : 'New'}
            </span>
            <div className="am__title-block">
              <h2 className="am__title">{isEdit ? 'Edit Allocation' : 'Allocate Delivery Slot'}</h2>
              <p className="am__subtitle">Allocate deliveries with route type and vehicle details</p>
            </div>
          </div>
          <button type="button" className="am__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Meta ───────────────────────────────────────────── */}
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

          {/* ── Delivery allocation cards ───────────────────── */}
          <div>
            <h3 className="am__section-title">Delivery Allocation</h3>
            <div className="am__alloc-cards">
              <div className="am__alloc-card am__alloc-card--one-way">
                <div className="am__alloc-card-header">
                  <span className="am__alloc-icon am__alloc-icon--one-way">→</span>
                  <span className="am__alloc-card-name">One Way</span>
                </div>
                <span className="am__alloc-card-label">Deliveries</span>
                <span className="am__alloc-card-count am__alloc-card-count--one-way">{oneWayCount}</span>
                <div className="am__alloc-card-footer">
                  <span className="am__alloc-total-label">Total</span>
                  <span className="am__alloc-total-num am__alloc-total-num--one-way">{oneWayCount}</span>
                </div>
              </div>

              <div className="am__alloc-card am__alloc-card--two-way">
                <div className="am__alloc-card-header">
                  <span className="am__alloc-icon am__alloc-icon--two-way">↔</span>
                  <span className="am__alloc-card-name">Two Way</span>
                </div>
                <span className="am__alloc-card-label">Deliveries</span>
                <span className="am__alloc-card-count am__alloc-card-count--two-way">{twoWayCount}</span>
                <div className="am__alloc-card-footer">
                  <span className="am__alloc-total-label">Total</span>
                  <span className="am__alloc-total-num am__alloc-total-num--two-way">{twoWayCount}</span>
                </div>
              </div>
            </div>

            <div className="am__alloc-info">
              <span className="am__alloc-info-text">
                ⓘ Vehicle count will be same as total deliveries (One Way + Two Way).
              </span>
              <span className="am__alloc-total-deliveries">Total Deliveries: {totalCount}</span>
            </div>
          </div>

          {/* ── Vehicle table ───────────────────────────────── */}
          <div className="am__vehicles-section">
            <div className="am__vehicles-header">
              <h3 className="am__section-title am__section-title--sm">
                Vehicle &amp; Driver Details ({totalCount})
              </h3>
              <button type="button" className="am__autofill-btn" onClick={autoFill}>
                ⚡ Auto Fill
              </button>
            </div>

            {vehicles.length > 0 && (
              <div className="am__vehicles-table">
                <div className="am__vehicles-thead">
                  <span>#</span>
                  <span>Route Type</span>
                  <span>Vehicle Number <span className="am__req">*</span></span>
                  <span>Driver Name</span>
                  <span />
                </div>

                {vehicles.map((vr, i) => (
                  <div key={vr.id} className="am__vehicles-row">
                    <span className="am__vrow-num">{i + 1}</span>

                    <button
                      type="button"
                      className={`am__vrow-type am__vrow-type--${vr.routeType}`}
                      onClick={() => toggleRouteType(vr.id)}
                      title="Click to toggle route type"
                    >
                      {vr.routeType === 'one-way' ? '→ One Way' : '↔ Two Way'}
                    </button>

                    <div className="am__vrow-input-wrap">
                      <input
                        type="text"
                        value={vr.vehicleNumber}
                        onChange={e => { updateRow(vr.id, { vehicleNumber: e.target.value }); setError(''); }}
                        className="am__vrow-input am__vrow-input--upper"
                        placeholder={EXAMPLE_VEHICLES[i % EXAMPLE_VEHICLES.length]}
                      />
                      <span className="am__vrow-icon">🚗</span>
                    </div>

                    <div className="am__vrow-input-wrap">
                      <input
                        type="text"
                        value={vr.driverName}
                        onChange={e => updateRow(vr.id, { driverName: e.target.value })}
                        className="am__vrow-input"
                        placeholder={EXAMPLE_DRIVERS[i % EXAMPLE_DRIVERS.length]}
                      />
                      <span className="am__vrow-icon">👤</span>
                    </div>

                    <button
                      type="button"
                      className="am__vrow-delete"
                      onClick={() => removeRow(vr.id)}
                      aria-label="Remove row"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="am__vehicles-footer">
              <button
                type="button"
                className="am__add-row-btn"
                onClick={addRow}
                disabled={totalCount >= remaining}
              >
                + Add Row
              </button>
              <span className="am__total-vehicles">Total Vehicles: {totalCount}</span>
            </div>
          </div>

          {/* ── Notes ──────────────────────────────────────── */}
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
