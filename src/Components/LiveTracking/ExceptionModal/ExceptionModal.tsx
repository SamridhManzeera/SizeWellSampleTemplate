import React, { useState } from 'react';
import { Vehicle, GeoFence, RouteException } from '../../../types/liveTracking';
import './ExceptionModal.scss';

interface ExceptionModalProps {
  open: boolean;
  vehicles: Vehicle[];
  geofences: GeoFence[];
  onClose: () => void;
  onSave: (exception: RouteException) => void;
}

export default function ExceptionModal({
  open,
  vehicles,
  geofences,
  onClose,
  onSave,
}: ExceptionModalProps) {
  const [vehicleId, setVehicleId] = useState('');
  const [selectedGeofenceIds, setSelectedGeofenceIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  // Set default validFrom as today and validUntil as tomorrow
  const getTodayDateTimeString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [validFrom, setValidFrom] = useState(getTodayDateTimeString(0));
  const [validUntil, setValidUntil] = useState(getTodayDateTimeString(1));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleToggleGeofence = (id: string) => {
    setSelectedGeofenceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!vehicleId) errors.vehicleId = 'Vehicle is required.';
    if (selectedGeofenceIds.length === 0) {
      errors.geofences = 'At least one exception target must be checked.';
    }
    if (!description.trim()) errors.description = 'Reason is required.';
    if (!validFrom) errors.validFrom = 'Valid From date is required.';
    if (!validUntil) errors.validUntil = 'Valid Until date is required.';

    if (validFrom && validUntil && new Date(validUntil) <= new Date(validFrom)) {
      errors.validUntil = 'Valid Until date must be strictly after Valid From date.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Save a single exception containing all checked geofenceIds
    const newException: RouteException = {
      id: Math.random().toString(36).substring(2, 9),
      vehicleId,
      exceptionType: 'allow-missing-go',
      geofenceIds: selectedGeofenceIds,
      reason: description.trim(),
      description: description.trim(),
      validFrom,
      validUntil,
    };

    onSave(newException);
    
    // Reset state
    setVehicleId('');
    setSelectedGeofenceIds([]);
    setDescription('');
    setValidFrom(getTodayDateTimeString(0));
    setValidUntil(getTodayDateTimeString(1));
    onClose();
  };

  return (
    <div className="ex-backdrop" onClick={onClose} role="presentation">
      <div className="ex-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="ex-modal__header">
          <h2 className="ex-modal__title">Create Route Exception</h2>
          <button type="button" className="ex-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="ex-modal__form">
          <div className="ex-modal__body">
            
            {/* Vehicle Selector */}
            <div className="ex-modal__field">
              <label htmlFor="ex-vehicle" className="ex-modal__label">
                Vehicle <span className="ex-modal__required">*</span>
              </label>
              <select
                id="ex-vehicle"
                className={`ex-modal__select ${formErrors.vehicleId ? 'ex-modal__select--error' : ''}`}
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
              >
                <option value="">Select Vehicle</option>
                <option value="all">All Vehicles (Global Exception)</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.id} - {v.name} ({v.type})
                  </option>
                ))}
              </select>
              {formErrors.vehicleId && <span className="ex-modal__error-msg">{formErrors.vehicleId}</span>}
            </div>

            {/* Select Geofences (Unified list with checkboxes) */}
            <div className="ex-modal__field">
              <label className="ex-modal__label">
                GeoFence Exception List <span className="ex-modal__required">*</span>
              </label>
              <div className={`ex-modal__geofences-box ${formErrors.geofences ? 'ex-modal__geofences-box--error' : ''}`}>
                {geofences.length === 0 ? (
                  <p className="ex-modal__empty-geofences">No geofences configured.</p>
                ) : (
                  geofences.map(gf => {
                    const isGo = gf.type === 'go';
                    const actionLabel = isGo 
                      ? `Skip ${gf.name}` 
                      : `Allow ${gf.name}`;
                    const isChecked = selectedGeofenceIds.includes(gf.id);

                    return (
                      <label key={gf.id} className="ex-modal__checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGeofence(gf.id)}
                          className="ex-modal__checkbox"
                        />
                        <div className="ex-modal__checkbox-content">
                          <span className="ex-modal__checkbox-name">{actionLabel}</span>
                          <span className="ex-modal__checkbox-desc">{gf.description}</span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              {formErrors.geofences && <span className="ex-modal__error-msg">{formErrors.geofences}</span>}
            </div>

            {/* Reason (Mandatory) */}
            <div className="ex-modal__field">
              <label htmlFor="ex-desc" className="ex-modal__label">
                Reason <span className="ex-modal__required">*</span>
              </label>
              <textarea
                id="ex-desc"
                className={`ex-modal__textarea ${formErrors.description ? 'ex-modal__textarea--error' : ''}`}
                rows={3}
                placeholder="Enter reason for this exception..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              {formErrors.description && <span className="ex-modal__error-msg">{formErrors.description}</span>}
            </div>

            {/* Validity Timeframes */}
            <div className="ex-modal__time-row">
              <div className="ex-modal__field">
                <label htmlFor="ex-from" className="ex-modal__label">
                  Valid From <span className="ex-modal__required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="ex-from"
                  className={`ex-modal__input ${formErrors.validFrom ? 'ex-modal__input--error' : ''}`}
                  value={validFrom}
                  onChange={e => setValidFrom(e.target.value)}
                />
                {formErrors.validFrom && <span className="ex-modal__error-msg">{formErrors.validFrom}</span>}
              </div>

              <div className="ex-modal__field">
                <label htmlFor="ex-until" className="ex-modal__label">
                  Valid Until <span className="ex-modal__required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="ex-until"
                  className={`ex-modal__input ${formErrors.validUntil ? 'ex-modal__input--error' : ''}`}
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                />
                {formErrors.validUntil && <span className="ex-modal__error-msg">{formErrors.validUntil}</span>}
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="ex-modal__footer">
            <button type="button" className="ex-modal__btn ex-modal__btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ex-modal__btn ex-modal__btn--save">
              Save Exception
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
