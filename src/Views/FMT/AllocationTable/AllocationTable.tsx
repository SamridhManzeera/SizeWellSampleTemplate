import { useState, useMemo, useRef } from 'react';
import { useScheduleConfig } from '../../ScheduleConfig/ScheduleConfigContext';
import { useFmtBookings } from '../FmtBookingsContext';
import { FmtBooking, FmtCompany } from '../types';
import {
  FMT_MOCK_COMPANIES,
  buildFmtSlotKey,
  getFmtHistoryForCompany,
} from '../mockData';
import AllocationGrid from './components/AllocationGrid/AllocationGrid';
import AllocationEditModal from './components/AllocationEditModal/AllocationEditModal';
import AllocationHistoryModal from './components/AllocationHistoryModal/AllocationHistoryModal';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import '../Dashboard/Dashboard.scss';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function TruckIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5S5.17 15.5 6 15.5s1.5.67 1.5 1.5S6.83 18.5 6 18.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-1.5-6h-3V9.5h3.36L20 12.5h-1.5z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 7l-8-4-8 4v10l8 4 8-4V7zm-8 1.5L17.5 11 12 13.5 6.5 11 12 8.5zM5 12.18l6 3v4.32l-6-3v-4.32zm8 7.32v-4.32l6-3v4.32l-6 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
    </svg>
  );
}

function CapacityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h4v4H7v-4z" />
    </svg>
  );
}

interface ModalState {
  open: boolean;
  company: FmtCompany | null;
  hour: number;
  existingBooking?: FmtBooking;
}

