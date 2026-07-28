import { CSSProperties } from 'react';
import { Company, Allocation, SlotKey } from '../../types';
import { buildSlotKey } from '../../mockData';
import './ScheduleGrid.scss';

type ViewMode = 'allocated' | 'booked' | 'combined';

interface ScheduleGridProps {
  companies: Company[];
  allocations: Map<SlotKey, Allocation>;
  allocatedCounts: Map<string, number>;
  bookedCounts: Map<string, number>;
  viewMode: ViewMode;
  selectedDate: string;
  hourLimits: Record<number, number>;
  onAvailableSlotClick: (companyId: string, hour: number) => void;
  onOccupiedSlotClick: (allocation: Allocation) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const ROW_COLORS = [
  '#6c5ce7', '#00b894', '#e17055', '#0984e3',
  '#fd79a8', '#00cec9', '#a29bfe', '#e74c3c', '#55efc4',
];

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5S5.17 15.5 6 15.5s1.5.67 1.5 1.5S6.83 18.5 6 18.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-1.5-6h-3V9.5h3.36L20 12.5h-1.5z" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
    </svg>
  );
}

function ScheduleGrid({
  companies, allocations, allocatedCounts, bookedCounts, viewMode,
  selectedDate, hourLimits, onAvailableSlotClick, onOccupiedSlotClick,
}: ScheduleGridProps) {
  const isCombined = viewMode === 'combined';

  const hourTotals = HOURS.map((hour) => {
    let allocated = 0;
    let booked = 0;
    companies.forEach((company) => {
      const a = allocations.get(buildSlotKey(company.id, selectedDate, hour));
      if (a) {
        allocated += a.inboundCount + a.outboundCount + a.twoWayCount * 2;
        booked += a.bookedCount;
      }
    });
    return { allocated, booked };
  });

  const totalRequestedInbound = companies.reduce((s, c) => s + c.inboundDeliveries, 0);
  const totalRequestedOutbound = companies.reduce((s, c) => s + c.outboundDeliveries, 0);
  const totalRequestedTwoWay = companies.reduce((s, c) => s + c.twoWayDeliveries, 0);
  const totalAllocated = companies.reduce((s, c) => s + (allocatedCounts.get(c.id) ?? 0), 0);
  const totalBooked = companies.reduce((s, c) => s + (bookedCounts.get(c.id) ?? 0), 0);

  const columnLabel = viewMode === 'booked' ? 'Booked' : 'Allocated';

  return (
    <div className="sg-wrapper">
      <table className="sg">
        <colgroup>
          <col className="sg__col-company" />
          <col className="sg__col-stat" />
          <col className="sg__col-stat" />
          {isCombined && <col className="sg__col-stat" />}
          {HOURS.map((h) => <col key={h} className="sg__col-hour" />)}
        </colgroup>

        <thead>
          <tr className="sg__totals-row">
            <th className="sg__totals-label">Deliveries / Hour</th>
            <th className="sg__totals-stat sg__totals-stat--req">
              <div className="sg__totals-chips sg__totals-chips--sm">
                <span className="sg__totals-chip sg__totals-chip--in">↑ {totalRequestedInbound}</span>
                <span className="sg__totals-chip sg__totals-chip--out">↓ {totalRequestedOutbound}</span>
                <span className="sg__totals-chip sg__totals-chip--tw">↕ {totalRequestedTwoWay}</span>
              </div>
            </th>
            {isCombined ? (
              <>
                <th className="sg__totals-stat sg__totals-stat--alloc sg__totals-stat--mid">
                  <span className="sg__totals-single">{totalAllocated}</span>
                </th>
                <th className="sg__totals-stat sg__totals-stat--booked">
                  <span className="sg__totals-single">{totalBooked}</span>
                </th>
              </>
            ) : (
              <th className="sg__totals-stat sg__totals-stat--alloc">
                <span className="sg__totals-single">{viewMode === 'booked' ? totalBooked : totalAllocated}</span>
              </th>
            )}
            {hourTotals.map(({ allocated, booked }, hour) => (
              <th key={hour} className="sg__totals-cell">
                {isCombined ? (
                  <div className="sg__totals-combo">
                    <span className="sg__totals-chip sg__totals-chip--alloc"><TruckIcon /> {allocated}</span>
                    <span className="sg__totals-chip sg__totals-chip--booked"><CalendarIcon /> {booked}</span>
                  </div>
                ) : (
                  <span className="sg__totals-single">{viewMode === 'booked' ? booked : allocated}</span>
                )}
              </th>
            ))}
          </tr>
          <tr>
            <th className="sg__th sg__th--company">Contractor</th>
            <th className="sg__th sg__th--stat sg__th--assigned">Requested</th>
            {isCombined ? (
              <>
                <th className="sg__th sg__th--stat sg__th--allocated sg__th--mid">Allocated</th>
                <th className="sg__th sg__th--stat sg__th--booked">Booked</th>
              </>
            ) : (
              <th className="sg__th sg__th--stat sg__th--allocated">{columnLabel}</th>
            )}
            {HOURS.map((hour) => (
              <th key={hour} className="sg__th sg__th--hour">
                <span className="sg__time">{formatHour(hour)}</span>
                {(hourLimits[hour] ?? 0) > 0 && (
                  <span className="sg__hour-cap">Max {hourLimits[hour]}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {companies.map((company, idx) => {
            const allocated = allocatedCounts.get(company.id) ?? 0;
            const booked = bookedCounts.get(company.id) ?? 0;
            const displayCount = viewMode === 'booked' ? booked : allocated;
            const isFull = allocated >= company.assignedDeliveries;
            const accentColor = ROW_COLORS[idx % ROW_COLORS.length];

            return (
              <tr
                key={company.id}
                className="sg__row"
                style={{ '--row-color': accentColor } as CSSProperties}
              >
                <td className="sg__td sg__td--company">
                  <div className="sg__company-inner">
                    <span className="sg__row-accent" />
                    <span className="sg__company-name">{company.name}</span>
                  </div>
                </td>
                <td className="sg__td sg__td--stat-1">
                  <span className="sg__stat-num sg__stat-num--assigned">
                    {company.assignedDeliveries}
                  </span>
                  <div className="sg__stat-breakdown">
                    <span className="sg__stat-bd sg__stat-bd--in">↑&nbsp;{company.inboundDeliveries}</span>
                    <span className="sg__stat-bd sg__stat-bd--out">↓&nbsp;{company.outboundDeliveries}</span>
                    <span className="sg__stat-bd sg__stat-bd--tw">↕&nbsp;{company.twoWayDeliveries}</span>
                  </div>
                </td>

                {isCombined ? (
                  <>
                    <td className="sg__td sg__td--stat-2 sg__td--stat-mid">
                      <span className={`sg__stat-num sg__stat-num--allocated${isFull ? ' sg__stat-num--full' : ''}`}>
                        {allocated}
                      </span>
                    </td>
                    <td className="sg__td sg__td--stat-3">
                      <span className="sg__stat-num sg__stat-num--allocated">
                        {booked}
                      </span>
                    </td>
                  </>
                ) : (
                  <td className="sg__td sg__td--stat-2">
                    <span className={`sg__stat-num sg__stat-num--allocated${isFull ? ' sg__stat-num--full' : ''}`}>
                      {displayCount}
                    </span>
                  </td>
                )}

                {HOURS.map((hour) => {
                  const key = buildSlotKey(company.id, selectedDate, hour);
                  const allocation = allocations.get(key);

                  const isOccupied = !!allocation;
                  const isDisabled = !isOccupied && isFull && viewMode === 'allocated';
                  const isReadOnly = viewMode === 'booked' || viewMode === 'combined';

                  const total = isOccupied
                    ? allocation!.inboundCount + allocation!.outboundCount + allocation!.twoWayCount * 2
                    : 0;

                  return (
                    <td key={hour} className="sg__td sg__td--slot">
                      <button
                        type="button"
                        className={`sg__slot${isOccupied ? ' sg__slot--occupied' : ' sg__slot--available'}${isDisabled ? ' sg__slot--disabled' : ''}${isReadOnly ? ' sg__slot--readonly' : ''}${isCombined && isOccupied ? ' sg__slot--combined' : ''}`}
                        onClick={() => {
                          if (isReadOnly) return;
                          isOccupied ? onOccupiedSlotClick(allocation!) : onAvailableSlotClick(company.id, hour);
                        }}
                        disabled={isDisabled}
                        title={
                          isReadOnly
                            ? undefined
                            : isDisabled
                              ? 'No remaining deliveries'
                              : isOccupied
                                ? `${total} deliveries — click to view`
                                : 'Available — click to allocate'
                        }
                      >
                        {isOccupied && (
                          isCombined ? (
                            <div className="sg__slot-combo">
                              <span className="sg__combo-badge sg__combo-badge--alloc"><TruckIcon /> {total}</span>
                              <span className="sg__combo-badge sg__combo-badge--booked"><CalendarIcon /> {allocation!.bookedCount}</span>
                            </div>
                          ) : (
                            <div className="sg__slot-content">
                              <span className="sg__slot-total">{total}</span>
                            </div>
                          )
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

export default ScheduleGrid;
