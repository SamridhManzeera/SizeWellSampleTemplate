import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../Components/Layouts/PageHero/PageHero';
import { useRequests } from '../Requests/RequestsContext';
import { DeliveryRequest } from '../Requests/requestTypes';
import { useScheduleConfig } from '../ScheduleConfig/ScheduleConfigContext';
import {
  addDays,
  emptyCounts,
  getDatesInRange,
  getWeekStart,
  formatDateRange,
  rowTotal,
} from '../Requests/deliverySlotUtils';
import SLTDeliverySlotsGrid, {
  RequestedIcon,
  AllocatedIcon,
} from './components/SLTDeliverySlotsGrid/SLTDeliverySlotsGrid';
import SLTAllocationModal from './components/SLTAllocationModal/SLTAllocationModal';
import SLTCapacityModal from './components/SLTCapacityModal/SLTCapacityModal';
import '../Requests/Requests.scss';
import './SLTDeliverySlots.scss';

// ── Icons ─────────────────────────────────────────────────────────

function CompaniesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekOptions(requests: DeliveryRequest[]): string[] {
  const set = new Set<string>();
  requests.forEach((req) => {
    let cur = getWeekStart(req.startDate);
    const last = getWeekStart(req.endDate);
    while (cur <= last) {
      set.add(cur);
      cur = addDays(cur, 7);
    }
  });
  return Array.from(set).sort();
}

function sumForDates(
  requests: DeliveryRequest[],
  dates: string[],
  source: 'dailySlots' | 'allocatedSlots'
): number {
  let sum = 0;
  requests.forEach((req) => {
    dates.forEach((date) => {
      if (date >= req.startDate && date <= req.endDate) {
        sum += rowTotal(req[source][date] ?? emptyCounts());
      }
    });
  });
  return sum;
}

interface ModalState {
  open: boolean;
  request: DeliveryRequest | null;
  date: string;
}

// ── Main Page ─────────────────────────────────────────────────────

