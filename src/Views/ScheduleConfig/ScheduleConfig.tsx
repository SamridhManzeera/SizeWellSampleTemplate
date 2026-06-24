import { useState } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useScheduleConfig } from './ScheduleConfigContext';
import './ScheduleConfig.scss';

function InboundIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z" />
    </svg>
  );
}

function OutboundIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 18.59L5.41 20 17 8.41V15h2V5H9v2h6.59z" />
    </svg>
  );
}

function TwoWayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  );
}

function NumberInput({
  value, onChange, min = 1, max = 9999,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="sc__counter">
      <button
        type="button"
        className="sc__counter-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >−</button>
      <input
        type="number"
        className="sc__counter-input"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
      />
      <button
        type="button"
        className="sc__counter-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >+</button>
    </div>
  );
}

function ScheduleConfig() {
  const { inboundCapacity, outboundCapacity, twoWayCapacity, hourCapacity, updateConfig } = useScheduleConfig();
  const [draft, setDraft] = useState({ inbound: inboundCapacity, outbound: outboundCapacity, twoWay: twoWayCapacity, hourMax: hourCapacity });
  const [saved, setSaved] = useState(false);

  const total = draft.inbound + draft.outbound + draft.twoWay * 2;

  function set(key: keyof typeof draft) {
    return (v: number) => { setDraft((prev) => ({ ...prev, [key]: v })); setSaved(false); };
  }

  function handleSave() {
    updateConfig({ inboundCapacity: draft.inbound, outboundCapacity: draft.outbound, twoWayCapacity: draft.twoWay, hourCapacity: draft.hourMax });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const CAPACITY_CARDS = [
    {
      key: 'inbound' as const,
      label: 'Inbound',
      desc: 'Deliveries arriving at the facility',
      icon: <InboundIcon />,
      mod: 'in',
      arrow: '↑',
    },
    {
      key: 'outbound' as const,
      label: 'Outbound',
      desc: 'Deliveries leaving the facility',
      icon: <OutboundIcon />,
      mod: 'out',
      arrow: '↓',
    },
    {
      key: 'twoWay' as const,
      label: 'Two Way',
      desc: 'Counts as ×2 towards total capacity',
      icon: <TwoWayIcon />,
      mod: 'tw',
      arrow: '↕',
    },
  ];

  return (
    <div className="sc">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <PageHeader />

      {/* ── Page title ──────────────────────────────────────── */}
      <div className="sc__page-title">
        <div className="sc__page-title-row">
          <div>
            <h1 className="sc__title">Schedule Config</h1>
            <p className="sc__subtitle">Configure slot capacities and delivery limits</p>
          </div>
          <button
            type="button"
            className={`sc__save-btn${saved ? ' sc__save-btn--saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Section: Slot Capacities ─────────────────────────── */}
      <section className="sc__section">
        <div className="sc__section-header">
          <h2 className="sc__section-title">Slot Capacities</h2>
          <p className="sc__section-desc">Total deliveries allowed per route type across the full schedule</p>
        </div>

        <div className="sc__cards">
          {CAPACITY_CARDS.map(({ key, label, desc, mod, arrow }) => (
            <div key={key} className={`sc__card sc__card--${mod}`}>
              <div className="sc__card-top">
                <div className={`sc__card-icon sc__card-icon--${mod}`}>
                  {arrow}
                </div>
                <div className="sc__card-info">
                  {/* <span className="sc__card-arrow">{arrow}</span> */}
                  <span className="sc__card-label">{label}</span>
                </div>
              </div>
              <p className="sc__card-desc">{desc}</p>
              <NumberInput value={draft[key]} onChange={set(key)} />
              <div className="sc__card-footer">
                <span className="sc__card-footer-label">
                  {key === 'twoWay' ? `Counts as ${draft.twoWay * 2} total` : `${draft[key]} slots`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total summary */}
        <div className="sc__total-bar">
          <div className="sc__total-bar-left">
            <span className="sc__total-label">Total Capacity</span>
            <span className="sc__total-chips">
              <span className="sc__total-chip sc__total-chip--in">↑ {draft.inbound}</span>
              <span className="sc__total-chip sc__total-chip--out">↓ {draft.outbound}</span>
              <span className="sc__total-chip sc__total-chip--tw">↕ {draft.twoWay} (×2)</span>
            </span>
          </div>
          <div className="sc__total-num">{total}</div>
        </div>
      </section>

      {/* ── Section: Per-Hour Limit ──────────────────────────── */}
      <section className="sc__section">
        <div className="sc__section-header">
          <h2 className="sc__section-title">Per-Hour Limit</h2>
          <p className="sc__section-desc">Maximum total deliveries allowed in any single hour slot</p>
        </div>

        <div className="sc__hour-card">
          <div className="sc__hour-card-left">
            <div className="sc__hour-icon">
              <ClockIcon />
            </div>
            <div>
              <span className="sc__hour-label">Max Deliveries / Hour</span>
              <p className="sc__hour-desc">
                Applies across all companies for a given hour.
                Adding more deliveries will be blocked once this limit is reached.
              </p>
            </div>
          </div>
          <NumberInput value={draft.hourMax} onChange={set('hourMax')} min={1} max={100} />
        </div>
      </section>
    </div>
  );
}

export default ScheduleConfig;
