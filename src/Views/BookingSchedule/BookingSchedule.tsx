import { useState, useMemo, useRef } from 'react';
import { Allocation, DrawerState, ModalState, SlotKey } from './types';
import { MOCK_ALLOCATIONS, MOCK_COMPANIES, buildSlotKey } from './mockData';
import ScheduleGrid from './components/ScheduleGrid/ScheduleGrid';
import AllocationModal from './components/AllocationModal/AllocationModal';
import DetailDrawer from './components/DetailDrawer/DetailDrawer';
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

export default function BookingSchedule() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
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
      if (a.date === selectedDate)
        counts.set(a.companyId, (counts.get(a.companyId) ?? 0) + a.deliveryCount);
    });
    return counts;
  }, [allocations, selectedDate]);

  const totalAllocatedToday = useMemo(() => {
    let sum = 0;
    allocatedCountsByCompany.forEach((v) => { sum += v; });
    return sum;
  }, [allocatedCountsByCompany]);

  const totalAssigned = MOCK_COMPANIES.reduce((s, c) => s + c.assignedDeliveries, 0);

  const availableSlots = totalAssigned - totalAllocatedToday;

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

  function handleAllocationConfirm(data: {
    deliveryCount: number;
    notes: string;
    driverName: string;
    vehicleNumber: string;
  }) {
    const company = MOCK_COMPANIES.find((c) => c.id === modalState.companyId);
    if (!company) return;
    const key = buildSlotKey(modalState.companyId, selectedDate, modalState.hour);

    if (modalState.mode === 'edit' && modalState.existingAllocation) {
      setAllocations((prev) =>
        new Map(prev).set(key, { ...modalState.existingAllocation!, ...data })
      );
    } else {
      setAllocations((prev) =>
        new Map(prev).set(key, {
          id: `a${idCounter++}`,
          companyId: modalState.companyId,
          companyName: company.name,
          date: selectedDate,
          hour: modalState.hour,
          ...data,
          createdAt: new Date().toISOString(),
        })
      );
    }
    handleModalClose();
  }

  const modalCompany = MOCK_COMPANIES.find((c) => c.id === modalState.companyId) ?? null;
  const modalCurrentAllocated = allocatedCountsByCompany.get(modalState.companyId) ?? 0;

  return (
    <div className="bs">
      {/* ── Page header ───────────────────────────────────────── */}
      <div className="bs__header">
        <div className="bs__title-block">
          <h1 className="bs__title">Full Schedule</h1>
          <p className="bs__subtitle">All time slots overview</p>
        </div>

        <div className="bs__kpi-row">
          {/* Allocated card */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-icon bs__kpi-icon--blue">
              <PeopleIcon />
            </div>
            <div className="bs__kpi-info">
              <span className="bs__kpi-num bs__kpi-num--navy">{totalAllocatedToday}</span>
              <span className="bs__kpi-label">Allocated</span>
            </div>
          </div>
          {/* Total Assigned card */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-icon bs__kpi-icon--green">
              <PeopleIcon />
            </div>
            <div className="bs__kpi-info">
              <span className="bs__kpi-num bs__kpi-num--green">{totalAssigned}</span>
              <span className="bs__kpi-label">Total Requested</span>
            </div>
          </div>
          {/* Available Slots card */}
          <div className="bs__kpi-card">
            <div className="bs__kpi-icon bs__kpi-icon--orange">
              <GridIcon />
            </div>
            <div className="bs__kpi-info">
              <span className="bs__kpi-num bs__kpi-num--orange">{availableSlots}</span>
              <span className="bs__kpi-label">Available</span>
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

        {/* Legend */}
        <div className="bs__legend">
          <span className="bs__legend-item">
            <span className="bs__legend-dot bs__legend-dot--occupied" />
            Occupied
          </span>
          <span className="bs__legend-item">
            <span className="bs__legend-dot bs__legend-dot--available" />
            Available
          </span>
          <span className="bs__legend-item">
            <span className="bs__legend-dot bs__legend-dot--full" />
            Full
          </span>
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────── */}
      <div className="bs__grid-area">
        <ScheduleGrid
          companies={MOCK_COMPANIES}
          allocations={allocations}
          allocatedCounts={allocatedCountsByCompany}
          selectedDate={selectedDate}
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
