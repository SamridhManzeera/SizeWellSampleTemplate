import { CSSProperties } from 'react';
import { FmtCompany, FmtBooking, FmtSlotKey } from '../../../types';
import { buildFmtSlotKey } from '../../../mockData';
import { HourType } from '../../../../ScheduleConfig/ScheduleConfigContext';
import './AllocationGrid.scss';

interface AllocationGridProps {
  companies: FmtCompany[];
  bookings: Map<FmtSlotKey, FmtBooking>;
  distributedCounts: Map<string, number>;
  selectedDate: string;
  hourLimits: Record<number, number>;
  hourTypes: Record<number, HourType>;
  showEarlyHours: boolean;
  showLateHours: boolean;
  onToggleEarlyHours: () => void;
  onToggleLateHours: () => void;
  onSlotClick: (company: FmtCompany, hour: number, booking?: FmtBooking) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const EARLY_HOURS = HOURS.filter((h) => h <= 5);
const PEAK_HOURS = HOURS.filter((h) => h >= 6 && h <= 18);
const LATE_HOURS = HOURS.filter((h) => h >= 19);

const ROW_COLORS = [
  '#6c5ce7',
  '#00b894',
  '#e17055',
  '#0984e3',
  '#fd79a8',
  '#00cec9',
  '#a29bfe',
  '#e74c3c',
  '#55efc4',
];

function formatHour(hour: number): string {
  const start = String(hour).padStart(2, '0');
  const end = String((hour + 1) % 24).padStart(2, '0');
  return `${start}:00 - ${end}:00`;
}

function TruckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5S5.17 15.5 6 15.5s1.5.67 1.5 1.5S6.83 18.5 6 18.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-1.5-6h-3V9.5h3.36L20 12.5h-1.5z" />
    </svg>
  );
}

function getHourConstraintLabel(hour: number, type: HourType): string | null {
  if (!type) return null;
  const period = hour < 12 ? 'AM' : 'PM';
  const kind = type === 'peak' ? 'Peak' : 'Shoulder';
  return `${period} ${kind} Cap`;
}

