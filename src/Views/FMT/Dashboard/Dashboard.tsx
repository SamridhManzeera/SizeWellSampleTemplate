import { useState, useMemo, useRef } from 'react';
import { useScheduleConfig } from '../../ScheduleConfig/ScheduleConfigContext';
import { FmtBooking, FmtModalState, FmtSlotKey } from './types';
import {
  FMT_MOCK_BOOKINGS,
  FMT_MOCK_COMPANIES,
  buildFmtSlotKey,
} from './mockData';
import FmtScheduleGrid, {
  TruckIcon,
  CalendarIcon,
} from './components/FmtScheduleGrid/FmtScheduleGrid';
import FmtAssignSlotModal from './components/FmtAssignSlotModal/FmtAssignSlotModal';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import './Dashboard.scss';

interface ConfirmData {
  movementCount: number;
  notes: string;
}

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

function buildInitialBookings(): Map<FmtSlotKey, FmtBooking> {
  const map = new Map<FmtSlotKey, FmtBooking>();
  FMT_MOCK_BOOKINGS.forEach((b) => {
    map.set(buildFmtSlotKey(b.companyId, b.date, b.hour), b);
  });
  return map;
}

let idCounter = FMT_MOCK_BOOKINGS.length + 1;

function BoxIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 7l-8-4-8 4v10l8 4 8-4V7zm-8 1.5L17.5 11 12 13.5 6.5 11 12 8.5zM5 12.18l6 3v4.32l-6-3v-4.32zm8 7.32v-4.32l6-3v4.32l-6 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
    </svg>
  );
}

