import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useScheduleConfig, HOURS, DayConfig } from './ScheduleConfigContext';
import './ScheduleConfig.scss';

// ── Icons ────────────────────────────────────────────────────────

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatHour(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}

// ── Sub-components ───────────────────────────────────────────────

function NumberInput({
  value, onChange, min = 0, max = 9999,
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

// ── Main Component ────────────────────────────────────────────────

function ScheduleConfig() {
  const { getConfigForDate, updateConfigForDate } = useScheduleConfig();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState(todayString());
  const [draft, setDraft] = useState<DayConfig>(() => getConfigForDate(todayString()));
  const [saved, setSaved] = useState(false);

  const isToday = selectedDate === todayString();

  useEffect(() => {
    setDraft(getConfigForDate(selectedDate));
    setSaved(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const totalCapacity = draft.inboundCapacity + draft.outboundCapacity + draft.twoWayCapacity * 2;
  const allocatedToHours = HOURS.reduce((sum, h) => sum + (draft.hourLimits[h] ?? 0), 0);
  const unallocated = Math.max(0, totalCapacity - allocatedToHours);

  function setCapacity(key: 'inboundCapacity' | 'outboundCapacity' | 'twoWayCapacity') {
    return (v: number) => { setDraft(prev => ({ ...prev, [key]: v })); setSaved(false); };
  }

  function setHourLimit(hour: number, v: number) {
    setDraft(prev => ({
      ...prev,
      hourLimits: { ...prev.hourLimits, [hour]: v },
    }));
    setSaved(false);
  }

  function handleSave() {
    updateConfigForDate(selectedDate, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const CAPACITY_CARDS = [
    { key: 'inboundCapacity'  as const, label: 'Inbound',  mod: 'in',  icon: <InboundIcon /> },
    { key: 'outboundCapacity' as const, label: 'Outbound', mod: 'out', icon: <OutboundIcon /> },
    { key: 'twoWayCapacity'   as const, label: 'Two Way',  mod: 'tw',  icon: <TwoWayIcon /> },
  ];

  return (
    <div className="sc">
      <PageHeader />

      {/* ── Page title ──────────────────────────────────────── */}
      <div className="sc__page-title">
        <div className="sc__page-title-row">
          <div>
            <h1 className="sc__title">Schedule Config</h1>
            <p className="sc__subtitle">Configure slot capacities and delivery limits per date</p>
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

      {/* ── Date toolbar ────────────────────────────────────── */}
      <div className="sc__toolbar">
        <button
          type="button"
          className="sc__date-pill"
          onClick={() => dateInputRef.current?.showPicker()}
          aria-label="Select date"
        >
          <span className="sc__cal-icon">📅</span>
          <span className="sc__date-label">{formatDateDisplay(selectedDate)}</span>
          <span className="sc__chevron">▾</span>
        </button>
        <button
          type="button"
          className={`sc__today-btn${isToday ? ' sc__today-btn--active' : ''}`}
          onClick={() => setSelectedDate(todayString())}
        >
          Today
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="sc__date-hidden"
          aria-label="Select date"
        />
      </div>

      {/* ── Slot capacities ─────────────────────────────────── */}
      <section className="sc__section">
        <div className="sc__section-header">
          <h2 className="sc__section-title">Slot Capacities</h2>
          <p className="sc__section-desc">Total deliveries allowed per route type for this date</p>
        </div>

        <div className="sc__cards">
          {CAPACITY_CARDS.map(({ key, label, mod, icon }) => (
            <div key={key} className={`sc__card sc__card--${mod}`}>
              <div className="sc__card-top">
                <div className={`sc__card-icon sc__card-icon--${mod}`}>{icon}</div>
                <span className="sc__card-label">{label}</span>
              </div>
              <NumberInput value={draft[key]} onChange={setCapacity(key)} min={1} />
              <div className="sc__card-footer">
                <span className="sc__card-footer-label">
                  {key === 'twoWayCapacity' ? `Counts as ${draft.twoWayCapacity * 2} total` : `${draft[key]} slots`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="sc__total-bar">
          <div className="sc__total-bar-left">
            <span className="sc__total-label">Total Capacity</span>
            <span className="sc__total-chips">
              <span className="sc__total-chip sc__total-chip--in">↑ {draft.inboundCapacity}</span>
              <span className="sc__total-chip sc__total-chip--out">↓ {draft.outboundCapacity}</span>
              <span className="sc__total-chip sc__total-chip--tw">↕ {draft.twoWayCapacity} (×2)</span>
            </span>
          </div>
          <div className="sc__total-num">{totalCapacity}</div>
        </div>
      </section>

      {/* ── Per-hour limits ──────────────────────────────────── */}
      <section className="sc__section">
        <div className="sc__section-header">
          <h2 className="sc__section-title">Per-Hour Delivery Limits</h2>
          <p className="sc__section-desc">Set a max delivery count for each hour. 0 = no limit.</p>
        </div>

        <div className="sc__hour-summary">
          <div className="sc__hour-summary-item">
            <span className="sc__hour-summary-label">Total Capacity</span>
            <span className="sc__hour-summary-val">{totalCapacity}</span>
          </div>
          <div className="sc__hour-summary-sep" />
          <div className="sc__hour-summary-item">
            <span className="sc__hour-summary-label">Assigned to Hours</span>
            <span className="sc__hour-summary-val sc__hour-summary-val--used">{allocatedToHours}</span>
          </div>
          <div className="sc__hour-summary-sep" />
          <div className="sc__hour-summary-item">
            <span className="sc__hour-summary-label">Available</span>
            <span className={`sc__hour-summary-val${unallocated === 0 ? ' sc__hour-summary-val--warn' : ' sc__hour-summary-val--avail'}`}>
              {unallocated}
            </span>
          </div>
        </div>

        <div className="sc__hour-grid">
          {HOURS.map(h => (
            <div key={h} className="sc__hour-row">
              <div className="sc__hour-row-left">
                <ClockIcon />
                <span className="sc__hour-time">{formatHour(h)}</span>
              </div>
              <NumberInput value={draft.hourLimits[h] ?? 0} onChange={(v) => setHourLimit(h, v)} min={0} max={totalCapacity} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ScheduleConfig;
