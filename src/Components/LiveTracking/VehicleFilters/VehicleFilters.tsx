import { Vehicle, LiveTrackingFilters } from '../../../types/liveTracking';
import './VehicleFilters.scss';

interface VehicleFiltersProps {
  vehicles: Vehicle[];
  filters: LiveTrackingFilters;
  onFilterChange: (key: keyof LiveTrackingFilters, value: string) => void;
  onReset: () => void;
  onRefresh: () => void;
}

export default function VehicleFilters({
  vehicles,
  filters,
  onFilterChange,
  onReset,
  onRefresh,
}: VehicleFiltersProps) {
  const activeVehicles = filters.status
    ? vehicles.filter(v => v.status === filters.status)
    : vehicles;

  return (
    <div className="lt-filters">
      <div className="lt-filters__grid">
        {/* Vehicle Selector */}
        <div className="lt-filters__field">
          <label htmlFor="filter-vehicle" className="lt-filters__label">
            Vehicle
          </label>
          <select
            id="filter-vehicle"
            className="lt-filters__select"
            value={filters.vehicleId}
            onChange={e => onFilterChange('vehicleId', e.target.value)}
          >
            <option value="">All Vehicles (Fleet Overview)</option>
            {activeVehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.id} - {v.name} ({v.type})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lt-filters__field">
          <label htmlFor="filter-status" className="lt-filters__label">
            Status
          </label>
          <select
            id="filter-status"
            className="lt-filters__select"
            value={filters.status}
            onChange={e => onFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Correct">Correct</option>
            <option value="Incorrect">Incorrect</option>
            <option value="Pending">Pending Validation</option>
          </select>
        </div>
      </div>

      <div className="lt-filters__actions">
        <button
          type="button"
          className="lt-filters__btn lt-filters__btn--refresh"
          onClick={onRefresh}
          title="Refresh Data"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Refresh
        </button>

        <button
          type="button"
          className="lt-filters__btn lt-filters__btn--reset"
          onClick={onReset}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
