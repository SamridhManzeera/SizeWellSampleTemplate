import React, { useState } from 'react';
import { Vehicle, GeoFence, RouteException } from '../../../types/liveTracking';
import './ExceptionModal.scss';

interface ExceptionModalProps {
  open: boolean;
  vehicles: Vehicle[];
  geofences: GeoFence[];
  onClose: () => void;
  onSave: (exception: RouteException | RouteException[]) => void;
}

export default function ExceptionModal({
  open,
  vehicles,
  geofences,
  onClose,
  onSave,
}: ExceptionModalProps) {
  const [exceptionScope, setExceptionScope] = useState<'vehicle' | 'supplier'>('vehicle');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedSupplierVehicleIds, setSelectedSupplierVehicleIds] = useState<string[]>([]);
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

  // Extract unique supplier names from the vehicles list
  const suppliers = Array.from(
    new Set(vehicles.map(v => v.supplier).filter(Boolean))
  ) as string[];

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSupplier(e.target.value);
    setSelectedSupplierVehicleIds([]);
  };

  const handleToggleSupplierVehicle = (id: string) => {
    setSelectedSupplierVehicleIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllVehicles = () => {
    const supplierVehicles = vehicles.filter(v => v.supplier === selectedSupplier);
    if (selectedSupplierVehicleIds.length === supplierVehicles.length) {
      setSelectedSupplierVehicleIds([]);
    } else {
      setSelectedSupplierVehicleIds(supplierVehicles.map(v => v.id));
    }
  };

  const handleToggleVehicle = (id: string) => {
    if (id === 'all') {
      if (vehicles.length > 0 && selectedVehicleIds.length === vehicles.length) {
        setSelectedVehicleIds([]);
      } else {
        setSelectedVehicleIds(vehicles.map(v => v.id));
      }
    } else {
      setSelectedVehicleIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(item => item !== id);
        } else {
          return [...prev, id];
        }
      });
    }
  };

  if (!open) return null;

  const handleToggleGeofence = (id: string) => {
    setSelectedGeofenceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (exceptionScope === 'vehicle') {
      if (selectedVehicleIds.length === 0) {
        errors.vehicleId = 'At least one vehicle must be selected.';
      }
    } else {
      if (!selectedSupplier) errors.supplier = 'Supplier is required.';
      if (selectedSupplier && selectedSupplierVehicleIds.length === 0) {
        errors.supplierVehicles = 'At least one vehicle must be selected.';
      }
    }

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

    if (exceptionScope === 'vehicle') {
      if (selectedVehicleIds.includes('all')) {
        const newException: RouteException = {
          id: Math.random().toString(36).substring(2, 9),
          vehicleId: 'all',
          exceptionType: 'allow-missing-go',
          geofenceIds: selectedGeofenceIds,
          reason: description.trim(),
          description: description.trim(),
          validFrom,
          validUntil,
        };
        onSave(newException);
      } else {
        const newExceptions: RouteException[] = selectedVehicleIds.map(vId => ({
          id: Math.random().toString(36).substring(2, 9),
          vehicleId: vId,
          exceptionType: 'allow-missing-go',
          geofenceIds: selectedGeofenceIds,
          reason: description.trim(),
          description: description.trim(),
          validFrom,
          validUntil,
        }));
        onSave(newExceptions);
      }
    } else {
      // Create a separate exception for each checked vehicle of the supplier
      const newExceptions: RouteException[] = selectedSupplierVehicleIds.map(vId => ({
        id: Math.random().toString(36).substring(2, 9),
        vehicleId: vId,
        exceptionType: 'allow-missing-go',
        geofenceIds: selectedGeofenceIds,
        reason: description.trim(),
        description: description.trim(),
        validFrom,
        validUntil,
      }));
      onSave(newExceptions);
    }
    
    // Reset state
    setSelectedVehicleIds([]);
    setSelectedSupplier('');
    setSelectedSupplierVehicleIds([]);
    setSelectedGeofenceIds([]);
    setDescription('');
    setValidFrom(getTodayDateTimeString(0));
    setValidUntil(getTodayDateTimeString(1));
    setExceptionScope('vehicle');
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
            
            {/* Exception Scope Selection */}
            <div className="ex-modal__field">
              <label className="ex-modal__label">Exception Scope</label>
              <div className="ex-modal__scope-toggle">
                <label className="ex-modal__radio-label">
                  <input
                    type="radio"
                    name="exceptionScope"
                    value="vehicle"
                    checked={exceptionScope === 'vehicle'}
                    onChange={() => {
                      setExceptionScope('vehicle');
                      setFormErrors({});
                    }}
                    className="ex-modal__radio"
                  />
                  <span>Vehicle Based</span>
                </label>
                <label className="ex-modal__radio-label">
                  <input
                    type="radio"
                    name="exceptionScope"
                    value="supplier"
                    checked={exceptionScope === 'supplier'}
                    onChange={() => {
                      setExceptionScope('supplier');
                      setFormErrors({});
                    }}
                    className="ex-modal__radio"
                  />
                  <span>Supplier Based</span>
                </label>
              </div>
            </div>

            {/* Vehicle Selector (Only shown for Vehicle Based exception scope) */}
            {exceptionScope === 'vehicle' && (
              <div className="ex-modal__field">
                <label className="ex-modal__label">
                  Vehicles <span className="ex-modal__required">*</span>
                </label>
                <div className={`ex-modal__supplier-vehicles-box ${formErrors.vehicleId ? 'ex-modal__supplier-vehicles-box--error' : ''}`}>
                  <label className="ex-modal__checkbox-label ex-modal__checkbox-label--global">
                    <input
                      type="checkbox"
                      checked={vehicles.length > 0 && selectedVehicleIds.length === vehicles.length}
                      onChange={() => handleToggleVehicle('all')}
                      className="ex-modal__checkbox"
                    />
                    <div className="ex-modal__checkbox-content">
                      <span className="ex-modal__checkbox-name" style={{ fontWeight: 700 }}>All Vehicles (Global Exception)</span>
                    </div>
                  </label>
                  
                  {vehicles.map(v => {
                    const isChecked = selectedVehicleIds.includes(v.id);
                    return (
                      <label key={v.id} className="ex-modal__checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleVehicle(v.id)}
                          className="ex-modal__checkbox"
                        />
                        <div className="ex-modal__checkbox-content">
                          <span className="ex-modal__checkbox-name">
                            {v.id} - {v.name} ({v.type}){v.supplier ? ` - ${v.supplier}` : ''}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {formErrors.vehicleId && <span className="ex-modal__error-msg">{formErrors.vehicleId}</span>}
              </div>
            )}

            {/* Supplier Selector (Only shown for Supplier Based exception scope) */}
            {exceptionScope === 'supplier' && (
              <>
                <div className="ex-modal__field">
                  <label htmlFor="ex-supplier" className="ex-modal__label">
                    Supplier <span className="ex-modal__required">*</span>
                  </label>
                  <select
                    id="ex-supplier"
                    className={`ex-modal__select ${formErrors.supplier ? 'ex-modal__select--error' : ''}`}
                    value={selectedSupplier}
                    onChange={handleSupplierChange}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {formErrors.supplier && <span className="ex-modal__error-msg">{formErrors.supplier}</span>}
                </div>

                {/* Display all vehicles belonging to the selected supplier */}
                {selectedSupplier && (
                  <div className="ex-modal__field">
                    <label className="ex-modal__label">
                      Supplier Vehicles <span className="ex-modal__required">*</span>
                    </label>
                    <div className={`ex-modal__supplier-vehicles-box ${formErrors.supplierVehicles ? 'ex-modal__supplier-vehicles-box--error' : ''}`}>
                      <label className="ex-modal__checkbox-label">
                        <input
                          type="checkbox"
                          checked={
                            vehicles.filter(v => v.supplier === selectedSupplier).length > 0 &&
                            selectedSupplierVehicleIds.length === vehicles.filter(v => v.supplier === selectedSupplier).length
                          }
                          onChange={handleToggleSelectAllVehicles}
                          className="ex-modal__checkbox"
                        />
                        <div className="ex-modal__checkbox-content">
                          <span className="ex-modal__checkbox-name" style={{ fontWeight: 700 }}>Select All Vehicles</span>
                        </div>
                      </label>
                      
                      {vehicles.filter(v => v.supplier === selectedSupplier).map(v => (
                        <label key={v.id} className="ex-modal__checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedSupplierVehicleIds.includes(v.id)}
                            onChange={() => handleToggleSupplierVehicle(v.id)}
                            className="ex-modal__checkbox"
                          />
                          <div className="ex-modal__checkbox-content">
                            <span className="ex-modal__checkbox-name">{v.id} - {v.name} ({v.type})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {formErrors.supplierVehicles && <span className="ex-modal__error-msg">{formErrors.supplierVehicles}</span>}
                  </div>
                )}
              </>
            )}

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
