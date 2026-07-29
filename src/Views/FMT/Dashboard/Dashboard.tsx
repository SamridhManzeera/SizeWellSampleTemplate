import { useState, useMemo, useRef } from 'react';
import { useScheduleConfig } from '../../ScheduleConfig/ScheduleConfigContext';
import { FmtBooking } from '../types';
import { FMT_MOCK_COMPANIES } from '../mockData';
import { useFmtBookings } from '../FmtBookingsContext';
import FmtScheduleGrid, {
  TruckIcon,
  CalendarIcon,
} from './components/FmtScheduleGrid/FmtScheduleGrid';
import FmtBookingViewModal from './components/FmtBookingViewModal/FmtBookingViewModal';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import './Dashboard.scss';

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

function CapacityIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h4v4H7v-4z" />
    </svg>
  );
}

export default function FmtDashboard() {
  const { getConfigForDate } = useScheduleConfig();
  const { bookings } = useFmtBookings();

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showEarlyHours, setShowEarlyHours] = useState(false);
  const [showLateHours, setShowLateHours] = useState(false);
  const dayConfig = getConfigForDate(selectedDate);
  const HOUR_LIMITS = dayConfig.hourLimits;
  const totalSlotCapacityToday = dayConfig.totalCapacity;

  const [viewBooking, setViewBooking] = useState<FmtBooking | null>(null);

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

  // Breakdown of Booked totals per company (for the Booked stat column)
  const bookedBreakdownByCompany = useMemo(() => {
    const breakdown = new Map<
      string,
      { inbound: number; outbound: number; twoWay: number }
    >();
    bookings.forEach((b) => {
      if (b.date !== selectedDate) return;
      const prev = breakdown.get(b.companyId) ?? {
        inbound: 0,
        outbound: 0,
        twoWay: 0,
      };
      breakdown.set(b.companyId, {
        inbound: prev.inbound + b.inbound,
        outbound: prev.outbound + b.outbound,
        twoWay: prev.twoWay + b.twoWay,
      });
    });
    return breakdown;
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
  const isTodayOverAllocated = totalRemainingToday < 0;
  // const bookedPct =
  //   totalAllocated > 0
  //     ? Math.round((totalBookedToday / totalAllocated) * 100)
  //     : 0;
  // const remainingPct =
  //   totalAllocated > 0
  //     ? Math.round((totalRemainingToday / totalAllocated) * 100)
  //     : 0;

  const isToday = selectedDate === getTodayString();

  function handleViewBooking(booking: FmtBooking) {
    setViewBooking(booking);
  }

  function handleCloseView() {
    setViewBooking(null);
  }

  const viewCompany = viewBooking
    ? FMT_MOCK_COMPANIES.find((c) => c.id === viewBooking.companyId) ?? null
    : null;

  return (
    <div className="fmtd">
      <PageHeader />

      <PageHero
        icon={<TruckIcon />}
        eyebrow="FMT"
        title="Bookings Dashboard"
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
                  {totalAllocated}
                </span>
                <span className="fmtd__kpi-label">Allocated Slots</span>
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
                <span className="fmtd__kpi-label">Booked Slots</span>
              </div>
            </div>
            {/* <p className="fmtd__kpi-caption">
              {bookedPct}% of allocated capacity
            </p> */}
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
                <span className="fmtd__kpi-label">Available Slots </span>
                {isTodayOverAllocated && (
                  <span className="fmtd__kpi-over">
                    +{Math.abs(totalRemainingToday)} over
                  </span>
                )}
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
              <span className="fmtd__legend-dot fmtd__legend-dot--constrained" />
              Shoulder / Peak Hour
            </span>
            <div className="fmtd__legend-divider-v" />
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--twoway" />
              Two-way
            </span>
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--inbound" />
              Inbound
            </span>
            <span className="fmtd__legend-item">
              <span className="fmtd__legend-dot fmtd__legend-dot--outbound" />
              Outbound
            </span>
            <span className="fmtd__legend-note">
              click a booked slot for details
            </span>
          </div>
        </div>
      </div>

      <div className="fmtd__grid-area">
        <FmtScheduleGrid
          companies={FMT_MOCK_COMPANIES}
          bookings={bookings}
          bookedCounts={bookedCountsByCompany}
          bookedBreakdown={bookedBreakdownByCompany}
          selectedDate={selectedDate}
          hourLimits={HOUR_LIMITS}
          hourTypes={dayConfig.hourTypes}
          showEarlyHours={showEarlyHours}
          showLateHours={showLateHours}
          onToggleEarlyHours={() => setShowEarlyHours((v) => !v)}
          onToggleLateHours={() => setShowLateHours((v) => !v)}
          onViewBooking={handleViewBooking}
        />
      </div>

      <FmtBookingViewModal
        open={viewBooking !== null}
        booking={viewBooking}
        company={viewCompany}
        onClose={handleCloseView}
      />
    </div>
  );
}
