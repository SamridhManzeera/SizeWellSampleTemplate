import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useScheduleConfig, HOURS, DayConfig } from './ScheduleConfigContext';
import './ScheduleConfig.scss';

// ── Icons ────────────────────────────────────────────────────────

function ClockIcon({ blocked }: { blocked?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
      style={{ color: blocked ? '#dc2626' : undefined }}>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  );
}

function BlockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v6h-2V7zm0 8h2v2h-2v-2z" />
    </svg>
  );
}

function TotalSlotsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
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

// ── Number input ─────────────────────────────────────────────────

function NumberInput({
  value, onChange, min = 0, max = 9999, disabled = false,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean }) {
  return (
    <div className="sc__counter">
      <button
        type="button"
        className="sc__counter-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
      >−</button>
      <input
        type="number"
        className="sc__counter-input"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
      />
      <button
        type="button"
        className="sc__counter-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
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

  // Sentinels: 0 = neutral (default), -1 = blocked, >0 = specific limit
  const totalCapacity = draft.totalCapacity;

  // Sum only specific limits (>0)
  const allocatedToHours = HOURS.reduce((sum, h) => {
    const v = draft.hourLimits[h] ?? 0;
    return v > 0 ? sum + v : sum;
  }, 0);
  const unallocated = Math.max(0, totalCapacity - allocatedToHours);

  function setHourLimit(h: number, v: number) {
    setDraft(prev => ({ ...prev, hourLimits: { ...prev.hourLimits, [h]: v } }));
    setSaved(false);
  }

  function isBlocked(h: number) { return (draft.hourLimits[h] ?? 0) === -1; }
  function getHourValue(h: number) {
    const v = draft.hourLimits[h] ?? 0;
    return v > 0 ? v : 0;
  }

  function handleSave() {
    updateConfigForDate(selectedDate, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

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

      {/* ── Total Slot Capacity ──────────────────────────────── */}
      <section className="sc__section">
        <div className="sc__section-header">
          <h2 className="sc__section-title">Slot Capacities</h2>
          <p className="sc__section-desc">Total deliveries allowed for {formatDateDisplay(selectedDate)}</p>
        </div>

        <div className="sc__total-slot-card">
          <div className="sc__total-slot-left">
            <div className="sc__total-slot-icon"><TotalSlotsIcon /></div>
            <div>
              <span className="sc__total-slot-label">Total Slots</span>
              <span className="sc__total-slot-desc">Maximum deliveries for the day</span>
            </div>
          </div>
          <NumberInput
            value={draft.totalCapacity}
            min={1}
            onChange={(v) => { setDraft(prev => ({ ...prev, totalCapacity: v })); setSaved(false); }}
          />
        </div>
      </section>

      {/* ── Per-hour limits ──────────────────────────────────── */}
      <section className="sc__section">
        <div className="sc__section-header">
          <h2 className="sc__section-title">Per-Hour Delivery Limits</h2>
          {/* <p className="sc__section-desc">Set a max delivery count per hour. 0 = no limit for that hour.</p> */}
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
          {[HOURS.slice(0, 12), HOURS.slice(12)].map((col, ci) => (
            <div key={ci} className="sc__hour-col">
              {col.map(h => {
                const blocked = isBlocked(h);
                const val = getHourValue(h);
                return (
                  <div key={h} className={`sc__hour-row${blocked ? ' sc__hour-row--blocked' : ''}`}>
                    <div className="sc__hour-row-left">
                      <ClockIcon blocked={blocked} />
                      <div className="sc__hour-time-wrap">
                        <span className={`sc__hour-time${blocked ? ' sc__hour-time--blocked' : ''}`}>{formatHour(h)}</span>
                        {blocked && <span className="sc__hour-state sc__hour-state--blocked">Blocked</span>}
                      </div>
                    </div>
                    <NumberInput
                      value={blocked ? 0 : val}
                      onChange={(v) => setHourLimit(h, Math.min(v, totalCapacity))}
                      min={0}
                      max={totalCapacity}
                      disabled={blocked}
                    />
                    <div className="sc__hour-btns">
                      <button
                        type="button"
                        className={`sc__hour-btn sc__hour-btn--block${blocked ? ' sc__hour-btn--active' : ''}`}
                        onClick={() => setHourLimit(h, blocked ? 0 : -1)}
                      >
                        <BlockIcon />
                        {blocked ? 'Blocked' : 'Block'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ScheduleConfig;
