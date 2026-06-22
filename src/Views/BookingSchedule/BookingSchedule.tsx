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
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function buildInitialAllocations(): Map<SlotKey, Allocation> {
  const map = new Map<SlotKey, Allocation>();
  MOCK_ALLOCATIONS.forEach((a) => {
    map.set(buildSlotKey(a.companyId, a.date, a.hour), a);
  });
  return map;
}

let idCounter = MOCK_ALLOCATIONS.length + 1;

const LEGEND_ITEMS = [
  { label: 'Occupied', color: '#1a3a6b' },
  { label: 'Available', color: '#fff', border: '#dde2ec' },
  { label: 'Full', color: '#f2f4f7', border: '#ccc' },
];

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

  // ── Derived state ──────────────────────────────────────────
  const allocatedCountsByCompany = useMemo(() => {
    const counts = new Map<string, number>();
    allocations.forEach((a) => {
      if (a.date === selectedDate) {
        counts.set(a.companyId, (counts.get(a.companyId) ?? 0) + a.deliveryCount);
      }
    });
    return counts;
  }, [allocations, selectedDate]);

  const totalAllocatedToday = useMemo(() => {
    let sum = 0;
    allocatedCountsByCompany.forEach((v) => { sum += v; });
    return sum;
  }, [allocatedCountsByCompany]);

  const totalAssigned = MOCK_COMPANIES.reduce((s, c) => s + c.assignedDeliveries, 0);

  // ── Slot interactions ──────────────────────────────────────
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
      const newAllocation: Allocation = {
        id: `a${idCounter++}`,
        companyId: modalState.companyId,
        companyName: company.name,
        date: selectedDate,
        hour: modalState.hour,
        ...data,
        createdAt: new Date().toISOString(),
      };
      setAllocations((prev) => new Map(prev).set(key, newAllocation));
    }

    handleModalClose();
  }

  const modalCompany = MOCK_COMPANIES.find((c) => c.id === modalState.companyId) ?? null;
  const modalCurrentAllocated = allocatedCountsByCompany.get(modalState.companyId) ?? 0;

  return (
    <div className="bs">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bs__header">
        <div className="bs__title-block">
          <div className="bs__accent" />
          <div>
            <h1 className="bs__title">Full Schedule</h1>
            <p className="bs__subtitle">All time slots</p>
          </div>
        </div>

        <div className="bs__header-stats">
          <div className="bs__stat">
            <span className="bs__stat-val">{totalAllocatedToday}</span>
            <span className="bs__stat-label">Allocated</span>
          </div>
          <div className="bs__stat-sep" />
          <div className="bs__stat">
            <span className="bs__stat-val">{totalAssigned}</span>
            <span className="bs__stat-label">Total Assigned</span>
          </div>
        </div>
      </div>

      {/* ── Date control row ────────────────────────────────── */}
      <div className="bs__controls">
        <div className="bs__date-pill" onClick={() => dateInputRef.current?.showPicker()}>
          <span className="bs__date-icon">📅</span>
          <span className="bs__date-text">{formatDateDisplay(selectedDate)}</span>
          <span className="bs__chevron">▾</span>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bs__date-hidden"
            aria-label="Select schedule date"
          />
        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────── */}
      <div className="bs__legend">
        {LEGEND_ITEMS.map((item) => (
          <span key={item.label} className="bs__legend-item">
            <span
              className="bs__legend-dot"
              style={{
                background: item.color,
                border: item.border ? `1.5px solid ${item.border}` : undefined,
              }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {/* ── Grid ────────────────────────────────────────────── */}
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