export default function AllocationTable() {
  const { getConfigForDate } = useScheduleConfig();
  const { bookings, updateAllocation } = useFmtBookings();

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showEarlyHours, setShowEarlyHours] = useState(false);
  const [showLateHours, setShowLateHours] = useState(false);
  const dayConfig = getConfigForDate(selectedDate);
  const HOUR_LIMITS = dayConfig.hourLimits;
  const totalSlotCapacityToday = dayConfig.totalCapacity;

  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    company: null,
    hour: 0,
  });

  const [historyState, setHistoryState] = useState<{
    open: boolean;
    company: FmtCompany | null;
  }>({ open: false, company: null });

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Distributed = sum of movementCount already assigned to hours today, per company
  const distributedCountsByCompany = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach((b) => {
      if (b.date === selectedDate) {
        counts.set(
          b.companyId,
          (counts.get(b.companyId) ?? 0) + b.movementCount
        );
      }
    });
    return counts;
  }, [bookings, selectedDate]);

  const totalDailyAllocated = FMT_MOCK_COMPANIES.reduce(
    (s, c) => s + c.allocatedCapacity,
    0
  );
  const totalHourlyAllocationToday = useMemo(() => {
    let sum = 0;
    distributedCountsByCompany.forEach((v) => {
      sum += v;
    });
    return sum;
  }, [distributedCountsByCompany]);
  const totalRemainingToday = totalDailyAllocated - totalHourlyAllocationToday;
  const isTodayOverAllocated = totalRemainingToday < 0;

  const isToday = selectedDate === getTodayString();

  function handleSlotClick(
    company: FmtCompany,
    hour: number,
    booking?: FmtBooking
  ) {
    setModalState({ open: true, company, hour, existingBooking: booking });
  }

  function handleModalClose() {
    setModalState((prev) => ({ ...prev, open: false }));
  }

  function handleViewHistory(company: FmtCompany) {
    setHistoryState({ open: true, company });
  }

  function handleHistoryClose() {
    setHistoryState((prev) => ({ ...prev, open: false }));
  }

  function handleConfirm(movementCount: number, notes: string) {
    if (!modalState.company) return;
    updateAllocation(
      modalState.company.id,
      selectedDate,
      modalState.hour,
      movementCount,
      notes
    );
    handleModalClose();
  }

  const historyEntries = useMemo(
    () =>
      historyState.company
        ? getFmtHistoryForCompany(historyState.company)
        : [],
    [historyState.company]
  );

  const modalCurrentDistributed = modalState.company
    ? distributedCountsByCompany.get(modalState.company.id) ?? 0
    : 0;

  const modalCurrentHourTotal = useMemo(() => {
    let sum = 0;
    FMT_MOCK_COMPANIES.forEach((c) => {
      const b = bookings.get(
        buildFmtSlotKey(c.id, selectedDate, modalState.hour)
      );
      if (b) {
        const skip = modalState.company && c.id === modalState.company.id;
        if (!skip) sum += b.movementCount;
      }
    });
    return sum;
  }, [bookings, selectedDate, modalState.hour, modalState.company]);

  return (
    <div className="fmtd">
      <PageHeader />

      <PageHero
        icon={<TruckIcon />}
        eyebrow="FMT"
        title="Allocation Table"
        subtitle=""
        actions={null}
      />

      <div className="fmtd__header">
        <div className="fmtd__kpi-row">
          <div className="fmtd__kpi-tile">
            <div className="fmtd__kpi-tile-top">
              <div className="fmtd__kpi-icon fmtd__kpi-icon--navy">
                <CapacityIcon />
              </div>
              <div className="fmtd__kpi-text">
                <span className="fmtd__kpi-num fmtd__kpi-num--navy">
                  {totalSlotCapacityToday}
                </span>
                <span className="fmtd__kpi-label">Daily Cap </span>
              </div>
            </div>
          </div>

          <div className="fmtd__kpi-tile">
            <div className="fmtd__kpi-tile-top">
              <div className="fmtd__kpi-icon fmtd__kpi-icon--purple">
                <BoxIcon />
              </div>
              <div className="fmtd__kpi-text">
                <span className="fmtd__kpi-num fmtd__kpi-num--purple">
                  {totalDailyAllocated}
                </span>
                <span className="fmtd__kpi-label">Daily Allocated</span>
              </div>
            </div>
          </div>

          <div className="fmtd__kpi-tile">
            <div className="fmtd__kpi-tile-top">
              <div className="fmtd__kpi-icon fmtd__kpi-icon--teal">
                <CheckIcon />
              </div>
              <div className="fmtd__kpi-text">
                <span className="fmtd__kpi-num fmtd__kpi-num--teal">
                  {totalHourlyAllocationToday}
                </span>
                <span className="fmtd__kpi-label">Hourly Allocation Total</span>
              </div>
            </div>
          </div>

          <div className="fmtd__kpi-tile">
            <div className="fmtd__kpi-tile-top">
              <div
                className={`fmtd__kpi-icon${isTodayOverAllocated ? ' fmtd__kpi-icon--danger' : ' fmtd__kpi-icon--orange'}`}
              >
                <GridIcon />
              </div>
              <div className="fmtd__kpi-text">
                <span
                  className={`fmtd__kpi-num${isTodayOverAllocated ? ' fmtd__kpi-num--danger' : ' fmtd__kpi-num--orange'}`}
                >
                  {isTodayOverAllocated ? 0 : totalRemainingToday}
                </span>
                <span className="fmtd__kpi-label">Remaining Allocation</span>
                {isTodayOverAllocated && (
                  <span className="fmtd__kpi-over">
                    +{Math.abs(totalRemainingToday)} over
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fmtd__panel-wrap">
        <div className="fmtd__panel">
          <div className="fmtd__toolbar">
            <div className="fmtd__date-nav">
              <button
                type="button"
                className="fmtd__date-pill"
                onClick={() => dateInputRef.current?.showPicker()}
                aria-label="Select date"
              >
                <span className="fmtd__cal-icon">📅</span>
                <span className="fmtd__date-label">
                  {formatDateDisplay(selectedDate)}
                </span>
                <span className="fmtd__chevron">▾</span>
              </button>
              <button
                type="button"
                className={`fmtd__today-btn${isToday ? ' fmtd__today-btn--active' : ''
                  }`}
                onClick={() => setSelectedDate(getTodayString())}
              >
                Today
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="fmtd__date-hidden"
                aria-label="Select date"
              />
            </div>
          </div>

          <div className="fmtd__legend-panel">
            <span className="fmtd__legend-panel-title">Legend</span>
            <div className="fmtd__legend-divider-v" />
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--available" />
              Available — click to allocate
            </span>
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--occupied" />
              Allocated — click to edit
            </span>
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--peak" />
              Peak Hour
            </span>
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--shoulder" />
              Shoulder Hour
            </span>
            <span className="fmtd__legend-note">
              Click any slot to allocate or edit movements
            </span>
          </div>
        </div>
      </div>

      <div className="fmtd__grid-area">
        <AllocationGrid
          companies={FMT_MOCK_COMPANIES}
          bookings={bookings}
          distributedCounts={distributedCountsByCompany}
          selectedDate={selectedDate}
          hourLimits={HOUR_LIMITS}
          hourTypes={dayConfig.hourTypes}
          showEarlyHours={showEarlyHours}
          showLateHours={showLateHours}
          onToggleEarlyHours={() => setShowEarlyHours((v) => !v)}
          onToggleLateHours={() => setShowLateHours((v) => !v)}
          onSlotClick={handleSlotClick}
          onViewHistory={handleViewHistory}
        />
      </div>

      <AllocationHistoryModal
        open={historyState.open}
        company={historyState.company}
        entries={historyEntries}
        onClose={handleHistoryClose}
      />

      <AllocationEditModal
        open={modalState.open}
        company={modalState.company}
        hour={modalState.hour}
        selectedDate={selectedDate}
        currentDistributed={modalCurrentDistributed}
        currentHourTotal={modalCurrentHourTotal}
        hourCapacity={HOUR_LIMITS[modalState.hour] ?? 0}
        totalSlotCapacity={totalSlotCapacityToday}
        existingBooking={modalState.existingBooking}
        onConfirm={handleConfirm}
        onClose={handleModalClose}
      />
    </div>
  );
}
