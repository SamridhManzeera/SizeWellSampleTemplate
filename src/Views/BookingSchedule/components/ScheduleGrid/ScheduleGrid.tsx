import { CSSProperties } from 'react';
import { Company, Allocation, SlotKey, RouteFilter } from '../../types';
import { buildSlotKey } from '../../mockData';
import './ScheduleGrid.scss';

interface ScheduleGridProps {
  companies: Company[];
  allocations: Map<SlotKey, Allocation>;
  allocatedCounts: Map<string, number>;
  selectedDate: string;
  routeFilter: RouteFilter;
  onAvailableSlotClick: (companyId: string, hour: number) => void;
  onOccupiedSlotClick: (allocation: Allocation) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const ROW_COLORS = [
  '#6c5ce7', '#00b894', '#e17055', '#0984e3',
  '#fd79a8', '#00cec9', '#a29bfe', '#e74c3c', '#55efc4',
];

function formatHour(hour: number): { time: string; period: string } {
  const period = hour < 12 ? 'AM' : 'PM';
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return { time: `${String(h).padStart(2, '0')}:00`, period };
}

function ScheduleGrid({
  companies,
  allocations,
  allocatedCounts,
  selectedDate,
  routeFilter,
  onAvailableSlotClick,
  onOccupiedSlotClick,
}: ScheduleGridProps) {
  // Per-hour delivery totals across all companies
  const hourTotals = HOURS.map((hour) => {
    let total = 0;
    companies.forEach((company) => {
      const allocation = allocations.get(buildSlotKey(company.id, selectedDate, hour));
      if (allocation) total += allocation.deliveryCount;
    });
    return total;
  });

  const totalRequested = companies.reduce((s, c) => s + c.assignedDeliveries, 0);
  const totalAllocated = companies.reduce((s, c) => s + (allocatedCounts.get(c.id) ?? 0), 0);

  return (
    <div className="sg-wrapper">
      <table className="sg">
        {/* ── Column sizing ───────────────────────────────────── */}
        <colgroup>
          <col className="sg__col-company" />
          <col className="sg__col-stat" />
          <col className="sg__col-stat" />
          {HOURS.map((h) => <col key={h} className="sg__col-hour" />)}
        </colgroup>

        {/* ── Header ──────────────────────────────────────────── */}
        <thead>
          {/* ── Column delivery totals row — sits above time labels ── */}
          <tr className="sg__totals-row">
            <th className="sg__totals-label">Deliveries / Hour</th>
            <th className="sg__totals-stat sg__totals-stat--req">
              <span className="sg__col-total">{totalRequested}</span>
            </th>
            <th className="sg__totals-stat sg__totals-stat--alloc">
              <span className="sg__col-total">{totalAllocated}</span>
            </th>
            {hourTotals.map((total, hour) => (
              <th key={hour} className="sg__totals-cell">
                <span className="sg__col-total">{total}</span>
              </th>
            ))}
          </tr>
          {/* ── Time slot column headers ─────────────────────────── */}
          <tr>
            <th className="sg__th sg__th--company">Company / Structure</th>
            <th className="sg__th sg__th--stat sg__th--assigned">Requested</th>
            <th className="sg__th sg__th--stat sg__th--allocated">Allocated</th>
            {HOURS.map((hour) => {
              const { time, period } = formatHour(hour);
              return (
                <th key={hour} className="sg__th sg__th--hour">
                  <span className="sg__time">{time}</span>
                  <span className="sg__period">{period}</span>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ── Body ────────────────────────────────────────────── */}
        <tbody>
          {companies.map((company, idx) => {
            const allocated = allocatedCounts.get(company.id) ?? 0;
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
                </td>
                <td className="sg__td sg__td--stat-2">
                  <span className={`sg__stat-num sg__stat-num--allocated${isFull ? ' sg__stat-num--full' : ''}`}>
                    {allocated}
                  </span>
                </td>
                {HOURS.map((hour) => {
                  const key = buildSlotKey(company.id, selectedDate, hour);
                  const allocation = allocations.get(key);
                  const matchesFilter = !allocation || routeFilter === 'all' || allocation.routeType === routeFilter;
                  const isOccupied = !!allocation && matchesFilter;
                  const isDisabled = !isOccupied && isFull;

                  return (
                    <td key={hour} className="sg__td sg__td--slot">
                      <button
                        type="button"
                        className={`sg__slot${isOccupied ? ' sg__slot--occupied' : ' sg__slot--available'}${isDisabled ? ' sg__slot--disabled' : ''}`}
                        onClick={() =>
                          isOccupied
                            ? onOccupiedSlotClick(allocation!)
                            : onAvailableSlotClick(company.id, hour)
                        }
                        disabled={isDisabled}
                        title={
                          isDisabled
                            ? 'No remaining deliveries'
                            : isOccupied
                              ? `${allocation!.deliveryCount} deliveries (${allocation!.routeType}) — click to view`
                              : 'Available — click to allocate'
                        }
                      >
                        {isOccupied && (
                          <>
                            <span className="sg__slot-count">{allocation!.deliveryCount}</span>
                            <span className="sg__slot-icon">
                              {allocation!.routeType === 'one-way' ? '→' : '↔'}
                            </span>
                          </>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>

        {/* ── Footer / Routing Legend ─────────────────────────── */}
        <tfoot>
          <tr>
            <td colSpan={3 + HOURS.length} className="sg__footer">
              <div className="sg__footer-inner">
                <div className="sg__footer-left">
                  <span className="sg__footer-title">Routing Legend</span>
                  <span className="sg__footer-item">
                    <span className="sg__footer-arrow">→</span> One Way (Single Direction)
                  </span>
                  <span className="sg__footer-item">
                    <span className="sg__footer-arrow">↔</span> Two Way (Round Trip)
                  </span>
                </div>
                <div className="sg__footer-right">
                  <span className="sg__footer-desc">
                    <strong>One Way:</strong> Delivery in one direction only
                  </span>
                  <span className="sg__footer-desc">
                    <strong>Two Way:</strong> Delivery with return journey
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ScheduleGrid;
