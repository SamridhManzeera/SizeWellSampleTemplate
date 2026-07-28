import { CSSProperties } from 'react';
import { FmtCompany, FmtBooking, FmtSlotKey } from '../../types';
import { buildFmtSlotKey } from '../../mockData';
import { DCO_HOUR_CONSTRAINTS } from '../../../../ScheduleConfig/ScheduleConfigContext';
import './FmtScheduleGrid.scss';

interface BookedBreakdown {
  inbound: number;
  outbound: number;
  twoWay: number;
}

interface FmtScheduleGridProps {
  companies: FmtCompany[];
  bookings: Map<FmtSlotKey, FmtBooking>;
  bookedCounts: Map<string, number>;
  bookedBreakdown: Map<string, BookedBreakdown>;
  selectedDate: string;
  hourLimits: Record<number, number>;
  showEarlyHours: boolean;
  showLateHours: boolean;
  onToggleEarlyHours: () => void;
  onToggleLateHours: () => void;
  onViewBooking: (booking: FmtBooking) => void;
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
  return `${String(hour).padStart(2, '0')}:00`;
}

function getHourConstraintLabel(hour: number): string | null {
  const constraint = DCO_HOUR_CONSTRAINTS[hour];
  if (!constraint) return null;
  const period = hour < 12 ? 'AM' : 'PM';
  const kind = constraint.type === 'peak' ? 'Peak' : 'Shoulder';
  return `${period} ${kind}`;
}

export function TruckIcon() {
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

export function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
    </svg>
  );
}

