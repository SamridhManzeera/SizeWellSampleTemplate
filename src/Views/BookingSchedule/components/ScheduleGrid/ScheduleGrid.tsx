import { CSSProperties } from 'react';
import { Company, Allocation, SlotKey, RouteFilter } from '../../types';
import { buildSlotKey } from '../../mockData';
import './ScheduleGrid.scss';

interface ScheduleGridProps {
  companies: Company[];
  allocations: Map<SlotKey, Allocation>;
  allocatedCounts: Map<string, number>;
  allocatedInboundCounts: Map<string, number>;
  allocatedOutboundCounts: Map<string, number>;
  allocatedTwoWayCounts: Map<string, number>;
  selectedDate: string;
  routeFilter: RouteFilter;
  hourCapacity: number;
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
  companies, allocations, allocatedCounts,
  allocatedInboundCounts, allocatedOutboundCounts, allocatedTwoWayCounts,
  selectedDate, routeFilter, hourCapacity, onAvailableSlotClick, onOccupiedSlotClick,
}: ScheduleGridProps) {

  const hourTotals = HOURS.map((hour) => {
    let inbound = 0; let outbound = 0; let twoWay = 0;
    companies.forEach((company) => {
      const a = allocations.get(buildSlotKey(company.id, selectedDate, hour));
      if (a) { inbound += a.inboundCount; outbound += a.outboundCount; twoWay += a.twoWayCount; }
    });
    return { inbound, outbound, twoWay };
  });

  const totalRequestedInbound = companies.reduce((s, c) => s + c.inboundDeliveries, 0);
  const totalRequestedOutbound = companies.reduce((s, c) => s + c.outboundDeliveries, 0);
  const totalRequestedTwoWay = companies.reduce((s, c) => s + c.twoWayDeliveries, 0);

  const totalAllocatedInbound = companies.reduce((s, c) => s + (allocatedInboundCounts.get(c.id) ?? 0), 0);
  const totalAllocatedOutbound = companies.reduce((s, c) => s + (allocatedOutboundCounts.get(c.id) ?? 0), 0);
  const totalAllocatedTwoWay = companies.reduce((s, c) => s + (allocatedTwoWayCounts.get(c.id) ?? 0), 0);

  return (
    <div className="sg-wrapper">
      <table className="sg">
        <colgroup>
          <col className="sg__col-company" />
          <col className="sg__col-stat" />
          <col className="sg__col-stat" />
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
            <th className="sg__totals-stat sg__totals-stat--alloc">
              <div className="sg__totals-chips sg__totals-chips--sm">
                <span className="sg__totals-chip sg__totals-chip--in">↑ {totalAllocatedInbound}</span>
                <span className="sg__totals-chip sg__totals-chip--out">↓ {totalAllocatedOutbound}</span>
                <span className="sg__totals-chip sg__totals-chip--tw">↕ {totalAllocatedTwoWay}</span>
              </div>
            </th>
            {hourTotals.map(({ inbound, outbound, twoWay }, hour) => (
              <th key={hour} className="sg__totals-cell">
                <div className="sg__totals-chips">
                  {inbound  > 0 && <span className="sg__totals-chip sg__totals-chip--in">↑ {inbound}</span>}
                  {outbound > 0 && <span className="sg__totals-chip sg__totals-chip--out">↓ {outbound}</span>}
                  {twoWay   > 0 && <span className="sg__totals-chip sg__totals-chip--tw">↕ {twoWay}</span>}
                </div>
              </th>
            ))}
          </tr>
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
                  <span className="sg__hour-cap">Max {hourCapacity}</span>
                </th>
              );
            })}
          </tr>
        </thead>

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
                  <div className="sg__stat-breakdown">
                    <span className="sg__stat-bd sg__stat-bd--in">↑&nbsp;{company.inboundDeliveries}</span>
                    <span className="sg__stat-bd sg__stat-bd--out">↓&nbsp;{company.outboundDeliveries}</span>
                    <span className="sg__stat-bd sg__stat-bd--tw">↕&nbsp;{company.twoWayDeliveries}</span>
                  </div>
                </td>
                <td className="sg__td sg__td--stat-2">
                  <span className={`sg__stat-num sg__stat-num--allocated${isFull ? ' sg__stat-num--full' : ''}`}>
                    {allocated}
                  </span>
                  <div className="sg__stat-breakdown">
                    <span className="sg__stat-bd sg__stat-bd--in">↑&nbsp;{allocatedInboundCounts.get(company.id) ?? 0}</span>
                    <span className="sg__stat-bd sg__stat-bd--out">↓&nbsp;{allocatedOutboundCounts.get(company.id) ?? 0}</span>
                    <span className="sg__stat-bd sg__stat-bd--tw">↕&nbsp;{allocatedTwoWayCounts.get(company.id) ?? 0}</span>
                  </div>
                </td>

                {HOURS.map((hour) => {
                  const key = buildSlotKey(company.id, selectedDate, hour);
                  const allocation = allocations.get(key);

                  const matchesFilter = !allocation
                    || routeFilter === 'all'
                    || (routeFilter === 'inbound' && allocation.inboundCount > 0)
                    || (routeFilter === 'outbound' && allocation.outboundCount > 0)
                    || (routeFilter === 'twoWay' && allocation.twoWayCount > 0);

                  const isOccupied = !!allocation && matchesFilter;
                  const isDisabled = !isOccupied && isFull;

                  const inbound = isOccupied ? allocation!.inboundCount : 0;
                  const outbound = isOccupied ? allocation!.outboundCount : 0;
                  const twoWay = isOccupied ? allocation!.twoWayCount : 0;
                  const total = inbound + outbound + twoWay * 2;

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
                              ? `${total} deliveries — click to view`
                              : 'Available — click to allocate'
                        }
                      >
                        {isOccupied && (
                          <div className="sg__slot-content">
                            <span className="sg__slot-total">{total}</span>
                            <span className="sg__slot-breakdown">
                              {inbound > 0 && <span className="sg__slot-bd-in">↑&nbsp;{inbound}</span>}
                              {outbound > 0 && <span className="sg__slot-bd-out">↓&nbsp;{outbound}</span>}
                              {twoWay > 0 && <span className="sg__slot-bd-tw">↕&nbsp;{twoWay}</span>}
                            </span>
                          </div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>

        {/* <tfoot>
          <tr>
            <td colSpan={3 + HOURS.length} className="sg__footer">
              <div className="sg__footer-inner">
                <div className="sg__footer-left">
                  <span className="sg__footer-title">Routing Legend</span>
                  <span className="sg__footer-item sg__footer-item--in">
                    <span className="sg__footer-arrow sg__footer-arrow--in">↑</span> Inbound
                  </span>
                  <span className="sg__footer-item sg__footer-item--out">
                    <span className="sg__footer-arrow sg__footer-arrow--out">↓</span> Outbound
                  </span>
                  <span className="sg__footer-item sg__footer-item--tw">
                    <span className="sg__footer-arrow sg__footer-arrow--tw">↕</span> Two Way
                  </span>
                </div>
                <div className="sg__footer-right">
                  <span className="sg__footer-desc"><strong>Inbound:</strong> Deliveries arriving at the facility</span>
                  <span className="sg__footer-desc"><strong>Outbound:</strong> Deliveries leaving the facility</span>
                  <span className="sg__footer-desc"><strong>Two Way:</strong> Inbound + Outbound combined (counts as ×2)</span>
                </div>
              </div>
            </td>
          </tr>
        </tfoot> */}
      </table>
    </div>
  );
}

export default ScheduleGrid;