function AllocationGrid({
  companies,
  bookings,
  distributedCounts,
  selectedDate,
  hourLimits,
  hourTypes,
  showEarlyHours,
  showLateHours,
  onToggleEarlyHours,
  onToggleLateHours,
  onSlotClick,
}: AllocationGridProps) {
  const visibleHours = [
    ...(showEarlyHours ? EARLY_HOURS : []),
    ...PEAK_HOURS,
    ...(showLateHours ? LATE_HOURS : []),
  ];

  const hourTotals = visibleHours.map((hour) => {
    let total = 0;
    companies.forEach((company) => {
      const b = bookings.get(buildFmtSlotKey(company.id, selectedDate, hour));
      if (b) total += b.movementCount;
    });
    return total;
  });

  const totalDailyAllocated = companies.reduce(
    (s, c) => s + c.allocatedCapacity,
    0
  );
  const totalHourlyAllocation = companies.reduce(
    (s, c) => s + (distributedCounts.get(c.id) ?? 0),
    0
  );
  const totalRemaining = totalDailyAllocated - totalHourlyAllocation;
  const isTotalOverAllocated = totalRemaining < 0;

  return (
    <div className="alg-wrapper">
      <table className="alg">
        <colgroup>
          <col className="alg__col-company" />
          <col className="alg__col-stat" />
          <col className="alg__col-stat" />
          <col className="alg__col-stat" />
          {visibleHours.map((h) => (
            <col key={h} className="alg__col-hour" />
          ))}
        </colgroup>

        <thead>
          <tr className="alg__totals-row">
            <th className="alg__totals-label">Movements / Hour</th>
            <th className="alg__totals-stat alg__totals-stat--allocated">
              <span className="alg__totals-single">{totalDailyAllocated}</span>
            </th>
            <th className="alg__totals-stat alg__totals-stat--distributed">
              <span className="alg__totals-single">
                {totalHourlyAllocation}
              </span>
            </th>
            <th className="alg__totals-stat alg__totals-stat--remaining">
              <span
                className={`alg__totals-single${isTotalOverAllocated ? ' alg__totals-single--over' : ''}`}
              >
                {isTotalOverAllocated
                  ? `${Math.abs(totalRemaining)} over`
                  : totalRemaining}
              </span>
            </th>
            {visibleHours.map((hour, i) => (
              <th key={hour} className="alg__totals-cell">
                <span className="alg__totals-single">{hourTotals[i]}</span>
              </th>
            ))}
          </tr>
          <tr>
            <th className="alg__th alg__th--company">Contractor</th>
            <th className="alg__th alg__th--stat alg__th--allocated">
              Daily Allocated
            </th>
            <th className="alg__th alg__th--stat alg__th--distributed">
              Hourly Allocation Total
            </th>
            <th className="alg__th alg__th--stat alg__th--remaining">
              Remaining Allocation
              <button
                type="button"
                className="alg__hour-handle alg__hour-handle--right"
                onClick={onToggleEarlyHours}
                title={
                  showEarlyHours ? 'Hide 00:00–05:00' : 'Show 00:00–05:00'
                }
                aria-label={
                  showEarlyHours ? 'Hide 00:00–05:00' : 'Show 00:00–05:00'
                }
              >
                {showEarlyHours ? '−' : '+'}
              </button>
            </th>
            {visibleHours.map((hour) => {
              const hourType = hourTypes[hour] ?? null;
              const isConstrained = !!hourType;
              const constraintLabel = getHourConstraintLabel(hour, hourType);
              return (
                <th
                  key={hour}
                  className={`alg__th alg__th--hour${
                    isConstrained ? ' alg__th--constrained' : ''
                  }`}
                >
                  {constraintLabel && (
                    <span className="alg__hour-constraint-label">
                      {constraintLabel}
                    </span>
                  )}
                  <span className="alg__time">{formatHour(hour)}</span>
                  {(hourLimits[hour] ?? 0) > 0 && (
                    <span className="alg__hour-cap">
                      Max {hourLimits[hour]}
                    </span>
                  )}
                  {!showLateHours &&
                    hour === PEAK_HOURS[PEAK_HOURS.length - 1] && (
                      <button
                        type="button"
                        className="alg__hour-handle alg__hour-handle--right"
                        onClick={onToggleLateHours}
                        title="Show 19:00–23:00"
                        aria-label="Show 19:00–23:00"
                      >
                        +
                      </button>
                    )}
                  {showLateHours &&
                    hour === LATE_HOURS[LATE_HOURS.length - 1] && (
                      <button
                        type="button"
                        className="alg__hour-handle alg__hour-handle--right"
                        onClick={onToggleLateHours}
                        title="Hide 19:00–23:00"
                        aria-label="Hide 19:00–23:00"
                      >
                        −
                      </button>
                    )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {companies.map((company, idx) => {
            const allocated = company.allocatedCapacity;
            const distributed = distributedCounts.get(company.id) ?? 0;
            const remaining = allocated - distributed;
            const isOverAllocated = remaining < 0;
            const accentColor = ROW_COLORS[idx % ROW_COLORS.length];

            return (
              <tr
                key={company.id}
                className="alg__row"
                style={{ '--row-color': accentColor } as CSSProperties}
              >
                <td className="alg__td alg__td--company">
                  <div className="alg__company-inner">
                    <span className="alg__row-accent" />
                    <span className="alg__company-name">{company.name}</span>
                  </div>
                </td>

                <td className="alg__td alg__td--stat-1">
                  <span className="alg__stat-num">{allocated}</span>
                </td>
                <td className="alg__td alg__td--stat-2">
                  <span className="alg__stat-num">{distributed}</span>
                </td>
                <td className="alg__td alg__td--stat-3">
                  <span
                    className={`alg__stat-num${
                      remaining <= 0 ? ' alg__stat-num--full' : ''
                    }`}
                  >
                    {isOverAllocated ? 0 : remaining}
                  </span>
                  {isOverAllocated && (
                    <span className="alg__stat-over">
                      +{Math.abs(remaining)} over
                    </span>
                  )}
                </td>

                {visibleHours.map((hour) => {
                  const key = buildFmtSlotKey(company.id, selectedDate, hour);
                  const booking = bookings.get(key);
                  const isOccupied = !!booking;
                  const isConstrained = !!hourTypes[hour];

                  return (
                    <td
                      key={hour}
                      className={`alg__td alg__td--slot${
                        isConstrained ? ' alg__td--constrained' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className={`alg__slot${
                          isOccupied
                            ? ' alg__slot--occupied'
                            : ' alg__slot--available'
                        }`}
                        onClick={() => onSlotClick(company, hour, booking)}
                        title={
                          isOccupied
                            ? `${booking!.movementCount} allocated — click to edit`
                            : 'Available — click to allocate'
                        }
                      >
                        {isOccupied && (
                          <span className="alg__slot-badge">
                            <TruckIcon /> {booking!.movementCount}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AllocationGrid;
