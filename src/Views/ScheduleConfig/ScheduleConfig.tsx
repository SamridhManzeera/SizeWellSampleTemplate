import { Fragment, useState, useEffect, useRef } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useScheduleConfig, HOURS, DayConfig, DCO_HOUR_CONSTRAINTS } from './ScheduleConfigContext';
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

function CalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5zm2 4h5v5H7z" />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatHour(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dateToString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Upcoming 7 days shown in tiles (today excluded) */
const UPCOMING_PLANNING_DAYS = 7;

function getUpcomingTileDates(): string[] {
  const start = parseDate(todayString());
  start.setDate(start.getDate() + 1);
  return Array.from({ length: UPCOMING_PLANNING_DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return dateToString(d);
  });
}

function formatDayShort(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'short' });
}

function formatDayNum(dateStr: string): string {
  return String(parseDate(dateStr).getDate());
}

function formatDayMonthShort(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-GB', { month: 'short' });
}

function isSunday(dateStr: string): boolean {
  return parseDate(dateStr).getDay() === 0;
}

function getWeekDates(baseDateStr: string, weekOffset: number): string[] {
  const base = parseDate(baseDateStr);
  const day = base.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return dateToString(d);
  });
}

function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  if (end < start) return [startStr];
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(dateToString(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic pseudo-random per-hour capacity, ignoring blocked days — real per-date wiring is a follow-up. */
function getMockHourCapacity(dateStr: string, hour: number): number {
  return 10 + (hashString(`${dateStr}-${hour}`) % 31); // 10–40
}

/** Actual per-hour value shown in the multi-day table — zeroed out on blocked (Sunday) days. */
function getMockHourValue(dateStr: string, hour: number): number {
  return isSunday(dateStr) ? 0 : getMockHourCapacity(dateStr, hour);
}

function getMockDailyCapacity(dateStr: string): number {
  return HOURS.reduce((sum, h) => sum + getMockHourCapacity(dateStr, h), 0);
}

function getMockDailyTotal(dateStr: string): number {
  return HOURS.reduce((sum, h) => sum + getMockHourValue(dateStr, h), 0);
}

const WEEK_TABLE_HOUR_GROUPS = [
  { label: '00:00 – 11:00', hours: HOURS.slice(0, 12) },
  { label: '12:00 – 23:00', hours: HOURS.slice(12) },
];

function getSlotsSummary(config: DayConfig): { total: number; assigned: number; status: 'good' | 'limited' | 'full' } {
  const assigned = HOURS.reduce((sum, h) => {
    const v = config.hourLimits[h] ?? 0;
    return v > 0 ? sum + v : sum;
  }, 0);
  const utilization = config.totalCapacity > 0 ? assigned / config.totalCapacity : 0;
  let status: 'good' | 'limited' | 'full' = 'good';
  if (utilization >= 0.9) status = 'full';
  else if (utilization >= 0.7) status = 'limited';
  return { total: config.totalCapacity, assigned, status };
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
  const modalCopyFromRef = useRef<HTMLInputElement>(null);
  const modalCopyToStartRef = useRef<HTMLInputElement>(null);
  const modalCopyToEndRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState(() => todayString());
  const [draft, setDraft] = useState<DayConfig>(() => getConfigForDate(todayString()));
  const [saved, setSaved] = useState(false);
  const [openHourMenu, setOpenHourMenu] = useState<number | null>(null);

  // Multi-day table view (This Week / Next Week / custom range)
  const [viewMode, setViewMode] = useState<'day' | 'range'>('day');
  const [activeRangeType, setActiveRangeType] = useState<'thisWeek' | 'nextWeek' | 'custom' | null>(null);
  const [weekTableDates, setWeekTableDates] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<boolean[]>([false, false]);
  const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState(() => todayString());
  const [rangeEnd, setRangeEnd] = useState(() => todayString());

  // Copy configuration modal states
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [modalCopyFrom, setModalCopyFrom] = useState(() => todayString());
  const [modalCopyToStart, setModalCopyToStart] = useState(() => {
    const upcoming = getUpcomingTileDates();
    return upcoming[0] ?? todayString();
  });
  const [modalCopyToEnd, setModalCopyToEnd] = useState(() => {
    const upcoming = getUpcomingTileDates();
    return upcoming[upcoming.length - 1] ?? todayString();
  });

  // Explicit type label per hour — independent of the slot value
  const defaultHourTypes = (): Record<number, 'peak' | 'shoulder' | null> =>
    Object.fromEntries(HOURS.map(h => [h, DCO_HOUR_CONSTRAINTS[h]?.type ?? null]));

  const [hourTypes, setHourTypes] = useState<Record<number, 'peak' | 'shoulder' | null>>(defaultHourTypes);

  const isToday = selectedDate === todayString();

  useEffect(() => {
    setDraft(getConfigForDate(selectedDate));
    setHourTypes(defaultHourTypes());
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    setModalCopyFrom(selectedDate);
    const upcoming = getUpcomingTileDates();
    setModalCopyToStart(upcoming[0] ?? todayString());
    setModalCopyToEnd(upcoming[upcoming.length - 1] ?? todayString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  function handleModalApplyCopy() {
    setIsCopyModalOpen(false);
  }

  // Sentinels: 0 = neutral (default), -1 = blocked, >0 = specific limit
  const totalCapacity = draft.totalCapacity;

  const daySummary = getSlotsSummary(draft);
  const rangeTotalSlots = weekTableDates.reduce((sum, d) => sum + getMockDailyCapacity(d), 0);
  const rangeAssignedSlots = weekTableDates.reduce((sum, d) => sum + getMockDailyTotal(d), 0);
  const rangeSummaryTitle = activeRangeType === 'custom' ? 'Range Summary' : 'Week Summary';
  const rangeSummarySubtitle = weekTableDates.length > 0
    ? `${formatDateDisplay(weekTableDates[0])} – ${formatDateDisplay(weekTableDates[weekTableDates.length - 1])}`
    : '';

  const copyToDatesCount = getDatesInRange(modalCopyToStart, modalCopyToEnd).length;

  function setHourLimit(h: number, v: number) {
    setDraft(prev => ({ ...prev, hourLimits: { ...prev.hourLimits, [h]: v } }));
    setSaved(false);
  }

  function isBlocked(h: number) { return (draft.hourLimits[h] ?? 0) === -1; }
  function getHourValue(h: number) {
    const v = draft.hourLimits[h] ?? 0;
    return v > 0 ? v : 0;
  }

  function setHourType(h: number, type: 'peak' | 'shoulder' | null) {
    setHourTypes(prev => ({ ...prev, [h]: type }));
    // Auto-apply DCO slot value for constrained hours
    const dco = DCO_HOUR_CONSTRAINTS[h];
    if (type && dco) setHourLimit(h, dco.slots);
    setOpenHourMenu(null);
  }

  function handleSave() {
    updateConfigForDate(selectedDate, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleTodayClick() {
    setSelectedDate(todayString());
    setViewMode('day');
    setActiveRangeType(null);
  }

  function showWeekTable(weekOffset: number, type: 'thisWeek' | 'nextWeek') {
    setWeekTableDates(getWeekDates(todayString(), weekOffset));
    setActiveRangeType(type);
    setViewMode('range');
    setIsRangePickerOpen(false);
  }

  function handleApplyCustomRange() {
    setWeekTableDates(getDatesInRange(rangeStart, rangeEnd));
    setActiveRangeType('custom');
    setViewMode('range');
    setIsRangePickerOpen(false);
  }

  function toggleWeekTableGroup(i: number) {
    setExpandedGroups(prev => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <div className="sc">
      <PageHeader />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="sc__hero">
        <div className="sc__hero-left">
          <div className="sc__hero-icon"><CalendarIcon /></div>
          <div>
            <h1 className="sc__hero-title">Schedule Config</h1>
            <p className="sc__hero-sub">Configure slot capacities and delivery limits per date</p>
          </div>
        </div>
        <div className="sc__hero-actions">
          <button
            type="button"
            className="sc__copy-trigger-btn"
            onClick={() => {
              setModalCopyFrom(selectedDate);
              setIsCopyModalOpen(true);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sc__copy-trigger-icon">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Schedule
          </button>
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
          className={`sc__today-btn${isToday && viewMode === 'day' ? ' sc__today-btn--active' : ''}`}
          onClick={handleTodayClick}
        >
          Today
        </button>
        <button
          type="button"
          className={`sc__today-btn${activeRangeType === 'thisWeek' ? ' sc__today-btn--active' : ''}`}
          onClick={() => showWeekTable(0, 'thisWeek')}
        >
          This Week
        </button>
        <button
          type="button"
          className={`sc__today-btn${activeRangeType === 'nextWeek' ? ' sc__today-btn--active' : ''}`}
          onClick={() => showWeekTable(1, 'nextWeek')}
        >
          Next Week
        </button>
        <div className="sc__range-btn-wrap">
          <button
            type="button"
            className={`sc__today-btn${activeRangeType === 'custom' ? ' sc__today-btn--active' : ''}`}
            onClick={() => setIsRangePickerOpen(v => !v)}
          >
            Select Range
          </button>
          {isRangePickerOpen && (
            <>
              <div className="sc__hour-menu-overlay" onClick={() => setIsRangePickerOpen(false)} />
              <div className="sc__range-popover">
                <div className="sc__range-popover-row">
                  <label className="sc__range-popover-label">Start Date</label>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="sc__range-popover-input"
                  />
                </div>
                <div className="sc__range-popover-row">
                  <label className="sc__range-popover-label">End Date</label>
                  <input
                    type="date"
                    value={rangeEnd}
                    min={rangeStart}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="sc__range-popover-input"
                  />
                </div>
                <button type="button" className="sc__range-popover-apply" onClick={handleApplyCustomRange}>
                  Show Config
                </button>
              </div>
            </>
          )}
        </div>
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="sc__date-hidden"
          aria-label="Select date"
        />
      </div>

      {/* ── Summary (Day / Week / Range) ─────────────────────── */}
      {viewMode === 'day' ? (
        <div className="sc__week-block">
          <div className="sc__week-header">
            <div>
              <span className="sc__week-label">Day Summary</span>
              <p className="sc__week-range">{formatDateDisplay(selectedDate)}</p>
            </div>
          </div>
          <div className="sc__hour-summary">
            <div className="sc__hour-summary-item">
              <span className="sc__hour-summary-label">Total Slots</span>
              <span className="sc__hour-summary-val">{daySummary.total}</span>
            </div>
            <div className="sc__hour-summary-sep" />
            <div className="sc__hour-summary-item">
              <span className="sc__hour-summary-label">Assigned</span>
              <span className="sc__hour-summary-val sc__hour-summary-val--used">{daySummary.assigned}</span>
            </div>
            <div className="sc__hour-summary-sep" />
            <div className="sc__hour-summary-item">
              <span className="sc__hour-summary-label">Available</span>
              <span className="sc__hour-summary-val sc__hour-summary-val--avail">{daySummary.total - daySummary.assigned}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="sc__week-block">
          <div className="sc__week-header">
            <div>
              <span className="sc__week-label">{rangeSummaryTitle}</span>
              <p className="sc__week-range">{rangeSummarySubtitle}</p>
            </div>
          </div>
          <div className="sc__hour-summary">
            <div className="sc__hour-summary-item">
              <span className="sc__hour-summary-label">Days</span>
              <span className="sc__hour-summary-val">{weekTableDates.length}</span>
            </div>
            <div className="sc__hour-summary-sep" />
            <div className="sc__hour-summary-item">
              <span className="sc__hour-summary-label">Total Slots</span>
              <span className="sc__hour-summary-val sc__hour-summary-val--used">{rangeTotalSlots}</span>
            </div>
            <div className="sc__hour-summary-sep" />
            <div className="sc__hour-summary-item">
              <span className="sc__hour-summary-label">Assigned</span>
              <span className="sc__hour-summary-val sc__hour-summary-val--avail">{rangeAssignedSlots}</span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'day' && (
      <>
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

        {openHourMenu !== null && (
          <div className="sc__hour-menu-overlay" onClick={() => setOpenHourMenu(null)} />
        )}

        <div className="sc__hour-grid">
          {[HOURS.slice(0, 12), HOURS.slice(12)].map((col, ci) => (
            <div key={ci} className="sc__hour-col">
              {col.map(h => {
                const blocked  = isBlocked(h);
                const val      = getHourValue(h);
                const hType    = hourTypes[h] ?? null;
                const menuOpen = openHourMenu === h;

                return (
                  <div key={h} className={`sc__hour-row${blocked ? ' sc__hour-row--blocked' : ''}`}>
                    <div className="sc__hour-row-left">
                      <ClockIcon blocked={blocked} />
                      <div className="sc__hour-time-wrap">
                        <span className={`sc__hour-time${blocked ? ' sc__hour-time--blocked' : ''}`}>{formatHour(h)}</span>
                        {blocked && <span className="sc__hour-state sc__hour-state--blocked">Blocked</span>}
                      </div>
                    </div>

                    {/* Type selector — available on every row */}
                    <div className="sc__hour-type-wrap">
                      <button
                        type="button"
                        className={`sc__hour-type-btn${hType ? ` sc__hour-type-btn--${hType}` : ''}`}
                        onClick={() => setOpenHourMenu(menuOpen ? null : h)}
                      >
                        {hType === 'peak' ? 'Peak Hour' : hType === 'shoulder' ? 'Shoulder Hour' : 'Normal'}
                        <span className="sc__hour-type-chevron">▾</span>
                      </button>
                      {menuOpen && (
                        <div className="sc__hour-type-menu">
                          <button type="button" className="sc__hour-type-opt" onClick={() => setHourType(h, null)}>
                            Normal
                          </button>
                          <button type="button" className="sc__hour-type-opt sc__hour-type-opt--shoulder" onClick={() => setHourType(h, 'shoulder')}>
                            Shoulder Hour
                          </button>
                          <button type="button" className="sc__hour-type-opt sc__hour-type-opt--peak" onClick={() => setHourType(h, 'peak')}>
                            Peak Hour
                          </button>
                        </div>
                      )}
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
      </>
      )}

      {viewMode === 'range' && (
      <section className="sc__section">
        <div className="sc__week-table-header">
          <div className="sc__total-slot-left">
            <div className="sc__total-slot-icon"><TotalSlotsIcon /></div>
            <div>
              <span className="sc__total-slot-label">Delivery Slots</span>
              <span className="sc__total-slot-desc">Per-hour limits across the selected dates</span>
            </div>
          </div>
        </div>

        <div className="sc__week-table-wrap">
          <table className="sc__week-table">
            <thead>
              <tr>
                <th className="sc__week-table-time-col">Time</th>
                {weekTableDates.map((date) => (
                  <th key={date}>{formatDayShort(date)} {formatDayNum(date)} {formatDayMonthShort(date)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEK_TABLE_HOUR_GROUPS.map((group, gi) => (
                <Fragment key={group.label}>
                  <tr className="sc__week-table-group-row" onClick={() => toggleWeekTableGroup(gi)}>
                    <td colSpan={weekTableDates.length + 1}>
                      <div className="sc__week-table-group-inner">
                        <span className={`sc__week-table-group-chevron${expandedGroups[gi] ? '' : ' sc__week-table-group-chevron--collapsed'}`}>▾</span>
                        <span className="sc__week-table-group-label">{group.label}</span>
                        <span className="sc__week-table-group-count">{group.hours.length} hourly slots</span>
                      </div>
                    </td>
                  </tr>
                  {expandedGroups[gi] && group.hours.map((h) => (
                    <tr key={h} className="sc__week-table-row">
                      <td className="sc__week-table-time-col">{formatHour(h)} – {formatHour((h + 1) % 24)}</td>
                      {weekTableDates.map((date) => {
                        const val = getMockHourValue(date, h);
                        return (
                          <td key={date}>
                            <span className={`sc__week-table-cell${val === 0 ? ' sc__week-table-cell--empty' : ''}`}>{val}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
              <tr className="sc__week-table-total-row">
                <td className="sc__week-table-time-col">Daily Total</td>
                {weekTableDates.map((date) => (
                  <td key={date}>{getMockDailyTotal(date)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sc__week-table-footnote">
          <span className="sc__week-table-footnote-icon">ⓘ</span>
          Hours are grouped into two 12-hour sections: 00:00–11:00 and 12:00–23:00. All 24 hours are included in totals.
        </p>
      </section>
      )}

      {isCopyModalOpen && (
        <div className="sc-modal-backdrop" onClick={() => setIsCopyModalOpen(false)}>
          <div className="sc-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            {/* Header */}
            <div className="sc-modal__header">
              <h2 className="sc-modal__title">Copy Configuration</h2>
              <button
                type="button"
                className="sc-modal__close"
                onClick={() => setIsCopyModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="sc-modal__body">
              {/* Step 1: Copy From */}
              <div className="sc-modal__step">
                <span className="sc-modal__step-num-title">1. Copy From</span>
                <div
                  className="sc-modal__date-selector"
                  onClick={() => modalCopyFromRef.current?.showPicker()}
                >
                  <span className="sc-modal__date-icon">📅</span>
                  <span className="sc-modal__date-text">{formatDateDisplay(modalCopyFrom)}</span>
                  <span className="sc-modal__chevron">▾</span>
                  <input
                    ref={modalCopyFromRef}
                    type="date"
                    value={modalCopyFrom}
                    onChange={(e) => setModalCopyFrom(e.target.value)}
                    className="sc-modal__date-hidden"
                    aria-label="Copy config from date"
                  />
                </div>
              </div>

              {/* Step 2: Copy To */}
              <div className="sc-modal__step">
                <span className="sc-modal__step-num-title">2. Copy To</span>
                <span className="sc-modal__step-subtitle">Select Date Range</span>
                
                <div className="sc-modal__range-row">
                  <div
                    className="sc-modal__range-box"
                    onClick={() => modalCopyToStartRef.current?.showPicker()}
                  >
                    <span className="sc-modal__range-label">Start Date</span>
                    <span className="sc-modal__range-val">{formatDateDisplay(modalCopyToStart)}</span>
                    <span className="sc-modal__range-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </span>
                    <input
                      ref={modalCopyToStartRef}
                      type="date"
                      value={modalCopyToStart}
                      onChange={(e) => setModalCopyToStart(e.target.value)}
                      className="sc-modal__date-hidden"
                      aria-label="Copy to start date"
                    />
                  </div>

                  <span className="sc-modal__range-arrow">→</span>

                  <div
                    className="sc-modal__range-box"
                    onClick={() => modalCopyToEndRef.current?.showPicker()}
                  >
                    <span className="sc-modal__range-label">End Date</span>
                    <span className="sc-modal__range-val">{formatDateDisplay(modalCopyToEnd)}</span>
                    <span className="sc-modal__range-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </span>
                    <input
                      ref={modalCopyToEndRef}
                      type="date"
                      value={modalCopyToEnd}
                      onChange={(e) => setModalCopyToEnd(e.target.value)}
                      className="sc-modal__date-hidden"
                      aria-label="Copy to end date"
                    />
                  </div>
                </div>
              </div>

              {/* Information Alert Box */}
              <div className="sc-modal__info-box">
                <span className="sc-modal__info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
                <span className="sc-modal__info-text">
                  This will copy the configuration from {formatDateDisplay(modalCopyFrom)} to {copyToDatesCount} selected {copyToDatesCount === 1 ? 'date' : 'dates'}.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="sc-modal__footer">
              <button
                type="button"
                className="sc-modal__btn sc-modal__btn--cancel"
                onClick={() => setIsCopyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sc-modal__btn sc-modal__btn--copy"
                onClick={handleModalApplyCopy}
              >
                Copy Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleConfig;
