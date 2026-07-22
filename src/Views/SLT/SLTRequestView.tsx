import { Fragment, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../Components/Layouts/PageHero/PageHero';
import { useRequests } from '../Requests/RequestsContext';
import { DaySlotCounts } from '../Requests/requestTypes';
import '../Requests/RequestForm.scss';
import './SLTRequestView.scss';

// ── Icons ─────────────────────────────────────────────────────────

function RequestFormIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function CalendarSmallIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatDayName(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'long' });
}

function formatDateFull(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateRange(startDate: string, endDate: string) {
  return startDate === endDate
    ? formatDateFull(startDate)
    : `${formatDateFull(startDate)} – ${formatDateFull(endDate)}`;
}

function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  if (!startStr || !endStr || end < start) return startStr ? [startStr] : [];
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(
      `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(cur.getDate()).padStart(2, '0')}`
    );
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function emptyCounts(): DaySlotCounts {
  return { inbound: 0, outbound: 0, twoWay: 0 };
}

function rowTotal(c: DaySlotCounts) {
  return c.inbound + c.outbound + c.twoWay * 2;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type SlotField = keyof DaySlotCounts;

const SLOT_ROWS: { field: SlotField; label: string }[] = [
  { field: 'twoWay', label: '2 - way' },
  { field: 'inbound', label: 'In - bound' },
  { field: 'outbound', label: 'Out - bound' },
];

// ── Main Component ────────────────────────────────────────────────

type Mode = 'view' | 'edit';

export default function SLTRequestView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getRequest, updateRequest } = useRequests();

  const existing = id ? getRequest(id) : undefined;

  const [mode, setMode] = useState<Mode>('view');
  const [allocatedSlots, setAllocatedSlots] = useState<
    Record<string, DaySlotCounts>
  >(existing?.allocatedSlots ?? {});

  if (!existing) {
    return (
      <div className="rf">
        <PageHeader />
        <div className="rf__section" style={{ margin: 24 }}>
          Request not found.
        </div>
      </div>
    );
  }

  const req = existing;
  const isView = mode === 'view';
  const dayDates = getDatesInRange(req.startDate, req.endDate);

  function setAllocatedCount(date: string, field: SlotField, value: number) {
    setAllocatedSlots((prev) => ({
      ...prev,
      [date]: { ...(prev[date] ?? emptyCounts()), [field]: Math.max(0, value) },
    }));
  }

  function handleEdit() {
    setAllocatedSlots(req.allocatedSlots ?? {});
    setMode('edit');
  }

  function handleCancel() {
    setAllocatedSlots(req.allocatedSlots ?? {});
    setMode('view');
  }

  function handleSave() {
    updateRequest({ ...req, allocatedSlots });
    setMode('view');
  }

  const requestedTotalByDay = dayDates.map((d) =>
    rowTotal(req.dailySlots[d] ?? emptyCounts())
  );
  const allocatedTotalByDay = dayDates.map((d) =>
    rowTotal(allocatedSlots[d] ?? emptyCounts())
  );

  return (
    <div className="rf">
      <PageHeader />

      <PageHero
        icon={<RequestFormIcon />}
        eyebrow={null}
        backAction={{
          label: '← Back',
          onClick: () => navigate('/slt/requests'),
        }}
        title={
          <>
            {req.id}
            <span className={`rf__kind-badge rf__kind-badge--${req.kind}`}>
              {req.kind === 'emergency' ? '⚡ Emergency' : 'Normal'}
            </span>
            <span
              className={`rf__status-badge rf__status-badge--${req.status}`}
            >
              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
            </span>
          </>
        }
        subtitle={
          isView
            ? 'Viewing submitted request.'
            : 'Editing delivery slot allocation.'
        }
        actions={
          <>
            {isView && (
              <button
                type="button"
                className="rf__hero-edit-btn"
                onClick={handleEdit}
              >
                <EditIcon /> Edit Allocation
              </button>
            )}
            {mode === 'edit' && (
              <button
                type="button"
                className="rf__hero-cancel-btn"
                onClick={handleCancel}
              >
                Cancel Edit
              </button>
            )}
          </>
        }
      />

      <div className="rf__form">
        {/* ── Section 1: Request Details ───────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 16 }}>
            Request Details
          </h2>

          <div className="rf__field" style={{ marginBottom: 16 }}>
            <span className="rf__label">Contractor Name</span>
            <div className="rf__read-val">{req.contractorName}</div>
          </div>

          <div className="slv__label" style={{ marginBottom: 8 }}>
            Delivery Date Range *
          </div>
          <div className="slv__date-row">
            <div className="slv__date-box">
              <span className="slv__date-box-label">Start Date</span>
              <span className="slv__date-box-val">
                <CalendarSmallIcon /> {formatDateShort(req.startDate)}
              </span>
            </div>
            <span className="slv__date-sep">—</span>
            <div className="slv__date-box">
              <span className="slv__date-box-label">End Date</span>
              <span className="slv__date-box-val">
                <CalendarSmallIcon /> {formatDateShort(req.endDate)}
              </span>
            </div>
          </div>
          <p className="rf__date-range-summary">
            {dayDates.length} {dayDates.length === 1 ? 'day' : 'days'} selected
            ({formatDateRange(req.startDate, req.endDate)})
          </p>
        </section>

        {/* ── Section 2: Delivery Slots ─────────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 4 }}>
            Delivery Slots
          </h2>
          <p className="rf__section-desc">
            Set the number of deliveries per day for each type.
          </p>

          <div className="slv__table-wrap">
            <table className="slv__table">
              <thead>
                <tr>
                  <th rowSpan={2} className="slv__type-col">
                    Type
                  </th>
                  {dayDates.map((date) => (
                    <th key={date} colSpan={2} className="slv__day-head">
                      <div className="slv__day-date">
                        {formatDateShort(date)}
                      </div>
                      {formatDayName(date)}
                    </th>
                  ))}
                </tr>
                <tr>
                  {dayDates.map((date) => (
                    <Fragment key={date}>
                      <th className="slv__sub-head slv__sub-head--req">
                        Requested
                      </th>
                      <th className="slv__sub-head slv__sub-head--alloc">
                        Allocated
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOT_ROWS.map(({ field, label }) => (
                  <tr key={field}>
                    <td className="slv__type-col">{label}</td>
                    {dayDates.map((date) => {
                      const requested = (req.dailySlots[date] ?? emptyCounts())[
                        field
                      ];
                      const allocated = (allocatedSlots[date] ?? emptyCounts())[
                        field
                      ];
                      return (
                        <Fragment key={date}>
                          <td className="slv__req-val">{requested}</td>
                          <td className="slv__alloc-cell">
                            {isView ? (
                              <span className="slv__alloc-val">
                                {allocated}
                              </span>
                            ) : (
                              <div className="slv__counter">
                                <button
                                  type="button"
                                  className="slv__counter-btn"
                                  onClick={() =>
                                    setAllocatedCount(
                                      date,
                                      field,
                                      allocated - 1
                                    )
                                  }
                                  disabled={allocated === 0}
                                >
                                  −
                                </button>
                                <span className="slv__counter-val">
                                  {allocated}
                                </span>
                                <button
                                  type="button"
                                  className="slv__counter-btn"
                                  onClick={() =>
                                    setAllocatedCount(
                                      date,
                                      field,
                                      allocated + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="slv__total-row">
                  <td className="slv__type-col">Total Across All Days</td>
                  {dayDates.map((date, i) => (
                    <Fragment key={date}>
                      <td className="slv__req-val">{requestedTotalByDay[i]}</td>
                      <td className="slv__alloc-val">
                        {allocatedTotalByDay[i]}
                      </td>
                    </Fragment>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ── Section 3: Notes ─────────────────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 12 }}>
            Notes
          </h2>
          {req.notes ? (
            <div className="rf__field">
              <div className="rf__read-val rf__read-val--multiline">
                {req.notes}
              </div>
            </div>
          ) : (
            <p className="rf__section-desc" style={{ margin: 0 }}>
              No notes added.
            </p>
          )}
        </section>

        {/* ── Section 4: Attachments ────────────────────────── */}
        <section className="rf__section">
          <h2 className="rf__section-title" style={{ marginBottom: 4 }}>
            Attachments
          </h2>
          <p className="rf__section-desc">
            Supporting documents submitted with this request.
          </p>

          {!req.attachments || req.attachments.length === 0 ? (
            <p className="rf__section-desc" style={{ margin: '12px 0 0' }}>
              No attachments added.
            </p>
          ) : (
            <ul className="rf__attach-list">
              {req.attachments.map((file, i) => (
                <li key={`${file.name}-${i}`} className="rf__attach-item">
                  <span className="rf__attach-icon">
                    <FileIcon />
                  </span>
                  <span className="rf__attach-name">{file.name}</span>
                  <span className="rf__attach-size">
                    {formatFileSize(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        {mode === 'edit' && (
          <div className="rf__footer">
            <button
              type="button"
              className="rf__cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rf__submit-btn"
              onClick={handleSave}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
