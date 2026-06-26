import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useRequests } from './RequestsContext';
import { Driver, VehicleType, RouteType, RequestKind, VEHICLE_TYPE_LABELS } from './requestTypes';
import './RequestForm.scss';

// ── Icons ─────────────────────────────────────────────────────────

function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>;
}

function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>;
}

function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>;
}

// ── Helpers ───────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

function newDriver(): Driver {
  return { id: uid(), name: '', email: '', contact: '', vehicleNumber: '', vehicleType: 'HGV_ACA_MDS' };
}

function todayString() { return new Date().toISOString().split('T')[0]; }

function nextId(count: number) { return `REQ-${String(count + 1).padStart(3, '0')}`; }

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const VEHICLE_OPTIONS: VehicleType[] = ['HDV_MDS', 'LGV_MDS', 'HGV_ACA_MDS'];
const ROUTE_OPTIONS: Array<{ value: RouteType; label: string }> = [
  { value: 'inbound',  label: '↑ Inbound'  },
  { value: 'outbound', label: '↓ Outbound' },
  { value: 'twoWay',   label: '↕ Two Way'  },
];

// ── Read-only field ───────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rf__field">
      <span className="rf__label">{label}</span>
      <div className="rf__read-val">{value || <span className="rf__read-empty">—</span>}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

type Mode = 'view' | 'edit' | 'create';

