import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { startOfWeek, endOfWeek } from 'date-fns';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../Components/Layouts/PageHero/PageHero';
import WeekPicker from '../../Components/Layouts/WeekPicker/WeekPicker';
import { useRequests } from './RequestsContext';
import { VehicleType, DriverRoute, RequestKind, DaySlotCounts } from './requestTypes';
import './RequestForm.scss';

// ── Icons ─────────────────────────────────────────────────────────

function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>;
}

function RequestFormIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function todayString() { return new Date().toISOString().split('T')[0]; }

function nextId(count: number) { return `REQ-${String(count + 1).padStart(3, '0')}`; }

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

function currentWeekRange(): { startDate: string; endDate: string } {
  const today = new Date();
  return {
    startDate: dateToString(startOfWeek(today, { weekStartsOn: 1 })),
    endDate: dateToString(endOfWeek(today, { weekStartsOn: 1 })),
  };
}

function formatDate(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatDayName(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'long' });
}

function formatDateFull(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  if (!startStr || !endStr || end < start) return startStr ? [startStr] : [];
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(dateToString(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function emptyCounts(): DaySlotCounts { return { inbound: 0, outbound: 0, twoWay: 0 }; }

function rowTotal(c: DaySlotCounts) { return c.inbound + c.outbound + c.twoWay * 2; }

function formatDateRange(startDate: string, endDate: string) {
  return startDate === endDate ? formatDate(startDate) : `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

// ── Read-only field ───────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rf__field">
      <span className="rf__label">{label}</span>
      <div className="rf__read-val">{value || <span className="rf__read-empty">—</span>}</div>
    </div>
  );
}

// ── Per-day slot counter (compact, used inside the Delivery Slots table) ──

interface DaySlotCounterProps {
  value: number;
  colorClass: 'in' | 'out' | 'tw';
  onIncrease: () => void;
  onDecrease: () => void;
}

function DaySlotCounter({ value, colorClass, onIncrease, onDecrease }: DaySlotCounterProps) {
  return (
    <div className={`rf__ds-counter rf__ds-counter--${colorClass}`}>
      <button type="button" className="rf__ds-counter-btn" onClick={onDecrease} disabled={value === 0}>−</button>
      <span className="rf__ds-counter-val">{value}</span>
      <button type="button" className="rf__ds-counter-btn" onClick={onIncrease}>+</button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

type Mode = 'view' | 'edit' | 'create';

export default function RequestForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { requests, addRequest, updateRequest, getRequest } = useRequests();

  const existing = id ? getRequest(id) : undefined;
  const initMode: Mode = existing ? 'view' : 'create';

  const [mode, setMode] = useState<Mode>(initMode);
  const kind: RequestKind = existing?.kind ?? 'normal';
  const defaultWeek = currentWeekRange();
  const [startDate, setStartDate] = useState(existing?.startDate ?? defaultWeek.startDate);
  const [endDate, setEndDate] = useState(existing?.endDate ?? defaultWeek.endDate);
  const [dailySlots, setDailySlots] = useState<Record<string, DaySlotCounts>>(existing?.dailySlots ?? {});
  const vehicleType: VehicleType = existing?.vehicleType ?? 'HGV_ACA_MDS';
  const driverRoute: DriverRoute = existing?.driverRoute ?? 'route1a';
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isView = mode === 'view';
  const isCreate = mode === 'create';

  const dayDates = getDatesInRange(startDate, endDate);

  // Keep the per-day slot map in sync with the selected date range while editing.
  useEffect(() => {
    if (isView) return;
    setDailySlots(prev => {
      const next: Record<string, DaySlotCounts> = {};
      dayDates.forEach(d => { next[d] = prev[d] ?? emptyCounts(); });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, isView]);

  const totalSlots = dayDates.reduce((sum, d) => sum + rowTotal(dailySlots[d] ?? emptyCounts()), 0);
  const totalInbound = dayDates.reduce((sum, d) => sum + (dailySlots[d]?.inbound ?? 0), 0);
  const totalOutbound = dayDates.reduce((sum, d) => sum + (dailySlots[d]?.outbound ?? 0), 0);
  const totalTwoWay = dayDates.reduce((sum, d) => sum + (dailySlots[d]?.twoWay ?? 0), 0);

  // ── Copy Configuration modal (copy a previous week's slots onto this week) ──
  // No backend history endpoint yet, so a previous week's slots are looked up
  // from the mock request data already loaded into RequestsContext — if
  // nothing was submitted for the picked week the copy just applies zeros.
  function weekSlots(weekStart: string, weekEnd: string): Record<string, DaySlotCounts> {
    const merged: Record<string, DaySlotCounts> = {};
    requests
      .filter(r => r.startDate === weekStart && r.endDate === weekEnd)
      .forEach(r => {
        Object.entries(r.dailySlots).forEach(([date, c]) => {
          const cur = merged[date] ?? emptyCounts();
          merged[date] = { inbound: cur.inbound + c.inbound, outbound: cur.outbound + c.outbound, twoWay: cur.twoWay + c.twoWay };
        });
      });
    return merged;
  }

  // Day immediately before the currently selected week — the latest date
  // selectable as part of a "previous" week in the copy-from calendar.
  const copyFromMaxDate = (() => {
    const d = parseDate(startDate);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  function defaultCopyFromWeek(): { startDate: string; endDate: string } | null {
    const priorWeeks = Array.from(new Set(requests.filter(r => r.startDate < startDate).map(r => `${r.startDate}_${r.endDate}`)))
      .sort((a, b) => b.localeCompare(a));
    if (priorWeeks.length > 0) {
      const [s, e] = priorWeeks[0].split('_');
      return { startDate: s, endDate: e };
    }
    const d = parseDate(startDate);
    d.setDate(d.getDate() - 7);
    return { startDate: dateToString(startOfWeek(d, { weekStartsOn: 1 })), endDate: dateToString(endOfWeek(d, { weekStartsOn: 1 })) };
  }

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyFromWeek, setCopyFromWeek] = useState<{ startDate: string; endDate: string } | null>(null);

  function openCopyModal() {
    setCopyFromWeek(defaultCopyFromWeek());
    setIsCopyModalOpen(true);
  }

  const copyFromSlots = copyFromWeek ? weekSlots(copyFromWeek.startDate, copyFromWeek.endDate) : {};
  const copyFromSourceDates = copyFromWeek ? getDatesInRange(copyFromWeek.startDate, copyFromWeek.endDate) : [];

  function handleApplyCopy() {
    if (!copyFromWeek) return;
    setDailySlots(prev => {
      const next = { ...prev };
      dayDates.forEach((targetDate, i) => {
        const sourceDate = copyFromSourceDates[i];
        next[targetDate] = { ...(copyFromSlots[sourceDate] ?? emptyCounts()) };
      });
      return next;
    });
    setErrors(p => ({ ...p, slots: '' }));
    setIsCopyModalOpen(false);
  }

  function setDayCount(date: string, field: keyof DaySlotCounts, value: number) {
    setDailySlots(prev => ({
      ...prev,
      [date]: { ...(prev[date] ?? emptyCounts()), [field]: Math.max(0, value) },
    }));
    setErrors(p => ({ ...p, slots: '' }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!startDate || !endDate) errs.deliveryDate = 'Delivery week is required.';
    else if (endDate < startDate) errs.deliveryDate = 'End date must be on or after start date.';
    if (totalSlots === 0) errs.slots = 'Add at least 1 slot (inbound, outbound, or two-way) on any day.';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      kind, startDate, endDate, dailySlots,
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

      <PageHero
        icon={<RequestFormIcon />}
        eyebrow={null}
        backAction={{ label: '← Back', onClick: () => navigate('/requests') }}
        title={
          <>
            {isCreate ? 'Apply for Delivery' : existing?.id}
            <span className={`rf__kind-badge rf__kind-badge--${kind}`}>
              {kind === 'emergency' ? '⚡ Emergency' : 'Normal'}
            </span>
            {existing && (
              <span className={`rf__status-badge rf__status-badge--${existing.status}`}>
                {existing.status.charAt(0).toUpperCase() + existing.status.slice(1)}
              </span>
            )}
          </>
        }
        subtitle={
          isCreate ? 'Fill in the details and submit your delivery request.' : isView ? 'Viewing submitted request.' : 'Editing request details.'
        }
        actions={
          <>
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
          </>
        }
      />

      {submitted && (
        <div className="rf__success">
          ✓ Request {existing ? 'updated' : 'submitted'} successfully. Redirecting…
        </div>
      )}

      <form className="rf__form" onSubmit={handleSubmit} noValidate>

        {/* ── Section 1: Request Details ───────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 16 }}>Request Details</h2>

          {/* Delivery Week */}
          {isView ? (
            <ReadField label="Delivery Week" value={formatDateRange(startDate, endDate)} />
          ) : (
            <div className="rf__field rf__field--full">
              <label className="rf__label">Delivery Week *</label>
              <WeekPicker
                value={{ startDate, endDate }}
                minDate={parseDate(todayString())}
                onChange={week => {
                  setStartDate(week.startDate);
                  setEndDate(week.endDate);
                  setErrors(p => ({ ...p, deliveryDate: '' }));
                }}
              />
              <p className="rf__date-range-summary">
                {dayDates.length} {dayDates.length === 1 ? 'day' : 'days'} selected ({formatDateFull(startDate)} – {formatDateFull(endDate)})
              </p>
              {errors.deliveryDate && <span className="rf__err">{errors.deliveryDate}</span>}
            </div>
          )}
        </section>

        {/* ── Section 2: Delivery Slots ─────────────────────── */}
        <section className="rf__section">
          <div className="rf__ds-header">
            <div>
              <h2 className="rf__section-title" style={{ marginBottom: 4 }}>Delivery Slots</h2>
              <p className="rf__section-desc" style={{ marginBottom: 0 }}>Set the number of deliveries per day for each type.</p>
            </div>
            {!isView && (
              <button type="button" className="rf__ds-copy-btn" onClick={openCopyModal}>
                <CopyIcon /> Copy Configuration
              </button>
            )}
          </div>

          {errors.slots && <p className="rf__err" style={{ margin: '12px 0 0' }}>{errors.slots}</p>}

          <div className="rf__ds-table-wrap">
            <table className="rf__ds-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="rf__ds-th--tw">↕ Two Way (x2)</th>
                  <th className="rf__ds-th--in">↑ Inbound</th>
                  <th className="rf__ds-th--out">↓ Outbound</th>
                  <th>Total Slots</th>
                </tr>
              </thead>
              <tbody>
                {dayDates.map(date => {
                  const counts = dailySlots[date] ?? emptyCounts();
                  return (
                    <tr key={date}>
                      <td>
                        {formatDateShort(date)}
                        <div className="rf__ds-day-name">({formatDayName(date)})</div>
                      </td>
                      <td>
                        {isView ? (
                          <span className="rf__ds-view-num rf__ds-view-num--tw">{counts.twoWay}</span>
                        ) : (
                          <DaySlotCounter
                            value={counts.twoWay} colorClass="tw"
                            onDecrease={() => setDayCount(date, 'twoWay', counts.twoWay - 1)}
                            onIncrease={() => setDayCount(date, 'twoWay', counts.twoWay + 1)}
                          />
                        )}
                      </td>
                      <td>
                        {isView ? (
                          <span className="rf__ds-view-num rf__ds-view-num--in">{counts.inbound}</span>
                        ) : (
                          <DaySlotCounter
                            value={counts.inbound} colorClass="in"
                            onDecrease={() => setDayCount(date, 'inbound', counts.inbound - 1)}
                            onIncrease={() => setDayCount(date, 'inbound', counts.inbound + 1)}
                          />
                        )}
                      </td>
                      <td>
                        {isView ? (
                          <span className="rf__ds-view-num rf__ds-view-num--out">{counts.outbound}</span>
                        ) : (
                          <DaySlotCounter
                            value={counts.outbound} colorClass="out"
                            onDecrease={() => setDayCount(date, 'outbound', counts.outbound - 1)}
                            onIncrease={() => setDayCount(date, 'outbound', counts.outbound + 1)}
                          />
                        )}
                      </td>
                      <td className="rf__ds-row-total">{rowTotal(counts)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="rf__ds-total-row">
                  <td>Total Across All Days</td>
                  <td className="rf__ds-th--tw">{totalTwoWay}</td>
                  <td className="rf__ds-th--in">{totalInbound}</td>
                  <td className="rf__ds-th--out">{totalOutbound}</td>
                  <td>{totalSlots}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ── Section 3: Notes ─────────────────────────────── */}
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

      {isCopyModalOpen && (
        <div className="rf-modal-backdrop" onClick={() => setIsCopyModalOpen(false)}>
          <div className="rf-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="rf-modal__header">
              <h2 className="rf-modal__title">Copy Configuration</h2>
              <button type="button" className="rf-modal__close" onClick={() => setIsCopyModalOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className="rf-modal__body">
              <div className="rf-modal__step">
                <span className="rf-modal__step-num-title">1. Copy From</span>
                <span className="rf-modal__step-subtitle">Select a previous week</span>

                <WeekPicker
                  value={copyFromWeek}
                  onChange={week => setCopyFromWeek(week)}
                  maxDate={copyFromMaxDate}
                  placeholder="Select a previous week"
                />
              </div>

              <div className="rf-modal__step">
                <span className="rf-modal__step-num-title">2. Copy To</span>
                <span className="rf-modal__step-subtitle">Current selected week</span>

                <div className="rf-modal__range-box rf-modal__range-box--static">
                  <span className="rf-modal__range-label">This Week</span>
                  <span className="rf-modal__range-val">{formatDateRange(startDate, endDate)}</span>
                  <span className="rf-modal__range-icon"><CalendarSmallIcon /></span>
                </div>
              </div>

              {copyFromWeek && (
                <div className="rf-modal__info-box">
                  <span className="rf-modal__info-icon"><AlertIcon /></span>
                  <span className="rf-modal__info-text">
                    {Object.keys(copyFromSlots).length > 0
                      ? <>This will copy the full week's delivery slots (day-by-day) from {formatDateRange(copyFromWeek.startDate, copyFromWeek.endDate)} onto {formatDateRange(startDate, endDate)}, overwriting the current entries.</>
                      : <>No delivery slots were found for {formatDateRange(copyFromWeek.startDate, copyFromWeek.endDate)}. Copying will reset every day in {formatDateRange(startDate, endDate)} to 0.</>}
                  </span>
                </div>
              )}
            </div>

            <div className="rf-modal__footer">
              <button type="button" className="rf-modal__btn rf-modal__btn--cancel" onClick={() => setIsCopyModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rf-modal__btn rf-modal__btn--copy" onClick={handleApplyCopy} disabled={!copyFromWeek}>
                Copy Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