export default function SLTDeliverySlots() {
  const navigate = useNavigate();
  const { requests, updateRequest } = useRequests();
  const { getConfigForDate } = useScheduleConfig();
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    request: null,
    date: '',
  });
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);

  const weekOptions = useMemo(() => getWeekOptions(requests), [requests]);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(() => {
    const weeks = getWeekOptions(requests);
    const todayWeek = getWeekStart(getTodayString());
    return weeks.includes(todayWeek) ? todayWeek : weeks[0] ?? '';
  });

  const weekEnd = selectedWeekStart ? addDays(selectedWeekStart, 6) : '';
  const dateColumns = useMemo(
    () => (selectedWeekStart ? getDatesInRange(selectedWeekStart, weekEnd) : []),
    [selectedWeekStart, weekEnd]
  );

  const weekIndex = weekOptions.indexOf(selectedWeekStart);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        return (
          !selectedWeekStart ||
          (req.startDate <= weekEnd && req.endDate >= selectedWeekStart)
        );
      })
      .sort(
        (a, b) =>
          a.contractorName.localeCompare(b.contractorName) ||
          a.startDate.localeCompare(b.startDate)
      );
  }, [requests, selectedWeekStart, weekEnd]);

  const totalCompanies = new Set(
    filteredRequests.map((r) => r.contractorName)
  ).size;
  const totalRequested = sumForDates(
    filteredRequests,
    dateColumns,
    'dailySlots'
  );
  const totalAllocated = sumForDates(
    filteredRequests,
    dateColumns,
    'allocatedSlots'
  );

  const weeklyCapacityDays = useMemo(
    () =>
      dateColumns.map((date) => ({
        date,
        capacity: getConfigForDate(date).totalCapacity,
      })),
    [dateColumns, getConfigForDate]
  );
  const totalWeeklyCapacity = weeklyCapacityDays.reduce(
    (sum, d) => sum + d.capacity,
    0
  );
  const capacityByDate = useMemo(
    () =>
      Object.fromEntries(weeklyCapacityDays.map((d) => [d.date, d.capacity])),
    [weeklyCapacityDays]
  );

  function handleCellClick(request: DeliveryRequest, date: string) {
    setModalState({ open: true, request, date });
  }

  function handleModalClose() {
    setModalState((prev) => ({ ...prev, open: false }));
  }

  function handleViewRequest(request: DeliveryRequest) {
    navigate(`/slt/requests/${request.id}`);
  }

  function handleConfirm(allocatedTotal: number) {
    const { request, date } = modalState;
    if (!request) return;
    updateRequest({
      ...request,
      allocatedSlots: {
        ...request.allocatedSlots,
        [date]: { inbound: allocatedTotal, outbound: 0, twoWay: 0 },
      },
    });
    handleModalClose();
  }

  return (
    <div className="rq slt-ds">
      <PageHeader />

      <PageHero
        icon={<CompaniesIcon />}
        title="Company Delivery Slots"
        subtitle="Day-wise Requested vs Allocated delivery slots for every company with a request"
        eyebrow={null}
        actions={null}
      />

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="rq__stats">
        <div className="rq__stat slt-ds__stat--capacity">
          <button
            type="button"
            className="slt-ds__capacity-eye"
            onClick={() => setCapacityModalOpen(true)}
            title="View daily slot capacity"
            aria-label="View daily slot capacity"
          >
            <EyeIcon />
          </button>
          <span className="rq__stat-num">{totalWeeklyCapacity}</span>
          <span className="rq__stat-label">Total Slot Capacity (Week)</span>
        </div>
        <div className="rq__stat">
          <span className="rq__stat-num">{totalCompanies}</span>
          <span className="rq__stat-label">Companies</span>
        </div>
        <div className="rq__stat">
          <span className="rq__stat-num">{filteredRequests.length}</span>
          <span className="rq__stat-label">Requests</span>
        </div>
        <div className="rq__stat rq__stat--approved">
          <span className="rq__stat-num">{totalRequested}</span>
          <span className="rq__stat-label">Requested Slots</span>
        </div>
        <div className="rq__stat rq__stat--pending">
          <span className="rq__stat-num">{totalAllocated}</span>
          <span className="rq__stat-label">Allocated Slots</span>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="rq__list-section slt-ds__filters">
        <div className="rq__list-header">
          <h2 className="rq__list-title">All Companies</h2>

          <div className="slt-ds__filter-row">
            <div className="slt-ds__week-nav">
              <button
                type="button"
                className="slt-ds__week-btn"
                onClick={() =>
                  weekIndex > 0 &&
                  setSelectedWeekStart(weekOptions[weekIndex - 1])
                }
                disabled={weekIndex <= 0}
                aria-label="Previous week"
              >
                ‹
              </button>
              <span className="slt-ds__week-label">
                {selectedWeekStart
                  ? formatDateRange(selectedWeekStart, weekEnd)
                  : 'No weeks available'}
              </span>
              <button
                type="button"
                className="slt-ds__week-btn"
                onClick={() =>
                  weekIndex < weekOptions.length - 1 &&
                  setSelectedWeekStart(weekOptions[weekIndex + 1])
                }
                disabled={weekIndex === -1 || weekIndex >= weekOptions.length - 1}
                aria-label="Next week"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="slt-ds__legend">
          <span className="slt-ds__legend-title">Legend</span>
          <span className="slt-ds__legend-divider" />
          <span className="slt-ds__legend-item">
            <span className="slt-ds__legend-swatch slt-ds__legend-swatch--req">
              <RequestedIcon />
            </span>
            Requested
          </span>
          <span className="slt-ds__legend-item">
            <span className="slt-ds__legend-swatch slt-ds__legend-swatch--alloc">
              <AllocatedIcon />
            </span>
            Allocated
          </span>
          <span className="slt-ds__legend-item">
            <span className="slt-ds__legend-dash">—</span>
            No request that day
          </span>
        </div>

        <SLTDeliverySlotsGrid
          requests={filteredRequests}
          dateColumns={dateColumns}
          capacityByDate={capacityByDate}
          onCellClick={handleCellClick}
          onViewRequest={handleViewRequest}
        />
      </div>

      <SLTAllocationModal
        open={modalState.open}
        request={modalState.request}
        date={modalState.date}
        onConfirm={handleConfirm}
        onClose={handleModalClose}
      />

      <SLTCapacityModal
        open={capacityModalOpen}
        weekLabel={
          selectedWeekStart ? formatDateRange(selectedWeekStart, weekEnd) : ''
        }
        totalCapacity={totalWeeklyCapacity}
        days={weeklyCapacityDays}
        onClose={() => setCapacityModalOpen(false)}
      />
    </div>
  );
}