export default function RequestForm() {
  const navigate      = useNavigate();
  const { id }        = useParams<{ id: string }>();
  const [params]      = useSearchParams();
  const { requests, addRequest, updateRequest, getRequest } = useRequests();

  const existing  = id ? getRequest(id) : undefined;
  const initMode: Mode = existing
    ? (params.get('edit') === 'true' ? 'edit' : 'view')
    : 'create';

  const kindParam = (params.get('kind') as RequestKind | null) ?? 'normal';

  const [mode,         setMode]         = useState<Mode>(initMode);
  const [kind,         setKind]         = useState<RequestKind>(existing?.kind ?? kindParam);
  const [deliveryDate, setDeliveryDate] = useState(existing?.deliveryDate ?? todayString());
  const [companyName,  setCompanyName]  = useState(existing?.companyName  ?? '');
  const [routeType,    setRouteType]    = useState<RouteType>(existing?.routeType ?? 'inbound');
  const [notes,        setNotes]        = useState(existing?.notes ?? '');
  const [drivers,      setDrivers]      = useState<Driver[]>(existing?.drivers ?? []);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [submitted,    setSubmitted]    = useState(false);

  const isView   = mode === 'view';
  const isCreate = mode === 'create';

  function addDriver()   { setDrivers(prev => [...prev, newDriver()]); }
  function removeDriver(did: string) { setDrivers(prev => prev.filter(d => d.id !== did)); }
  function updateDriver(did: string, field: keyof Driver, value: string) {
    setDrivers(prev => prev.map(d => d.id === did ? { ...d, [field]: value } : d));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!companyName.trim()) errs.companyName  = 'Company name is required.';
    if (!deliveryDate)       errs.deliveryDate = 'Delivery date is required.';
    if (drivers.length === 0) errs.drivers = 'Add at least one driver.';
    drivers.forEach((d, i) => {
      if (!d.name.trim())          errs[`d${i}_name`]    = 'Name required.';
      if (!d.email.trim())         errs[`d${i}_email`]   = 'Email required.';
      if (!d.contact.trim())       errs[`d${i}_contact`] = 'Contact required.';
      if (!d.vehicleNumber.trim()) errs[`d${i}_vehicle`] = 'Vehicle no. required.';
    });
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (existing) {
      updateRequest({ ...existing, kind, deliveryDate, companyName, routeType, drivers, notes });
    } else {
      addRequest({
        id: nextId(requests.length), kind, deliveryDate, companyName, routeType,
        drivers, notes, status: 'pending', submittedAt: new Date().toISOString(),
      });
    }
    setSubmitted(true);
    setTimeout(() => navigate('/requests'), 1000);
  }

  return (
    <div className="rf">
      <PageHeader />

      {/* ── Hero (existing requests) / flat bar (create) ─────── */}
      {isCreate ? (
        <div className="rf__page-title">
          <button type="button" className="rf__back-btn" onClick={() => navigate('/requests')}>← Back</button>
          <div className="rf__page-title-center">
            <h1 className="rf__title">Apply for Delivery</h1>
            <p className="rf__subtitle">Fill in the details and submit your delivery request.</p>
          </div>
        </div>
      ) : (
        <div className="rf__hero">
          <div className="rf__hero-left">
            <button type="button" className="rf__hero-back" onClick={() => navigate('/requests')}>← Back</button>
            <div className="rf__hero-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <div>
              <div className="rf__hero-title-row">
                <h1 className="rf__hero-title">{existing?.id}</h1>
                <span className={`rf__kind-badge rf__kind-badge--${kind}`}>
                  {kind === 'emergency' ? '⚡ Emergency' : 'Normal'}
                </span>
                {existing && (
                  <span className={`rf__status-badge rf__status-badge--${existing.status}`}>
                    {existing.status.charAt(0).toUpperCase() + existing.status.slice(1)}
                  </span>
                )}
              </div>
              <p className="rf__hero-sub">
                {isView ? 'Viewing submitted request.' : 'Editing request details.'}
              </p>
            </div>
          </div>
          <div className="rf__hero-actions">
            {isView && (
              <button type="button" className="rf__hero-edit-btn" onClick={() => setMode('edit')}>
                <EditIcon /> Edit Request
              </button>
            )}
            {mode === 'edit' && (
              <button type="button" className="rf__hero-cancel-btn" onClick={() => setMode('view')}>
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      )}

      {submitted && (
        <div className="rf__success">
          ✓ Request {existing ? 'updated' : 'submitted'} successfully. Redirecting…
        </div>
      )}

      <form className="rf__form" onSubmit={handleSubmit} noValidate>

        {/* ── Delivery Details ────────────────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title">Delivery Details</h2>

          {/* Request Kind (only editable on create) */}
          {isCreate && (
            <div className="rf__field rf__field--full" style={{ marginBottom: 16 }}>
              <label className="rf__label">Request Type</label>
              <div className="rf__kind-group">
                <button
                  type="button"
                  className={`rf__kind-btn rf__kind-btn--normal${kind === 'normal' ? ' rf__kind-btn--active' : ''}`}
                  onClick={() => setKind('normal')}
                >
                  Normal Request
                </button>
                <button
                  type="button"
                  className={`rf__kind-btn rf__kind-btn--emergency${kind === 'emergency' ? ' rf__kind-btn--active' : ''}`}
                  onClick={() => setKind('emergency')}
                >
                  ⚡ Emergency
                  <span className="rf__kind-hint">within 24 hrs</span>
                </button>
              </div>
            </div>
          )}

          <div className="rf__row">
            {isView ? (
              <>
                <ReadField label="Company Name"  value={companyName} />
                <ReadField label="Delivery Date" value={formatDate(deliveryDate)} />
                <ReadField label="Route Type"    value={ROUTE_OPTIONS.find(r => r.value === routeType)?.label ?? routeType} />
              </>
            ) : (
              <>
                <div className="rf__field">
                  <label className="rf__label">Company Name *</label>
                  <input
                    type="text"
                    className={`rf__input${errors.companyName ? ' rf__input--error' : ''}`}
                    placeholder="e.g. Apex Haulage Ltd"
                    value={companyName}
                    onChange={e => { setCompanyName(e.target.value); setErrors(p => ({ ...p, companyName: '' })); }}
                  />
                  {errors.companyName && <span className="rf__err">{errors.companyName}</span>}
                </div>

                <div className="rf__field">
                  <label className="rf__label">Delivery Date *</label>
                  <input
                    type="date"
                    className={`rf__input${errors.deliveryDate ? ' rf__input--error' : ''}`}
                    value={deliveryDate}
                    min={todayString()}
                    onChange={e => { setDeliveryDate(e.target.value); setErrors(p => ({ ...p, deliveryDate: '' })); }}
                  />
                  {errors.deliveryDate && <span className="rf__err">{errors.deliveryDate}</span>}
                </div>

                <div className="rf__field">
                  <label className="rf__label">Route Type</label>
                  <div className="rf__route-group">
                    {ROUTE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`rf__route-btn rf__route-btn--${opt.value}${routeType === opt.value ? ' rf__route-btn--active' : ''}`}
                        onClick={() => setRouteType(opt.value)}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {isView ? (
            notes ? <ReadField label="Notes" value={notes} /> : null
          ) : (
            <div className="rf__field rf__field--full">
              <label className="rf__label">Notes</label>
              <textarea
                className="rf__textarea"
                rows={3}
                placeholder="Any additional delivery notes…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          )}
        </section>

        {/* ── Drivers ─────────────────────────────────────── */}
        <section className="rf__section">
          <div className="rf__drivers-header">
            <div>
              <h2 className="rf__section-title">Drivers</h2>
              <p className="rf__section-desc">
                {isView ? `${drivers.length} driver${drivers.length !== 1 ? 's' : ''} on this request.` : 'Add all drivers attending this delivery.'}
              </p>
            </div>
            {!isView && (
              <button type="button" className="rf__add-driver-btn" onClick={addDriver}>
                <PlusIcon /> Add Driver
              </button>
            )}
          </div>

          {errors.drivers && <p className="rf__err">{errors.drivers}</p>}

          {!isView && drivers.length === 0 && (
            <div className="rf__no-drivers">
              <p>No drivers added yet. Click <strong>Add Driver</strong> to get started.</p>
            </div>
          )}

          <div className="rf__drivers-list">
            {drivers.map((driver, i) => (
              <div key={driver.id} className={`rf__driver-card${isView ? ' rf__driver-card--view' : ''}`}>
                <div className="rf__driver-card-header">
                  <span className="rf__driver-num">Driver {i + 1}</span>
                  {!isView && (
                    <button type="button" className="rf__remove-driver" onClick={() => removeDriver(driver.id)} title="Remove"><TrashIcon /></button>
                  )}
                </div>

                {isView ? (
                  <div className="rf__driver-view-grid">
                    <ReadField label="Name"         value={driver.name} />
                    <ReadField label="Email"        value={driver.email} />
                    <ReadField label="Contact"      value={driver.contact} />
                    <ReadField label="Vehicle No."  value={driver.vehicleNumber} />
                    <div className="rf__field rf__field--full">
                      <span className="rf__label">Vehicle Type</span>
                      <div className="rf__read-val">{VEHICLE_TYPE_LABELS[driver.vehicleType]}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rf__driver-grid">
                    <div className="rf__field">
                      <label className="rf__label">Full Name *</label>
                      <input type="text" className={`rf__input${errors[`d${i}_name`] ? ' rf__input--error' : ''}`}
                        placeholder="e.g. John Smith" value={driver.name}
                        onChange={e => { updateDriver(driver.id, 'name', e.target.value); setErrors(p => ({ ...p, [`d${i}_name`]: '' })); }} />
                      {errors[`d${i}_name`] && <span className="rf__err">{errors[`d${i}_name`]}</span>}
                    </div>
                    <div className="rf__field">
                      <label className="rf__label">Email *</label>
                      <input type="email" className={`rf__input${errors[`d${i}_email`] ? ' rf__input--error' : ''}`}
                        placeholder="driver@company.com" value={driver.email}
                        onChange={e => { updateDriver(driver.id, 'email', e.target.value); setErrors(p => ({ ...p, [`d${i}_email`]: '' })); }} />
                      {errors[`d${i}_email`] && <span className="rf__err">{errors[`d${i}_email`]}</span>}
                    </div>
                    <div className="rf__field">
                      <label className="rf__label">Contact *</label>
                      <input type="tel" className={`rf__input${errors[`d${i}_contact`] ? ' rf__input--error' : ''}`}
                        placeholder="+44 7700 900000" value={driver.contact}
                        onChange={e => { updateDriver(driver.id, 'contact', e.target.value); setErrors(p => ({ ...p, [`d${i}_contact`]: '' })); }} />
                      {errors[`d${i}_contact`] && <span className="rf__err">{errors[`d${i}_contact`]}</span>}
                    </div>
                    <div className="rf__field">
                      <label className="rf__label">Vehicle Number *</label>
                      <input type="text" className={`rf__input${errors[`d${i}_vehicle`] ? ' rf__input--error' : ''}`}
                        placeholder="e.g. AB12 CDE" value={driver.vehicleNumber}
                        onChange={e => { updateDriver(driver.id, 'vehicleNumber', e.target.value.toUpperCase()); setErrors(p => ({ ...p, [`d${i}_vehicle`]: '' })); }} />
                      {errors[`d${i}_vehicle`] && <span className="rf__err">{errors[`d${i}_vehicle`]}</span>}
                    </div>
                    <div className="rf__field rf__field--full">
                      <label className="rf__label">Vehicle Type</label>
                      <div className="rf__vehicle-group">
                        {VEHICLE_OPTIONS.map(opt => (
                          <button key={opt} type="button"
                            className={`rf__vehicle-btn${driver.vehicleType === opt ? ' rf__vehicle-btn--active' : ''}`}
                            onClick={() => updateDriver(driver.id, 'vehicleType', opt)}>
                            {VEHICLE_TYPE_LABELS[opt]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer (hidden in view mode) ────────────────── */}
        {!isView && (
          <div className="rf__footer">
            <button type="button" className="rf__cancel-btn" onClick={() => isCreate ? navigate('/requests') : setMode('view')}>
              Cancel
            </button>
            <button type="submit" className="rf__submit-btn">
              {isCreate ? 'Submit Request' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
