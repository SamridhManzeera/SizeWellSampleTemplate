import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import { useRequests } from '../../Requests/RequestsContext';
import { RequestStatus, totalSlotsForRequest } from '../../Requests/requestTypes';
import { rowTotal, emptyCounts } from '../../Requests/deliverySlotUtils';
import { useScheduleConfig } from '../../ScheduleConfig/ScheduleConfigContext';
import '../../Requests/Requests.scss';

// ── Icons ─────────────────────────────────────────────────────────

function BoltIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatSubmitted(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Main Page ─────────────────────────────────────────────────────

export default function EmergencyRequests() {
  const navigate = useNavigate();
  const { requests } = useRequests();
  const { getConfigForDate } = useScheduleConfig();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>(
    'all'
  );

  const emergencyRequests = requests.filter((r) => r.kind === 'emergency');

  const total = emergencyRequests.length;
  const pending = emergencyRequests.filter((r) => r.status === 'pending').length;
  const approved = emergencyRequests.filter((r) => r.status === 'approved').length;
  const rejected = emergencyRequests.filter((r) => r.status === 'rejected').length;

  const filtered =
    statusFilter === 'all'
      ? emergencyRequests
      : emergencyRequests.filter((r) => r.status === statusFilter);

  // Grouped by delivery date so the Delivery Date / Available Slot columns
  // can be merged across every request sharing that date (one row per
  // request, but one date group per cell span).
  const sortedByDate = [...filtered].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  const dateRowSpans = new Map<string, number>();
  sortedByDate.forEach((req) => {
    dateRowSpans.set(req.startDate, (dateRowSpans.get(req.startDate) ?? 0) + 1);
  });

  // Available Slot = the day's total capacity minus everything already
  // allocated that day across every request (normal + emergency alike).
  function availableSlotsForDate(date: string): number {
    const capacity = getConfigForDate(date).totalCapacity;
    const allocated = requests.reduce(
      (sum, r) => sum + rowTotal(r.allocatedSlots[date] ?? emptyCounts()),
      0
    );
    return capacity - allocated;
  }

  const availableSlotsByDate = new Map<string, number>();
  dateRowSpans.forEach((_count, date) => {
    availableSlotsByDate.set(date, availableSlotsForDate(date));
  });

  const seenDates = new Set<string>();

  return (
    <div className="rq fmt-rq">
      <PageHeader />

      <PageHero
        icon={<BoltIcon />}
        title="Emergency Requests"
        subtitle="FMT overview of all emergency delivery requests for Sizewell C"
        eyebrow={null}
        actions={null}
      />

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="rq__stats">
        <div className="rq__stat">
          <span className="rq__stat-num">{total}</span>
          <span className="rq__stat-label">Total</span>
        </div>
        <div className="rq__stat rq__stat--pending">
          <span className="rq__stat-num">{pending}</span>
          <span className="rq__stat-label">Pending</span>
        </div>
        <div className="rq__stat rq__stat--approved">
          <span className="rq__stat-num">{approved}</span>
          <span className="rq__stat-label">Approved</span>
        </div>
        <div className="rq__stat rq__stat--rejected">
          <span className="rq__stat-num">{rejected}</span>
          <span className="rq__stat-label">Rejected</span>
        </div>
      </div>

      {/* ── List section ────────────────────────────────────── */}
      <div className="rq__list-section">
        <div className="rq__list-header">
          <h2 className="rq__list-title">Emergency Requests</h2>

          <div className="rq__filter-wrap">
            <label className="rq__filter-label" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              className="rq__filter-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as RequestStatus | 'all')
              }
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="rq__table-wrap">
          <table className="rq__table">
            <thead>
              <tr>
                <th>Delivery Date</th>
                <th>Available Slot</th>
                <th>Contractor Name</th>
                <th>Request ID</th>
                <th>Requested Slots</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedByDate.length === 0 && (
                <tr>
                  <td colSpan={8} className="rq__empty">
                    No emergency requests found.
                  </td>
                </tr>
              )}
              {sortedByDate.map((req) => {
                const isFirstOfDate = !seenDates.has(req.startDate);
                seenDates.add(req.startDate);
                const rowSpan = dateRowSpans.get(req.startDate) ?? 1;
                const available = availableSlotsByDate.get(req.startDate) ?? 0;

                return (
                  <tr key={req.id}>
                    {isFirstOfDate && (
                      <td rowSpan={rowSpan}>{formatDate(req.startDate)}</td>
                    )}
                    {isFirstOfDate && (
                      <td rowSpan={rowSpan}>
                        <span
                          className={`rq__slot-total${available < 0 ? ' rq__slot-total--over' : ''}`}
                        >
                          {available}
                        </span>
                      </td>
                    )}
                    <td>
                      <span className="rq__company">{req.contractorName}</span>
                    </td>
                    <td>
                      <span className="rq__req-id">{req.id}</span>
                    </td>
                    <td>
                      <span className="rq__slot-total">
                        {totalSlotsForRequest(req)}
                      </span>
                    </td>
                    <td className="rq__submitted">
                      {formatSubmitted(req.submittedAt)}
                    </td>
                    <td>
                      <span className={`rq__status rq__status--${req.status}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="rq__actions">
                        <button
                          type="button"
                          className="rq__action-btn rq__action-btn--view"
                          onClick={() =>
                            navigate(`/fmt/emergency-requests/${req.id}`, {
                              state: { from: '/fmt/emergency-requests' },
                            })
                          }
                        >
                          <EyeIcon />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
