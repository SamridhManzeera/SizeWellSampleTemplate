import { useState, useEffect } from 'react';
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function toDateString(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayString() {
  const n = new Date();
  return toDateString(n.getFullYear(), n.getMonth(), n.getDate());
}

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function formatHour(h: number) {
  const hh = String(h).padStart(2, '0');
  return `${hh}:00`;
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

interface CalendarProps {
  selected: string;
  onSelect: (date: string) => void;
  configuredDates: Set<string>;
}

function Calendar({ selected, onSelect, configuredDates }: CalendarProps) {
  const selDate = new Date(selected + 'T00:00:00');
  const [viewYear, setViewYear] = useState(selDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selDate.getMonth());

  const today = todayString();

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  // getDay(): 0=Sun,1=Mon...6=Sat  → shift to Mon-first
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toDateString(viewYear, viewMonth, d) });
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  return (
    <div className="sc__cal">
      <div className="sc__cal-header">
        <div className="sc__cal-nav">
          <button type="button" className="sc__cal-nav-btn" onClick={prevMonth}>‹</button>
          <span className="sc__cal-month">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button type="button" className="sc__cal-nav-btn" onClick={nextMonth}>›</button>
        </div>
        <div className="sc__cal-label-row">
          {DAY_LABELS.map(l => (
            <span key={l} className="sc__cal-label">{l}</span>
          ))}
        </div>
      </div>
      <div className="sc__cal-grid">
        {cells.map((cell, i) => {
          if (!cell.day || !cell.dateStr) return <span key={`e${i}`} />;
          const isSelected = cell.dateStr === selected;
          const isToday    = cell.dateStr === today;
          const hasConfig  = configuredDates.has(cell.dateStr);
          let cls = 'sc__cal-day';
          if (isSelected) cls += ' sc__cal-day--selected';
          else if (isToday) cls += ' sc__cal-day--today';
          return (
            <button
              key={cell.dateStr}
              type="button"
              className={cls}
              onClick={() => onSelect(cell.dateStr!)}
            >
              {cell.day}
              {hasConfig && <span className="sc__cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

function ScheduleConfig() {
  const { getConfigForDate, updateConfigForDate, configByDate } = useScheduleConfig();

  const [selectedDate, setSelectedDate] = useState(todayString());
  const [draft, setDraft] = useState<DayConfig>(() => getConfigForDate(todayString()));
  const [saved, setSaved] = useState(false);

  // Reload draft when date changes
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

  const configuredDates = new Set(Object.keys(configByDate));

  const CAPACITY_CARDS = [
    { key: 'inboundCapacity'  as const, label: 'Inbound',  mod: 'in',  arrow: '↑', icon: <InboundIcon /> },
    { key: 'outboundCapacity' as const, label: 'Outbound', mod: 'out', arrow: '↓', icon: <OutboundIcon /> },
    { key: 'twoWayCapacity'   as const, label: 'Two Way',  mod: 'tw',  arrow: '↕', icon: <TwoWayIcon /> },
  ];

  return (
    <div className="sc">
      <PageHeader />

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

      <div className="sc__body">
        {/* ── Left: calendar ─────────────────────────────── */}
        <div className="sc__left">
          <div className="sc__section sc__section--cal">
            <div className="sc__section-header">
              <h2 className="sc__section-title">Select Date</h2>
              <p className="sc__section-desc">Config is saved per date. Dots mark customised dates.</p>
            </div>
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              configuredDates={configuredDates}
            />
            <div className="sc__cal-selected-label">
              Editing: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>

        {/* ── Right: config panels ────────────────────────── */}
        <div className="sc__right">
          {/* Slot capacities */}
          <section className="sc__section">
            <div className="sc__section-header">
              <h2 className="sc__section-title">Slot Capacities</h2>
              <p className="sc__section-desc">Total deliveries allowed per route type for this date</p>
            </div>

            <div className="sc__cards">
              {CAPACITY_CARDS.map(({ key, label, mod, arrow }) => (
                <div key={key} className={`sc__card sc__card--${mod}`}>
                  <div className="sc__card-top">
                    <div className={`sc__card-icon sc__card-icon--${mod}`}>{arrow}</div>
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

          {/* Per-hour limits */}
          <section className="sc__section">
            <div className="sc__section-header">
              <h2 className="sc__section-title">Per-Hour Delivery Limits</h2>
              <p className="sc__section-desc">Set a max delivery count for each hour. 0 = unlimited.</p>
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
              {HOURS.map(h => {
                const limit = draft.hourLimits[h] ?? 0;
                return (
                  <div key={h} className="sc__hour-row">
                    <div className="sc__hour-row-left">
                      <ClockIcon />
                      <span className="sc__hour-time">{formatHour(h)}</span>
                      </div>
                    <NumberInput value={limit} onChange={(v) => setHourLimit(h, v)} min={0} max={totalCapacity} />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ScheduleConfig;
