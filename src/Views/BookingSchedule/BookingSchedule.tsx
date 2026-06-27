import { useState, useMemo, useRef } from 'react';
import { useScheduleConfig } from '../ScheduleConfig/ScheduleConfigContext';
import { Allocation, DrawerState, ModalState, SlotKey } from './types';

interface ConfirmData {
  totalCount: number;
  notes: string;
}
import { MOCK_ALLOCATIONS, MOCK_COMPANIES, buildSlotKey } from './mockData';
import ScheduleGrid from './components/ScheduleGrid/ScheduleGrid';
import AllocationModal from './components/AllocationModal/AllocationModal';
import DetailDrawer from './components/DetailDrawer/DetailDrawer';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import './BookingSchedule.scss';

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

function buildInitialAllocations(): Map<SlotKey, Allocation> {
  const map = new Map<SlotKey, Allocation>();
  MOCK_ALLOCATIONS.forEach((a) => {
    map.set(buildSlotKey(a.companyId, a.date, a.hour), a);
  });
  return map;
}


let idCounter = MOCK_ALLOCATIONS.length + 1;

function PeopleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
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

export default function BookingSchedule() {
  const { getConfigForDate } = useScheduleConfig();

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [viewMode, setViewMode] = useState<'allocated' | 'booked'>('allocated');

  const dayConfig = getConfigForDate(selectedDate);
  const TOTAL_SLOT_CAPACITY    = dayConfig.totalCapacity;
  const HOUR_LIMITS            = dayConfig.hourLimits;
  const [allocations, setAllocations] = useState<Map<SlotKey, Allocation>>(buildInitialAllocations);
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    mode: 'create',
    companyId: '',
    hour: 0,
  });
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    allocation: null,
  });

  const dateInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ────────────────────────────────────────────────
  const allocatedCountsByCompany = useMemo(() => {
    const counts = new Map<string, number>();
    allocations.forEach((a) => {
      if (a.date === selectedDate) {
        const total = a.inboundCount + a.outboundCount + a.twoWayCount * 2;
        counts.set(a.companyId, (counts.get(a.companyId) ?? 0) + total);
      }
    });
    return counts;
  }, [allocations, selectedDate]);

  const bookedCountsByCompany = useMemo(() => {
    const counts = new Map<string, number>();
    allocations.forEach((a) => {
      if (a.date === selectedDate) {
        counts.set(a.companyId, (counts.get(a.companyId) ?? 0) + a.bookedCount);
      }
    });
    return counts;
  }, [allocations, selectedDate]);

  const totalAllocatedToday = useMemo(() => {
    let sum = 0;
    allocatedCountsByCompany.forEach((v) => { sum += v; });
    return sum;
  }, [allocatedCountsByCompany]);

  const totalBookedToday = useMemo(() => {
    let sum = 0;
    bookedCountsByCompany.forEach((v) => { sum += v; });
    return sum;
  }, [bookedCountsByCompany]);

  const totalAssigned = MOCK_COMPANIES.reduce((s, c) => s + c.assignedDeliveries, 0);
  const availableSlots = TOTAL_SLOT_CAPACITY - totalAllocatedToday;

  const isToday = selectedDate === getTodayString();

  // ── Handlers ──────────────────────────────────────────────
  function handleAvailableSlotClick(companyId: string, hour: number) {
    setModalState({ open: true, mode: 'create', companyId, hour });
  }

  function handleOccupiedSlotClick(allocation: Allocation) {
    setDrawerState({ open: true, allocation });
  }

  function handleEditFromDrawer(allocation: Allocation) {
    setDrawerState({ open: false, allocation: null });
    setModalState({
      open: true,
      mode: 'edit',
      companyId: allocation.companyId,
      hour: allocation.hour,
      existingAllocation: allocation,
    });
  }

  function handleModalClose() {
    setModalState((prev) => ({ ...prev, open: false }));
  }

  function handleDrawerClose() {
    setDrawerState({ open: false, allocation: null });
  }

  function handleAllocationConfirm(data: ConfirmData) {
    const company = MOCK_COMPANIES.find((c) => c.id === modalState.companyId);
    if (!company) return;
    const key = buildSlotKey(modalState.companyId, selectedDate, modalState.hour);

    if (modalState.mode === 'edit' && modalState.existingAllocation) {
      setAllocations((prev) =>
        new Map(prev).set(key, {
          ...modalState.existingAllocation!,
          inboundCount:  data.totalCount,
          outboundCount: 0,
          twoWayCount:   0,
          bookedCount:   Math.min(modalState.existingAllocation!.bookedCount, data.totalCount),
          notes:         data.notes,
        })
      );
    } else {
      setAllocations((prev) =>
        new Map(prev).set(key, {
          id:            `a${idCounter++}`,
          companyId:     modalState.companyId,
          companyName:   company.name,
          date:          selectedDate,
          hour:          modalState.hour,
          inboundCount:  data.totalCount,
          outboundCount: 0,
          twoWayCount:   0,
          bookedCount:   data.totalCount,
          notes:         data.notes,
          createdAt:     new Date().toISOString(),
        })
      );
    }
    handleModalClose();
  }

  const modalCompany = MOCK_COMPANIES.find((c) => c.id === modalState.companyId) ?? null;
  const modalCurrentAllocated = allocatedCountsByCompany.get(modalState.companyId) ?? 0;

  const modalCurrentHourTotal = useMemo(() => {
    let sum = 0;
    MOCK_COMPANIES.forEach((c) => {
      const a = allocations.get(buildSlotKey(c.id, selectedDate, modalState.hour));
      if (a) {
        const skip = modalState.mode === 'edit' && c.id === modalState.companyId;
        if (!skip) sum += a.inboundCount + a.outboundCount + a.twoWayCount * 2;
      }
    });
    return sum;
  }, [allocations, selectedDate, modalState.hour, modalState.mode, modalState.companyId]);

  return (
    <div className="bs">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <PageHeader />

      {/* ── Page title + KPI row ──────────────────────────────── */}
      <div className="bs__header">
        <div className="bs__title-block">
          <div className="bs__title-text">
            <h1 className="bs__title">Full Schedule</h1>
            <p className="bs__subtitle">All time slots overview</p>
          </div>
        </div>
        <div className="bs__kpi-row">
          {/* Total Slot */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-main">
              <div className="bs__kpi-icon bs__kpi-icon--purple"><BoxIcon /></div>
              <div className="bs__kpi-center">
                <span className="bs__kpi-num bs__kpi-num--purple">{TOTAL_SLOT_CAPACITY}</span>
                <span className="bs__kpi-label">Total Slot</span>
              </div>
            </div>
          </div>
          {/* Allocated */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-main">
              <div className="bs__kpi-icon bs__kpi-icon--blue"><PeopleIcon /></div>
              <div className="bs__kpi-center">
                <span className="bs__kpi-num bs__kpi-num--navy">{totalAllocatedToday}</span>
                <span className="bs__kpi-label">Allocated</span>
              </div>
            </div>
          </div>
          {/* Booked Slot */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-main">
              <div className="bs__kpi-icon bs__kpi-icon--teal"><CheckIcon /></div>
              <div className="bs__kpi-center">
                <span className="bs__kpi-num bs__kpi-num--teal">{totalBookedToday}</span>
                <span className="bs__kpi-label">Booked Slot</span>
              </div>
            </div>
          </div>
          {/* Requested */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-main">
              <div className="bs__kpi-icon bs__kpi-icon--green"><PeopleIcon /></div>
              <div className="bs__kpi-center">
                <span className="bs__kpi-num bs__kpi-num--green">{totalAssigned}</span>
                <span className="bs__kpi-label">Requested</span>
              </div>
            </div>
          </div>
          {/* Available */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-main">
              <div className="bs__kpi-icon bs__kpi-icon--orange"><GridIcon /></div>
              <div className="bs__kpi-center">
                <span className="bs__kpi-num bs__kpi-num--orange">{availableSlots}</span>
                <span className="bs__kpi-label">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="bs__toolbar">
        {/* Date navigation */}
        <div className="bs__date-nav">
          <button
            type="button"
            className="bs__date-pill"
            onClick={() => dateInputRef.current?.showPicker()}
            aria-label="Select date"
          >
            <span className="bs__cal-icon">📅</span>
            <span className="bs__date-label">{formatDateDisplay(selectedDate)}</span>
            <span className="bs__chevron">▾</span>
          </button>
          <button
            type="button"
            className={`bs__today-btn${isToday ? ' bs__today-btn--active' : ''}`}
            onClick={() => setSelectedDate(getTodayString())}
          >
            Today
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bs__date-hidden"
            aria-label="Select date"
          />
        </div>

        {/* View toggle */}
        <div className="bs__toolbar-right">
          <div className="bs__view-toggle">
            <button
              type="button"
              className={`bs__view-btn${viewMode === 'allocated' ? ' bs__view-btn--active' : ''}`}
              onClick={() => setViewMode('allocated')}
            >
              Allocated
            </button>
            <button
              type="button"
              className={`bs__view-btn${viewMode === 'booked' ? ' bs__view-btn--active' : ''}`}
              onClick={() => setViewMode('booked')}
            >
              Booked
            </button>
          </div>
        </div>
      </div>

      {/* ── Legend panel ──────────────────────────────────────── */}
      <div className="bs__legend-panel">
        <span className="bs__legend-panel-title">Legend</span>
        <div className="bs__legend-divider-v" />
        <span className="bs__legend-item">
          <span className="bs__legend-dot bs__legend-dot--occupied" />
          {viewMode === 'booked' ? 'Booked' : 'Allocated'}
        </span>
        <span className="bs__legend-item">
          <span className="bs__legend-dot bs__legend-dot--available" />
          Available
        </span>
        <div className="bs__legend-divider-v" />
        <span className="bs__legend-item">
          <span className="bs__legend-swatch bs__legend-swatch--in">↑</span>
          Inbound
        </span>
        <span className="bs__legend-item">
          <span className="bs__legend-swatch bs__legend-swatch--out">↓</span>
          Outbound
        </span>
        <span className="bs__legend-item">
          <span className="bs__legend-swatch bs__legend-swatch--tw">↕</span>
          Two Way
        </span>
      </div>

      {/* ── Grid ──────────────────────────────────────────────── */}
      <div className="bs__grid-area">
        <ScheduleGrid
          companies={MOCK_COMPANIES}
          allocations={allocations}
          allocatedCounts={allocatedCountsByCompany}
          bookedCounts={bookedCountsByCompany}
          viewMode={viewMode}
          selectedDate={selectedDate}
          hourLimits={HOUR_LIMITS}
          onAvailableSlotClick={handleAvailableSlotClick}
          onOccupiedSlotClick={handleOccupiedSlotClick}
        />
      </div>

      <AllocationModal
        open={modalState.open}
        mode={modalState.mode}
        hour={modalState.hour}
        selectedDate={selectedDate}
        company={modalCompany}
        currentAllocated={modalCurrentAllocated}
        currentHourTotal={modalCurrentHourTotal}
        hourCapacity={HOUR_LIMITS[modalState.hour] ?? 0}
        totalSlotCapacity={TOTAL_SLOT_CAPACITY}
        existingAllocation={modalState.existingAllocation}
        onConfirm={handleAllocationConfirm}
        onClose={handleModalClose}
      />
      <DetailDrawer
        open={drawerState.open}
        allocation={drawerState.allocation}
        onClose={handleDrawerClose}
        onEdit={handleEditFromDrawer}
      />
    </div>
  );
}
