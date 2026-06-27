import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useRequests } from './RequestsContext';
import {
  VehicleType, DriverRoute, RequestKind,
  VEHICLE_TYPE_LABELS, DRIVER_ROUTE_LABELS, DRIVER_ROUTE_DESCRIPTIONS,
} from './requestTypes';
import './RequestForm.scss';

// ── Icons ─────────────────────────────────────────────────────────

function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>;
}

// ── Helpers ───────────────────────────────────────────────────────

function todayString() { return new Date().toISOString().split('T')[0]; }

function nextId(count: number) { return `REQ-${String(count + 1).padStart(3, '0')}`; }

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const VEHICLE_OPTIONS: VehicleType[] = ['HDV_MDS', 'LGV_MDS', 'HGV_ACA_MDS'];

const DRIVER_ROUTE_OPTIONS: Array<{ value: DriverRoute; label: string; description: string }> = [
  { value: 'route1a', label: 'Route 1a', description: DRIVER_ROUTE_DESCRIPTIONS.route1a },
  { value: 'route2a', label: 'Route 2a', description: DRIVER_ROUTE_DESCRIPTIONS.route2a },
  { value: 'route3a', label: 'Route 3a', description: DRIVER_ROUTE_DESCRIPTIONS.route3a },
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

// ── Slot counter ──────────────────────────────────────────────────

interface SlotCounterProps {
  label: string;
  icon: string;
  colorClass: string;
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  canIncrease: boolean;
}

function SlotCounter({ label, icon, colorClass, value, onIncrease, onDecrease, canIncrease }: SlotCounterProps) {
  return (
    <div className={`rf__slot-card rf__slot-card--${colorClass}`}>
      <div className="rf__slot-card-header">
        <span className={`rf__slot-icon rf__slot-icon--${colorClass}`}>{icon}</span>
        <span className="rf__slot-card-label">{label}</span>
      </div>
      <div className="rf__slot-counter">
        <button
          type="button"
          className="rf__slot-btn"
          onClick={onDecrease}
          disabled={value === 0}
          aria-label={`Decrease ${label}`}
        >−</button>
        <span className={`rf__slot-val rf__slot-val--${colorClass}`}>{value}</span>
        <button
          type="button"
          className="rf__slot-btn"
          onClick={onIncrease}
          disabled={!canIncrease}
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

type Mode = 'view' | 'edit' | 'create';

export default function RequestForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const { requests, addRequest, updateRequest, getRequest } = useRequests();

  const existing = id ? getRequest(id) : undefined;
  const initMode: Mode = existing
    ? (params.get('edit') === 'true' ? 'edit' : 'view')
    : 'create';

  const kindParam = (params.get('kind') as RequestKind | null) ?? 'normal';

  const [mode, setMode] = useState<Mode>(initMode);
  const [kind, setKind] = useState<RequestKind>(existing?.kind ?? kindParam);
  const [deliveryDate, setDeliveryDate] = useState(existing?.deliveryDate ?? todayString());
  const [inboundCount, setInboundCount]   = useState(existing?.inboundCount  ?? 0);
  const [outboundCount, setOutboundCount] = useState(existing?.outboundCount ?? 0);
  const [twoWayCount, setTwoWayCount]     = useState(existing?.twoWayCount   ?? 0);
  const [vehicleType, setVehicleType] = useState<VehicleType>(existing?.vehicleType ?? 'HGV_ACA_MDS');
  const [driverRoute, setDriverRoute] = useState<DriverRoute>(existing?.driverRoute ?? 'route1a');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isView   = mode === 'view';
  const isCreate = mode === 'create';

  const totalSlots = inboundCount + outboundCount + twoWayCount * 2;

  function validate() {
    const errs: Record<string, string> = {};
    if (!deliveryDate) errs.deliveryDate = 'Delivery date is required.';
    if (totalSlots === 0) errs.slots = 'Add at least 1 slot (inbound, outbound, or two-way).';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      kind, deliveryDate,
      inboundCount, outboundCount, twoWayCount,
      vehicleType, driverRoute, notes,
    };

    if (existing) {
      updateRequest({ ...existing, ...payload });
    } else {
      addRequest({
        id: nextId(requests.length),
        ...payload,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
    }
    setSubmitted(true);
    setTimeout(() => navigate('/requests'), 1000);
  }

  return (
    <div className="rf">
      <PageHeader />

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

        {/* ── Section 1: Request Details ───────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 16 }}>Request Details</h2>

          {/* Request Type — only editable on create */}
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

          {/* Delivery Date */}
          {isView ? (
            <ReadField label="Delivery Date" value={formatDate(deliveryDate)} />
          ) : (
            <div className="rf__field" style={{ maxWidth: 280 }}>
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
          )}
        </section>

        {/* ── Section 2: Slot Count ───────────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 4 }}>Slot Count</h2>
          <p className="rf__section-desc">Set the number of delivery slots for each type.</p>

          {errors.slots && <p className="rf__err" style={{ marginBottom: 12 }}>{errors.slots}</p>}

          {isView ? (
            <div className="rf__slot-view-row">
              <div className="rf__slot-view-chip rf__slot-view-chip--in">
                <span className="rf__slot-view-icon">↑</span>
                <span className="rf__slot-view-label">Inbound</span>
                <span className="rf__slot-view-num">{inboundCount}</span>
              </div>
              <div className="rf__slot-view-chip rf__slot-view-chip--out">
                <span className="rf__slot-view-icon">↓</span>
                <span className="rf__slot-view-label">Outbound</span>
                <span className="rf__slot-view-num">{outboundCount}</span>
              </div>
              <div className="rf__slot-view-chip rf__slot-view-chip--tw">
                <span className="rf__slot-view-icon">↕</span>
                <span className="rf__slot-view-label">Two Way ×2</span>
                <span className="rf__slot-view-num">{twoWayCount * 2}</span>
              </div>
              <div className="rf__slot-view-total">
                <span className="rf__slot-view-total-label">Total Slots</span>
                <span className="rf__slot-view-total-num">{totalSlots}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="rf__slot-counters">
                <SlotCounter
                  label="Inbound" icon="↑" colorClass="in"
                  value={inboundCount}
                  onDecrease={() => setInboundCount(c => Math.max(0, c - 1))}
                  onIncrease={() => { setInboundCount(c => c + 1); setErrors(p => ({ ...p, slots: '' })); }}
                  canIncrease={true}
                />
                <SlotCounter
                  label="Outbound" icon="↓" colorClass="out"
                  value={outboundCount}
                  onDecrease={() => setOutboundCount(c => Math.max(0, c - 1))}
                  onIncrease={() => { setOutboundCount(c => c + 1); setErrors(p => ({ ...p, slots: '' })); }}
                  canIncrease={true}
                />
                <SlotCounter
                  label="Two Way (×2)" icon="↕" colorClass="tw"
                  value={twoWayCount}
                  onDecrease={() => setTwoWayCount(c => Math.max(0, c - 1))}
                  onIncrease={() => { setTwoWayCount(c => c + 1); setErrors(p => ({ ...p, slots: '' })); }}
                  canIncrease={true}
                />
              </div>
              <div className="rf__slot-total-bar">
                <span className="rf__slot-total-label">Total Slots</span>
                <span className="rf__slot-total-num">{totalSlots}</span>
              </div>
            </>
          )}
        </section>

        {/* ── Section 3: Vehicle & Route ─────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 16 }}>Vehicle & Route</h2>

          {isView ? (
            <div className="rf__row">
              <ReadField label="Vehicle Type" value={VEHICLE_TYPE_LABELS[vehicleType]} />
              <ReadField label="Route" value={DRIVER_ROUTE_LABELS[driverRoute]} />
            </div>
          ) : (
            <>
              <div className="rf__field rf__field--full" style={{ marginBottom: 16 }}>
                <label className="rf__label">Vehicle Type</label>
                <div className="rf__vehicle-group">
                  {VEHICLE_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      className={`rf__vehicle-btn${vehicleType === opt ? ' rf__vehicle-btn--active' : ''}`}
                      onClick={() => setVehicleType(opt)}>
                      {VEHICLE_TYPE_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rf__field rf__field--full">
                <label className="rf__label">
                  Route <span className="rf__label-hint">Hover for route description</span>
                </label>
                <div className="rf__route-opt-group">
                  {DRIVER_ROUTE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      data-tooltip-id="route-tip"
                      data-tooltip-content={opt.description}
                      className={`rf__route-opt-btn${driverRoute === opt.value ? ' rf__route-opt-btn--active' : ''}`}
                      onClick={() => setDriverRoute(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Section 4: Notes ─────────────────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 12 }}>Notes</h2>
          {isView ? (
            notes
              ? <ReadField label="" value={notes} />
              : <p className="rf__section-desc" style={{ margin: 0 }}>No notes added.</p>
          ) : (
            <div className="rf__field">
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

        {/* ── Footer ───────────────────────────────────────── */}
        {!isView && (
          <div className="rf__footer">
            <button type="button" className="rf__cancel-btn"
              onClick={() => isCreate ? navigate('/requests') : setMode('view')}>
              Cancel
            </button>
            <button type="submit" className="rf__submit-btn">
              {isCreate ? 'Submit Request' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      <Tooltip
        id="route-tip"
        place="top"
        style={{ maxWidth: 300, fontSize: 12, lineHeight: 1.6, zIndex: 9999 }}
      />
    </div>
  );
}
