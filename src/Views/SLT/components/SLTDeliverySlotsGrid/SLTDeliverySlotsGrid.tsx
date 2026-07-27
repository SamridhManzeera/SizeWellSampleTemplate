import { CSSProperties, useMemo } from 'react';
import {
  DeliveryRequest,
  totalSlotsForRequest,
  totalAllocatedForRequest,
} from '../../../Requests/requestTypes';
import {
  formatDateShort,
  formatDayName,
  emptyCounts,
  rowTotal,
} from '../../../Requests/deliverySlotUtils';
import './SLTDeliverySlotsGrid.scss';

interface SLTDeliverySlotsGridProps {
  requests: DeliveryRequest[];
  dateColumns: string[];
  onCellClick: (request: DeliveryRequest, date: string) => void;
  onViewRequest: (request: DeliveryRequest) => void;
}

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

export function RequestedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

export function AllocatedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 14.4l2.1 2.1L15.5 12"
      />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function SLTDeliverySlotsGrid({
  requests,
  dateColumns,
  onCellClick,
  onViewRequest,
}: SLTDeliverySlotsGridProps) {
  const rowColorByCompany = useMemo(() => {
    const map = new Map<string, string>();
    requests.forEach((req) => {
      if (!map.has(req.contractorName)) {
        map.set(req.contractorName, ROW_COLORS[map.size % ROW_COLORS.length]);
      }
    });
    return map;
  }, [requests]);

  const totals = useMemo(() => {
    let requested = 0;
    let allocated = 0;
    const perDay = dateColumns.map((date) => {
      let dayRequested = 0;
      let dayAllocated = 0;
      requests.forEach((req) => {
        if (isDateInRange(date, req.startDate, req.endDate)) {
          dayRequested += rowTotal(req.dailySlots[date] ?? emptyCounts());
          dayAllocated += rowTotal(req.allocatedSlots[date] ?? emptyCounts());
        }
      });
      return { requested: dayRequested, allocated: dayAllocated };
    });
    requests.forEach((req) => {
      requested += totalSlotsForRequest(req);
      allocated += totalAllocatedForRequest(req);
    });
    return { requested, allocated, perDay };
  }, [requests, dateColumns]);

  return (
    <div className="dsg-wrapper">
      <table className="dsg">
        <colgroup>
          <col className="dsg__col-company" />
          <col className="dsg__col-stat" />
          <col className="dsg__col-stat" />
          {dateColumns.map((date) => (
            <col key={date} className="dsg__col-day" />
          ))}
        </colgroup>

        <thead>
          <tr className="dsg__totals-row">
            <th className="dsg__totals-label">Requested / Allocated</th>
            <th className="dsg__totals-stat dsg__totals-stat--requested">
              <span className="dsg__totals-single">{totals.requested}</span>
            </th>
            <th className="dsg__totals-stat dsg__totals-stat--allocated">
              <span className="dsg__totals-single">{totals.allocated}</span>
            </th>
            {totals.perDay.map(({ requested, allocated }, i) => (
              <th key={dateColumns[i]} className="dsg__totals-cell">
                <div className="dsg__totals-combo">
                  <span className="dsg__totals-chip dsg__totals-chip--req">
                    <RequestedIcon /> {requested}
                  </span>
                  <span className="dsg__totals-chip dsg__totals-chip--alloc">
                    <AllocatedIcon /> {allocated}
                  </span>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <th className="dsg__th dsg__th--company">Company / Request</th>
            <th className="dsg__th dsg__th--stat dsg__th--requested">
              Requested
            </th>
            <th className="dsg__th dsg__th--stat dsg__th--allocated">
              Allocated
            </th>
            {dateColumns.map((date) => (
              <th key={date} className="dsg__th dsg__th--day">
                <span className="dsg__day-date">{formatDateShort(date)}</span>
                <span className="dsg__day-name">{formatDayName(date)}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 && (
            <tr>
              <td
                className="dsg__empty-row"
                colSpan={3 + dateColumns.length}
              >
                No companies match this filter.
              </td>
            </tr>
          )}
          {requests.map((req) => {
            const requestedTotal = totalSlotsForRequest(req);
            const allocatedTotal = totalAllocatedForRequest(req);
            const accentColor = rowColorByCompany.get(req.contractorName);

            return (
              <tr
                key={req.id}
                className="dsg__row"
                style={{ '--row-color': accentColor } as CSSProperties}
              >
                <td className="dsg__td dsg__td--company">
                  <div className="dsg__company-inner">
                    <span className="dsg__row-accent" />
                    <div className="dsg__company-text">
                      <span className="dsg__company-name">
                        {req.contractorName}
                      </span>
                      <span className="dsg__request-id">{req.id}</span>
                      <button
                        type="button"
                        className="dsg__view-btn"
                        onClick={() => onViewRequest(req)}
                        title="View full request"
                      >
                        <ViewIcon />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </td>

                <td className="dsg__td dsg__td--stat-1">
                  <span className="dsg__stat-num dsg__stat-num--requested">
                    {requestedTotal}
                  </span>
                </td>
                <td className="dsg__td dsg__td--stat-2">
                  <span className="dsg__stat-num dsg__stat-num--allocated">
                    {allocatedTotal}
                  </span>
                </td>

                {dateColumns.map((date) => {
                  const inRange = isDateInRange(
                    date,
                    req.startDate,
                    req.endDate
                  );
                  if (!inRange) {
                    return (
                      <td key={date} className="dsg__td dsg__td--slot">
                        <div className="dsg__slot dsg__slot--empty">—</div>
                      </td>
                    );
                  }

                  const requested = rowTotal(
                    req.dailySlots[date] ?? emptyCounts()
                  );
                  const allocated = rowTotal(
                    req.allocatedSlots[date] ?? emptyCounts()
                  );
                  const isOccupied = allocated > 0;

                  return (
                    <td key={date} className="dsg__td dsg__td--slot">
                      <button
                        type="button"
                        className={`dsg__slot${
                          isOccupied
                            ? ' dsg__slot--occupied'
                            : ' dsg__slot--available'
                        }`}
                        onClick={() => onCellClick(req, date)}
                        title={`${requested} requested · ${allocated} allocated — click to edit`}
                      >
                        <div className="dsg__slot-combo">
                          <span className="dsg__combo-badge dsg__combo-badge--req">
                            <RequestedIcon /> {requested}
                          </span>
                          <span className="dsg__combo-badge dsg__combo-badge--alloc">
                            <AllocatedIcon /> {allocated}
                          </span>
                        </div>
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

export default SLTDeliverySlotsGrid;
