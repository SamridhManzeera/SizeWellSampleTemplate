import { useState, useEffect, FormEvent } from 'react';
import { Allocation, Company, ModalMode, RouteType } from '../../types';
import './AllocationModal.scss';

interface AllocationModalProps {
  open: boolean;
  mode: ModalMode;
  hour: number;
  selectedDate: string;
  company: Company | null;
  currentAllocated: number;
  existingAllocation?: Allocation;
  onConfirm: (data: {
    deliveryCount: number;
    notes: string;
    driverName: string;
    vehicleNumber: string;
    routeType: RouteType;
  }) => void;
  onClose: () => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`;
}

function AllocationModal({
  open,
  mode,
  hour,
  selectedDate,
  company,
  currentAllocated,
  existingAllocation,
  onConfirm,
  onClose,
}: AllocationModalProps) {
  const [deliveryCount, setDeliveryCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [routeType, setRouteType] = useState<RouteType>('one-way');
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  // Remaining capacity: in edit mode, add back the existing allocation's count
  const remaining = company
    ? company.assignedDeliveries - currentAllocated + (isEdit && existingAllocation ? existingAllocation.deliveryCount : 0)
    : 0;

  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && existingAllocation) {
        setDeliveryCount(String(existingAllocation.deliveryCount));
        setNotes(existingAllocation.notes);
        setDriverName(existingAllocation.driverName);
        setVehicleNumber(existingAllocation.vehicleNumber);
        setRouteType(existingAllocation.routeType ?? 'one-way');
      } else {
        setDeliveryCount('1');
        setNotes('');
        setDriverName('');
        setVehicleNumber('');
        setRouteType('one-way');
      }
    }
  }, [open, isEdit, existingAllocation]);

  if (!open || !company) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const count = parseInt(deliveryCount, 10);
    if (!deliveryCount || isNaN(count) || count < 1) {
      setError('Please enter at least 1 delivery.');
      return;
    }
    if (count > remaining) {
      setError(`Maximum ${remaining} remaining deliver${remaining === 1 ? 'y' : 'ies'} available.`);
      return;
    }
    if (!vehicleNumber.trim()) {
      setError('Vehicle number is required.');
      return;
    }
    onConfirm({ deliveryCount: count, notes, driverName, vehicleNumber: vehicleNumber.trim().toUpperCase(), routeType });
  }

  return (
    <div className="am-backdrop" onClick={onClose} role="presentation">
      <div className="am" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="am__header">
          <div className="am__header-left">
            <span className={`am__mode-tag am__mode-tag--${isEdit ? 'edit' : 'create'}`}>
              {isEdit ? 'Edit' : 'New'}
            </span>
            <h2 className="am__title">{isEdit ? 'Edit Allocation' : 'Allocate Delivery Slot'}</h2>
          </div>
          <button type="button" className="am__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

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
            <span className="am__meta-label">Capacity</span>
            <span className={`am__meta-value${remaining === 0 ? ' am__meta-value--warn' : remaining <= 2 ? ' am__meta-value--low' : ''}`}>
              {remaining} / {company.assignedDeliveries} remaining
            </span>
          </div>
        </div>

        <form className="am__form" onSubmit={handleSubmit}>
          <div className="am__row">
            <div className="am__field">
              <label htmlFor="am-deliveries" className="am__label">
                Deliveries <span className="am__req">*</span>
              </label>
              <input
                id="am-deliveries"
                type="number"
                min={1}
                max={remaining}
                value={deliveryCount}
                onChange={(e) => { setDeliveryCount(e.target.value); setError(''); }}
                className="am__input"
                required
              />
            </div>
            <div className="am__field">
              <label htmlFor="am-vehicle" className="am__label">
                Vehicle Number <span className="am__req">*</span>
              </label>
              <input
                id="am-vehicle"
                type="text"
                value={vehicleNumber}
                onChange={(e) => { setVehicleNumber(e.target.value); setError(''); }}
                className="am__input am__input--upper"
                placeholder="e.g. WK21PPF"
                required
              />
            </div>
          </div>

          <div className="am__field">
            <span className="am__label">Route Type <span className="am__req">*</span></span>
            <div className="am__route-toggle">
              <button
                type="button"
                className={`am__route-btn${routeType === 'one-way' ? ' am__route-btn--active' : ''}`}
                onClick={() => setRouteType('one-way')}
              >
                <span className="am__route-arrow">→</span> One Way
              </button>
              <button
                type="button"
                className={`am__route-btn${routeType === 'two-way' ? ' am__route-btn--active' : ''}`}
                onClick={() => setRouteType('two-way')}
              >
                <span className="am__route-arrow">↔</span> Two Way
              </button>
            </div>
          </div>

          <div className="am__field">
            <label htmlFor="am-driver" className="am__label">Driver Name</label>
            <input
              id="am-driver"
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="am__input"
              placeholder="e.g. James Harlow"
            />
          </div>

          <div className="am__field">
            <label htmlFor="am-notes" className="am__label">Notes / Remarks</label>
            <textarea
              id="am-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="am__textarea"
              rows={3}
              placeholder="Special instructions, load type, bay requirements..."
            />
          </div>

          {error && <p className="am__error">{error}</p>}

          <div className="am__actions">
            <button type="button" className="am__btn am__btn--cancel" onClick={onClose}>
              Cancel
            </button>
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