function FmtScheduleGrid({
  companies,
  bookings,
  bookedCounts,
  bookedBreakdown,
  selectedDate,
  hourLimits,
  showEarlyHours,
  showLateHours,
  onToggleEarlyHours,
  onToggleLateHours,
  onViewBooking,
}: FmtScheduleGridProps) {
  const visibleHours = [
    ...(showEarlyHours ? EARLY_HOURS : []),
    ...PEAK_HOURS,
    ...(showLateHours ? LATE_HOURS : []),
  ];

  const hourTotals = visibleHours.map((hour) => {
    let allocated = 0;
    let booked = 0;
    companies.forEach((company) => {
      const b = bookings.get(buildFmtSlotKey(company.id, selectedDate, hour));
      if (b) {
        allocated += b.movementCount;
        booked += b.bookedCount;
      }
    });
    return { allocated, booked };
  });

  const totalAllocated = companies.reduce((s, c) => s + c.allocatedCapacity, 0);
  const totalBooked = companies.reduce(
    (s, c) => s + (bookedCounts.get(c.id) ?? 0),
    0
  );
  const totalRemaining = totalAllocated - totalBooked;

  return (
    <div className="fsg-wrapper">
      <table className="fsg">
        <colgroup>
          <col className="fsg__col-company" />
          <col className="fsg__col-stat" />
          <col className="fsg__col-stat" />
          <col className="fsg__col-stat" />
          {visibleHours.map((h) => (
            <col key={h} className="fsg__col-hour" />
          ))}
        </colgroup>

        <thead>
          <tr className="fsg__totals-row">
            <th className="fsg__totals-label">Movements / Hour</th>
            <th className="fsg__totals-stat fsg__totals-stat--allocated">
              <span className="fsg__totals-single">{totalAllocated}</span>
            </th>
            <th className="fsg__totals-stat fsg__totals-stat--booked">
              <span className="fsg__totals-single">{totalBooked}</span>
            </th>
            <th className="fsg__totals-stat fsg__totals-stat--remaining">
              <span className="fsg__totals-single">{totalRemaining}</span>
            </th>
            {visibleHours.map((hour, i) => {
              const { allocated, booked } = hourTotals[i];
              return (
                <th key={hour} className="fsg__totals-cell">
                  <div className="fsg__totals-combo">
                    <span className="fsg__totals-chip fsg__totals-chip--alloc">
                      <TruckIcon /> {allocated}
                    </span>
                    <span className="fsg__totals-chip fsg__totals-chip--booked">
                      <CalendarIcon /> {booked}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
          <tr>
            <th className="fsg__th fsg__th--company">Contractor</th>
            <th className="fsg__th fsg__th--stat fsg__th--allocated">
              Allocated
            </th>
            <th className="fsg__th fsg__th--stat fsg__th--booked">Booked</th>
            <th className="fsg__th fsg__th--stat fsg__th--remaining">
              Unbooked Allocation
              <button
                type="button"
                className="fsg__hour-handle fsg__hour-handle--right"
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
              const isConstrained = !!DCO_HOUR_CONSTRAINTS[hour];
              const constraintLabel = getHourConstraintLabel(hour);
              return (
                <th
                  key={hour}
                  className={`fsg__th fsg__th--hour${
                    isConstrained ? ' fsg__th--constrained' : ''
                  }`}
                >
                  {constraintLabel && (
                    <span className="fsg__hour-constraint-label">
                      {constraintLabel}
                    </span>
                  )}
                  <span className="fsg__time">{formatHour(hour)}</span>
                  {(hourLimits[hour] ?? 0) > 0 && (
                    <span className="fsg__hour-cap">
                      Max {hourLimits[hour]}
                    </span>
                  )}
                  {!showLateHours &&
                    hour === PEAK_HOURS[PEAK_HOURS.length - 1] && (
                      <button
                        type="button"
                        className="fsg__hour-handle fsg__hour-handle--right"
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
                        className="fsg__hour-handle fsg__hour-handle--right"
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
            const booked = bookedCounts.get(company.id) ?? 0;
            const remaining = allocated - booked;
            const breakdown = bookedBreakdown.get(company.id);
            const accentColor = ROW_COLORS[idx % ROW_COLORS.length];

            return (
              <tr
                key={company.id}
                className="fsg__row"
                style={{ '--row-color': accentColor } as CSSProperties}
              >
                <td className="fsg__td fsg__td--company">
                  <div className="fsg__company-inner">
                    <span className="fsg__row-accent" />
                    <span className="fsg__company-name">{company.name}</span>
                  </div>
                </td>

                <td className="fsg__td fsg__td--stat-1">
                  <span className="fsg__stat-num fsg__stat-num--allocated">
                    {allocated}
                  </span>
                </td>
                <td className="fsg__td fsg__td--stat-2">
                  <span className="fsg__stat-num fsg__stat-num--booked">
                    {booked}
                  </span>
                  {booked > 0 && breakdown && (
                    <div className="fsg__stat-breakdown">
                      <span
                        className="fsg__stat-breakdown-item fsg__stat-breakdown-item--twoway"
                        title={`Two-way: ${breakdown.twoWay}`}
                      >
                        {breakdown.twoWay}
                      </span>
                      <span
                        className="fsg__stat-breakdown-item fsg__stat-breakdown-item--inbound"
                        title={`Inbound: ${breakdown.inbound}`}
                      >
                        {breakdown.inbound}
                      </span>
                      <span
                        className="fsg__stat-breakdown-item fsg__stat-breakdown-item--outbound"
                        title={`Outbound: ${breakdown.outbound}`}
                      >
                        {breakdown.outbound}
                      </span>
                    </div>
                  )}
                </td>
                <td className="fsg__td fsg__td--stat-3">
                  <span
                    className={`fsg__stat-num fsg__stat-num--remaining${remaining <= 0 ? ' fsg__stat-num--full' : ''
                      }`}
                  >
                    {remaining}
                  </span>
                </td>

                {visibleHours.map((hour) => {
                  const key = buildFmtSlotKey(company.id, selectedDate, hour);
                  const booking = bookings.get(key);
                  const isOccupied = !!booking;
                  const isConstrained = !!DCO_HOUR_CONSTRAINTS[hour];

                  return (
                    <td
                      key={hour}
                      className={`fsg__td fsg__td--slot${
                        isConstrained ? ' fsg__td--constrained' : ''
                      }`}
                    >
                      {isOccupied ? (
                        <button
                          type="button"
                          className="fsg__slot fsg__slot--occupied"
                          onClick={() => onViewBooking(booking!)}
                          title={`${booking!.movementCount} allocated · ${booking!.bookedCount
                            } booked — click to view`}
                        >
                          <div className="fsg__slot-combo">
                            <span className="fsg__combo-badge fsg__combo-badge--alloc">
                              <TruckIcon /> {booking!.movementCount}
                            </span>
                            <span className="fsg__combo-badge fsg__combo-badge--booked">
                              <CalendarIcon /> {booking!.bookedCount}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div className="fsg__slot fsg__slot--empty" />
                      )}
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

export default FmtScheduleGrid;