export default function FmtDashboard() {
  const { getConfigForDate } = useScheduleConfig();

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showEarlyHours, setShowEarlyHours] = useState(false);
  const [showLateHours, setShowLateHours] = useState(false);
  const dayConfig = getConfigForDate(selectedDate);
  const TOTAL_SLOT_CAPACITY = dayConfig.totalCapacity;
  const HOUR_LIMITS = dayConfig.hourLimits;

  const [bookings, setBookings] =
    useState<Map<FmtSlotKey, FmtBooking>>(buildInitialBookings);
  const [modalState, setModalState] = useState<FmtModalState>({
    open: false,
    mode: 'create',
    companyId: '',
    hour: 0,
  });

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Booked = reported by the booking API (mock data) — independent of what has been distributed to hours
  const bookedCountsByCompany = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach((b) => {
      if (b.date === selectedDate) {
        counts.set(b.companyId, (counts.get(b.companyId) ?? 0) + b.bookedCount);
      }
    });
    return counts;
  }, [bookings, selectedDate]);

  // Distributed = sum of movementCount already assigned to hours from the company's Allocated capacity
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

  const totalAllocated = FMT_MOCK_COMPANIES.reduce(
    (s, c) => s + c.allocatedCapacity,
    0
  );
  const totalBookedToday = useMemo(() => {
    let sum = 0;
    bookedCountsByCompany.forEach((v) => {
      sum += v;
    });
    return sum;
  }, [bookedCountsByCompany]);
  const totalRemainingToday = totalAllocated - totalBookedToday;
  // const bookedPct =
  //   totalAllocated > 0
  //     ? Math.round((totalBookedToday / totalAllocated) * 100)
  //     : 0;
  // const remainingPct =
  //   totalAllocated > 0
  //     ? Math.round((totalRemainingToday / totalAllocated) * 100)
  //     : 0;

  const isToday = selectedDate === getTodayString();

  function handleAvailableSlotClick(companyId: string, hour: number) {
    setModalState({ open: true, mode: 'create', companyId, hour });
  }

  function handleOccupiedSlotClick(booking: FmtBooking) {
    setModalState({
      open: true,
      mode: 'edit',
      companyId: booking.companyId,
      hour: booking.hour,
      existingBooking: booking,
    });
  }

  function handleModalClose() {
    setModalState((prev) => ({ ...prev, open: false }));
  }

  function handleConfirm(data: ConfirmData) {
    const company = FMT_MOCK_COMPANIES.find(
      (c) => c.id === modalState.companyId
    );
    if (!company) return;
    const key = buildFmtSlotKey(
      modalState.companyId,
      selectedDate,
      modalState.hour
    );

    if (modalState.mode === 'edit' && modalState.existingBooking) {
      setBookings((prev) =>
        new Map(prev).set(key, {
          ...modalState.existingBooking!,
          movementCount: data.movementCount,
          notes: data.notes,
          // bookedCount is API-sourced and left untouched here
        })
      );
    } else {
      setBookings((prev) =>
        new Map(prev).set(key, {
          id: `f-b${idCounter++}`,
          companyId: modalState.companyId,
          companyName: company.name,
          date: selectedDate,
          hour: modalState.hour,
          movementCount: data.movementCount,
          bookedCount: 0,
          notes: data.notes,
          createdAt: new Date().toISOString(),
        })
      );
    }
    handleModalClose();
  }

  const modalCompany =
    FMT_MOCK_COMPANIES.find((c) => c.id === modalState.companyId) ?? null;
  const modalCurrentDistributed =
    distributedCountsByCompany.get(modalState.companyId) ?? 0;

  const modalCurrentHourTotal = useMemo(() => {
    let sum = 0;
    FMT_MOCK_COMPANIES.forEach((c) => {
      const b = bookings.get(
        buildFmtSlotKey(c.id, selectedDate, modalState.hour)
      );
      if (b) {
        const skip =
          modalState.mode === 'edit' && c.id === modalState.companyId;
        if (!skip) sum += b.movementCount;
      }
    });
    return sum;
  }, [
    bookings,
    selectedDate,
    modalState.hour,
    modalState.mode,
    modalState.companyId,
  ]);

  return (
    <div className="fmtd">
      <PageHeader />

      <PageHero
        icon={<TruckIcon />}
        eyebrow="FMT"
        title="Delivery Distribution"
        subtitle=""
        actions={null}
      />

      <div className="fmtd__header">
        <div className="fmtd__kpi-row">
          <div className="fmtd__kpi-tile">
            <div className="fmtd__kpi-tile-top">
              <div className="fmtd__kpi-icon fmtd__kpi-icon--purple">
                <BoxIcon />
              </div>
              <div className="fmtd__kpi-text">
                <span className="fmtd__kpi-num fmtd__kpi-num--purple">
                  {totalAllocated}
                </span>
                <span className="fmtd__kpi-label">Allocated</span>
              </div>
            </div>
            {/* <p className="fmtd__kpi-caption">
              Total capacity across all companies
            </p> */}
          </div>

          <div className="fmtd__kpi-tile">
            <div className="fmtd__kpi-tile-top">
              <div className="fmtd__kpi-icon fmtd__kpi-icon--teal">
                <CheckIcon />
              </div>
              <div className="fmtd__kpi-text">
                <span className="fmtd__kpi-num fmtd__kpi-num--teal">
                  {totalBookedToday}
                </span>
                <span className="fmtd__kpi-label">Booked</span>
              </div>
            </div>
            {/* <p className="fmtd__kpi-caption">
              {bookedPct}% of allocated capacity
            </p> */}
          </div>

          <div className="fmtd__kpi-tile">
            <div className="fmtd__kpi-tile-top">
              <div className="fmtd__kpi-icon fmtd__kpi-icon--orange">
                <GridIcon />
              </div>
              <div className="fmtd__kpi-text">
                <span className="fmtd__kpi-num fmtd__kpi-num--orange">
                  {totalRemainingToday}
                </span>
                <span className="fmtd__kpi-label">Remaining</span>
              </div>
            </div>
            {/* <p className="fmtd__kpi-caption">
              {remainingPct}% of allocated capacity
            </p> */}
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
                className={`fmtd__today-btn${
                  isToday ? ' fmtd__today-btn--active' : ''
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
              <span className="fmtd__legend-swatch fmtd__legend-swatch--alloc">
                <TruckIcon />
              </span>
              Allocated
            </span>
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-swatch fmtd__legend-swatch--booked">
                <CalendarIcon />
              </span>
              Booked
            </span>
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--available" />
              Available
            </span>
            <span className="fmtd__legend-note">
              Every slot on this board represents a single movement
            </span>
          </div>
        </div>
      </div>

      <div className="fmtd__grid-area">
        <FmtScheduleGrid
          companies={FMT_MOCK_COMPANIES}
          bookings={bookings}
          distributedCounts={distributedCountsByCompany}
          bookedCounts={bookedCountsByCompany}
          selectedDate={selectedDate}
          hourLimits={HOUR_LIMITS}
          showEarlyHours={showEarlyHours}
          showLateHours={showLateHours}
          onToggleEarlyHours={() => setShowEarlyHours((v) => !v)}
          onToggleLateHours={() => setShowLateHours((v) => !v)}
          onAvailableSlotClick={handleAvailableSlotClick}
          onOccupiedSlotClick={handleOccupiedSlotClick}
        />
      </div>

      <FmtAssignSlotModal
        open={modalState.open}
        mode={modalState.mode}
        hour={modalState.hour}
        selectedDate={selectedDate}
        company={modalCompany}
        currentDistributed={modalCurrentDistributed}
        currentHourTotal={modalCurrentHourTotal}
        hourCapacity={HOUR_LIMITS[modalState.hour] ?? 0}
        totalSlotCapacity={TOTAL_SLOT_CAPACITY}
        existingBooking={modalState.existingBooking}
        onConfirm={handleConfirm}
        onClose={handleModalClose}
      />
    </div>
  );
}
