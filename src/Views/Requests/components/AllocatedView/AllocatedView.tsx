import { useEffect, useState } from 'react';
import { DaySlotCounts } from '../../requestTypes';
import {
  emptyCounts,
  rowTotal,
  formatDateShort,
  formatDayName,
  formatDateFull,
  formatHourRange,
  distributeDailySlotsToHours,
} from '../../deliverySlotUtils';
import './AllocatedView.scss';

function SmallTruckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 3, verticalAlign: 'middle' }}>
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5S5.17 15.5 6 15.5s1.5.67 1.5 1.5S6.83 18.5 6 18.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-1.5-6h-3V9.5h3.36L20 12.5h-1.5z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"></circle>
      <polyline points="8 12.5 10.8 15 16 9"></polyline>
    </svg>
  );
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

interface AllocatedViewProps {
  dates: string[];
  allocatedSlots: Record<string, DaySlotCounts>;
  bookedSlots: Record<string, DaySlotCounts>;
  contractorName: string;
  requestId: string;
}

function hourKey(date: string, hour: number) {
  return `${date}|${hour}`;
}

export default function AllocatedView({ dates, allocatedSlots, bookedSlots, contractorName, requestId }: AllocatedViewProps) {
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? '');
  // `baseline` is the count that was allocated when the popup was opened —
  // the release counter starts at 0 and counts up to it, rather than editing
  // the allocated count in place. `booked` is the portion of that allocation
  // already booked by a driver, which can never be released.
  const [selectedHour, setSelectedHour] = useState<{ hour: number; baseline: number; booked: number } | null>(null);
  const [releaseQty, setReleaseQty] = useState(0);
  // Per-hour count adjustments made from the release popup — the underlying
  // data model only tracks allocation per day, so releases are tracked here
  // and layered on top of the simulated hourly distribution.
  const [hourOverrides, setHourOverrides] = useState<Record<string, number>>({});

  // Keep the selected date valid if the request's date range changes.
  useEffect(() => {
    if (!dates.includes(selectedDate)) setSelectedDate(dates[0] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates]);

  if (!selectedDate) {
    return <p className="rf-alloc__empty">No requested dates to show allocations for.</p>;
  }

  const hourlySlots = distributeDailySlotsToHours(allocatedSlots[selectedDate] ?? emptyCounts());
  const bookedHourlySlots = distributeDailySlotsToHours(bookedSlots[selectedDate] ?? emptyCounts());

  function getHourCount(hour: number): number {
    const key = hourKey(selectedDate, hour);
    return key in hourOverrides ? hourOverrides[key] : rowTotal(hourlySlots[hour]);
  }

  function setHourCount(hour: number, value: number) {
    setHourOverrides(prev => ({ ...prev, [hourKey(selectedDate, hour)]: Math.max(0, value) }));
  }

  // Portion of an hour's original allocation already booked by a driver —
  // booked movements can never be released. Clamped to the original
  // allocation as a safety net against inconsistent mock data.
  function getBookedCount(hour: number): number {
    return Math.min(rowTotal(bookedHourlySlots[hour]), rowTotal(hourlySlots[hour]));
  }

  const allocatedTotal = ALL_HOURS.reduce((sum, hour) => sum + getHourCount(hour), 0);

  // Hours before the day's first allocated slot are treated as already
  // passed and can't be released — every allocated slot stays releasable.
  const firstAllocatedHour = ALL_HOURS.find(h => getHourCount(h) > 0);
  function isHourLocked(hour: number): boolean {
    return firstAllocatedHour !== undefined && hour < firstAllocatedHour;
  }

  function openHour(hour: number) {
    if (isHourLocked(hour)) return;
    setSelectedHour({ hour, baseline: getHourCount(hour), booked: getBookedCount(hour) });
    setReleaseQty(0);
  }

  function closeHour() {
    setSelectedHour(null);
    setReleaseQty(0);
  }

  function changeRelease(delta: number) {
    if (!selectedHour) return;
    const maxReleasable = selectedHour.baseline - selectedHour.booked;
    const next = Math.min(maxReleasable, Math.max(0, releaseQty + delta));
    setReleaseQty(next);
    setHourCount(selectedHour.hour, selectedHour.baseline - next);
  }

  return (
    <div className="rf-alloc">
      <div className="rf-alloc__date-tabs" role="tablist" aria-label="Requested dates">
        {dates.map(date => (
          <button
            key={date}
            type="button"
            role="tab"
            aria-selected={date === selectedDate}
            className={`rf-alloc__date-tab${date === selectedDate ? ' rf-alloc__date-tab--active' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <span className="rf-alloc__date-tab-date">{formatDateShort(date)}</span>
            <span className="rf-alloc__date-tab-day">({formatDayName(date)})</span>
          </button>
        ))}
      </div>

      <div className="rf-alloc__grid-card">
        <div className="rf-alloc__grid-header">
          <span className="rf-alloc__grid-title">Hourly Allocation · {formatDateFull(selectedDate)}</span>
          <span className="rf-alloc__grid-total">
            <CheckCircleIcon /> Total Allocated: <strong>{allocatedTotal}</strong>
          </span>
        </div>

        <div className="rf-alloc__hour-grid">
          {ALL_HOURS.map(hour => {
            const count = getHourCount(hour);
            const locked = isHourLocked(hour);
            const stateClass = locked
              ? ' rf-alloc__hour-cell--locked'
              : count > 0
                ? ' rf-alloc__hour-cell--occupied'
                : ' rf-alloc__hour-cell--empty';
            return (
              <button
                key={hour}
                type="button"
                className={`rf-alloc__hour-cell${stateClass}`}
                onClick={() => openHour(hour)}
                disabled={locked}
                title={locked ? 'This time slot is before the first allocation and cannot be released' : undefined}
              >
                <span className="rf-alloc__hour-time">{formatHourRange(hour)}</span>
                {count > 0 ? (
                  <span className={`rf-alloc__hour-badge${locked ? ' rf-alloc__hour-badge--locked' : ''}`}>
                    <SmallTruckIcon /> {count}
                  </span>
                ) : (
                  <span className="rf-alloc__hour-empty">–</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rf-alloc__legend">
          <span className="rf-alloc__legend-item">
            <span className="rf-alloc__legend-icon rf-alloc__legend-icon--allocated"><SmallTruckIcon /></span>
            Allocated
          </span>
          <span className="rf-alloc__legend-divider" />
          <span className="rf-alloc__legend-item">
            <span className="rf-alloc__legend-icon rf-alloc__legend-icon--empty">−</span>
            No allocation
          </span>
          <span className="rf-alloc__legend-divider" />
          <span className="rf-alloc__legend-item">
            <span className="rf-alloc__legend-icon rf-alloc__legend-icon--locked" aria-hidden="true" />
            Time Passed Out
          </span>
          <span className="rf-alloc__legend-note">All times shown in 24-hour format</span>
        </div>
      </div>

      {selectedHour && (
        <div className="rf-modal-backdrop" onClick={closeHour}>
          <div className="rf-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="rf-modal__header">
              <h2 className="rf-modal__title">Release Allocation</h2>
              <button type="button" className="rf-modal__close" onClick={closeHour} aria-label="Close">✕</button>
            </div>
            <div className="rf-modal__body">
              <div className="rf-modal__step">
                <span className="rf-modal__step-num-title">{contractorName || 'Contractor'}</span>
                <span className="rf-modal__step-subtitle">Request {requestId}</span>
              </div>

              <div className="rf-alloc__cell-details">
                <div className="rf-alloc__cell-detail">
                  <span className="rf-alloc__cell-detail-label">Date</span>
                  <span className="rf-alloc__cell-detail-val">{formatDateFull(selectedDate)}</span>
                </div>
                <div className="rf-alloc__cell-detail">
                  <span className="rf-alloc__cell-detail-label">Time Slot</span>
                  <span className="rf-alloc__cell-detail-val">{formatHourRange(selectedHour.hour)}</span>
                </div>
                <div className="rf-alloc__cell-detail">
                  <span className="rf-alloc__cell-detail-label">Currently Allocated</span>
                  <span className="rf-alloc__cell-detail-val">{selectedHour.baseline - releaseQty}</span>
                </div>
                <div className="rf-alloc__cell-detail">
                  <span className="rf-alloc__cell-detail-label">Booked</span>
                  <span className="rf-alloc__cell-detail-val">{selectedHour.booked}</span>
                </div>
              </div>

              <div className="rf-alloc__release-card">
                <span className="rf-alloc__release-label">Movements Want to Release</span>
                <div className="rf-alloc__release-counter">
                  <button
                    type="button"
                    className="rf-alloc__release-btn"
                    onClick={() => changeRelease(-1)}
                    disabled={releaseQty === 0}
                  >
                    −
                  </button>
                  <span className="rf-alloc__release-val">{releaseQty}</span>
                  <button
                    type="button"
                    className="rf-alloc__release-btn"
                    onClick={() => changeRelease(1)}
                    disabled={releaseQty >= selectedHour.baseline - selectedHour.booked}
                  >
                    +
                  </button>
                </div>
                <span className="rf-alloc__release-hint">
                  {releaseQty === 0
                    ? `Out of ${selectedHour.baseline} allocated (${selectedHour.booked} already booked), up to ${selectedHour.baseline - selectedHour.booked} can be released.`
                    : `Releasing ${releaseQty} of ${selectedHour.baseline} allocated movements (${selectedHour.booked} booked, not releasable).`}
                </span>
              </div>
            </div>
            <div className="rf-modal__footer" style={{ borderTop: '1px solid #e8ecf4', padding: '16px 24px' }}>
              <button type="button" className="rf__cancel-btn" onClick={closeHour}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
