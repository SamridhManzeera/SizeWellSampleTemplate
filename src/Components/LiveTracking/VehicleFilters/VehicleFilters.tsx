import { LiveTrackingFilters } from '../../../types/liveTracking';
import './VehicleFilters.scss';

interface VehicleFiltersProps {
  mode: 'live' | 'history';
  filters: LiveTrackingFilters;
  onFilterChange: (key: keyof LiveTrackingFilters, value: string) => void;
  onReset: () => void;
  onRefresh: () => void;
}

export default function VehicleFilters({
  mode,
  filters,
  onFilterChange,
  onReset,
  onRefresh,
}: VehicleFiltersProps) {
  // Date From split
  const dateFromDate = filters.dateFrom ? filters.dateFrom.split('T')[0] : '';
  const dateFromTime = filters.dateFrom && filters.dateFrom.includes('T') ? filters.dateFrom.split('T')[1] : '';

  // Date To split
  const dateToDate = filters.dateTo ? filters.dateTo.split('T')[0] : '';
  const dateToTime = filters.dateTo && filters.dateTo.includes('T') ? filters.dateTo.split('T')[1] : '';

  const handleDateFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    if (!d) {
      onFilterChange('dateFrom', '');
    } else {
      const t = dateFromTime || '00:00';
      onFilterChange('dateFrom', `${d}T${t}`);
    }
  };

  const handleDateFromTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    const d = dateFromDate || new Date().toISOString().split('T')[0];
    onFilterChange('dateFrom', `${d}T${t}`);
  };

  const handleDateToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    if (!d) {
      onFilterChange('dateTo', '');
    } else {
      const t = dateToTime || '23:59';
      onFilterChange('dateTo', `${d}T${t}`);
    }
  };

  const handleDateToTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    const d = dateToDate || new Date().toISOString().split('T')[0];
    onFilterChange('dateTo', `${d}T${t}`);
  };

  return (
    <div className="lt-filters">
      <div className="lt-filters__grid">
        {mode === 'live' ? (
          <>
            {/* Booking ID Input */}
            <div className="lt-filters__field">
              <label htmlFor="filter-booking-id" className="lt-filters__label">
                Booking ID
              </label>
              <input
                type="text"
                id="filter-booking-id"
                className="lt-filters__input"
                placeholder="Search.."
                value={filters.bookingId || ''}
                onChange={e => onFilterChange('bookingId', e.target.value)}
              />
            </div>

            {/* CO3 / App */}
            <div className="lt-filters__field">
              <label htmlFor="filter-co3-app" className="lt-filters__label">
                CO3 / App
              </label>
              <select
                id="filter-co3-app"
                className="lt-filters__select"
                value={filters.co3App || ''}
                onChange={e => onFilterChange('co3App', e.target.value)}
              >
                <option value="">Select</option>
                <option value="CO3">CO3</option>
                <option value="App">App</option>
              </select>
            </div>

            {/* Haulier */}
            <div className="lt-filters__field">
              <label htmlFor="filter-haulier" className="lt-filters__label">
                Haulier
              </label>
              <select
                id="filter-haulier"
                className="lt-filters__select"
                value={filters.haulier || ''}
                onChange={e => onFilterChange('haulier', e.target.value)}
              >
                <option value="">Select</option>
                <option value="ACME Logistics">ACME Logistics</option>
                <option value="Suffolk Haulage">Suffolk Haulage</option>
                <option value="Orwell Transport">Orwell Transport</option>
                <option value="IPS Logistics">IPS Logistics</option>
              </select>
            </div>

            {/* Contractor */}
            <div className="lt-filters__field">
              <label htmlFor="filter-contractor" className="lt-filters__label">
                Contractor
              </label>
              <select
                id="filter-contractor"
                className="lt-filters__select"
                value={filters.contractor || ''}
                onChange={e => onFilterChange('contractor', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Contractor A">Contractor A</option>
                <option value="Contractor B">Contractor B</option>
                <option value="Contractor C">Contractor C</option>
                <option value="Contractor D">Contractor D</option>
              </select>
            </div>

            {/* Booking Type */}
            <div className="lt-filters__field">
              <label htmlFor="filter-booking-type" className="lt-filters__label">
                Booking Type
              </label>
              <select
                id="filter-booking-type"
                className="lt-filters__select"
                value={filters.bookingType || ''}
                onChange={e => onFilterChange('bookingType', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Time Period */}
            <div className="lt-filters__field">
              <label htmlFor="filter-time-period" className="lt-filters__label">
                Time Period
              </label>
              <select
                id="filter-time-period"
                className="lt-filters__select"
                value={filters.timePeriod || ''}
                onChange={e => onFilterChange('timePeriod', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            {/* North / South */}
            <div className="lt-filters__field">
              <label htmlFor="filter-north-south" className="lt-filters__label">
                North / South
              </label>
              <select
                id="filter-north-south"
                className="lt-filters__select"
                value={filters.northSouth || ''}
                onChange={e => onFilterChange('northSouth', e.target.value)}
              >
                <option value="">Select</option>
                <option value="North">North Corridor</option>
                <option value="South">South Corridor</option>
              </select>
            </div>

            {/* Vehicle Reg Input */}
            <div className="lt-filters__field">
              <label htmlFor="filter-vehicle-reg" className="lt-filters__label">
                Vehicle Reg
              </label>
              <input
                type="text"
                id="filter-vehicle-reg"
                className="lt-filters__input"
                placeholder="Search.."
                value={filters.vehicleReg || ''}
                onChange={e => onFilterChange('vehicleReg', e.target.value)}
              />
            </div>

            {/* Exception Filter */}
            <div className="lt-filters__field">
              <label htmlFor="filter-exception" className="lt-filters__label">
                Exception
              </label>
              <select
                id="filter-exception"
                className="lt-filters__select"
                value={filters.exception || ''}
                onChange={e => onFilterChange('exception', e.target.value)}
              >
                <option value="">All Exceptions</option>
                <option value="applied">Applied</option>
                <option value="notApplied">Not Applied</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Booking ID Input */}
            <div className="lt-filters__field">
              <label htmlFor="filter-booking-id" className="lt-filters__label">
                Booking ID
              </label>
              <input
                type="text"
                id="filter-booking-id"
                className="lt-filters__input"
                placeholder="Search.."
                value={filters.bookingId || ''}
                onChange={e => onFilterChange('bookingId', e.target.value)}
              />
            </div>

            {/* Vehicle Reg Input */}
            <div className="lt-filters__field">
              <label htmlFor="filter-vehicle-reg" className="lt-filters__label">
                Vehicle Reg.
              </label>
              <input
                type="text"
                id="filter-vehicle-reg"
                className="lt-filters__input"
                placeholder="Search Reg.."
                value={filters.vehicleReg || ''}
                onChange={e => onFilterChange('vehicleReg', e.target.value)}
              />
            </div>

            {/* Date Range: Date From */}
            <div className="lt-filters__field" style={{ minWidth: '220px' }}>
              <label className="lt-filters__label">
                Date From
              </label>
              <div className="lt-filters__datetime-inputs">
                <input
                  type="date"
                  className="lt-filters__input lt-filters__input--date"
                  value={dateFromDate}
                  onChange={handleDateFromDateChange}
                />
                <input
                  type="time"
                  className="lt-filters__input lt-filters__input--time"
                  value={dateFromTime || '00:00'}
                  onChange={handleDateFromTimeChange}
                />
              </div>
            </div>

            {/* Date Range: Date To */}
            <div className="lt-filters__field" style={{ minWidth: '220px' }}>
              <label className="lt-filters__label">
                Date To
              </label>
              <div className="lt-filters__datetime-inputs">
                <input
                  type="date"
                  className="lt-filters__input lt-filters__input--date"
                  value={dateToDate}
                  onChange={handleDateToDateChange}
                />
                <input
                  type="time"
                  className="lt-filters__input lt-filters__input--time"
                  value={dateToTime || '00:00'}
                  onChange={handleDateToTimeChange}
                />
              </div>
            </div>

            {/* Contractor */}
            <div className="lt-filters__field">
              <label htmlFor="filter-contractor" className="lt-filters__label">
                Contractor
              </label>
              <select
                id="filter-contractor"
                className="lt-filters__select"
                value={filters.contractor || ''}
                onChange={e => onFilterChange('contractor', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Contractor A">Contractor A</option>
                <option value="Contractor B">Contractor B</option>
                <option value="Contractor C">Contractor C</option>
                <option value="Contractor D">Contractor D</option>
              </select>
            </div>

            {/* Route */}
            <div className="lt-filters__field">
              <label htmlFor="filter-route" className="lt-filters__label">
                Route
              </label>
              <select
                id="filter-route"
                className="lt-filters__select"
                value={filters.route || ''}
                onChange={e => onFilterChange('route', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Orwell to Sizewell C">Orwell to Sizewell C</option>
                <option value="Sizewell C to Orwell">Sizewell C to Orwell</option>
              </select>
            </div>

            {/* Haulier */}
            <div className="lt-filters__field">
              <label htmlFor="filter-haulier" className="lt-filters__label">
                Haulier
              </label>
              <select
                id="filter-haulier"
                className="lt-filters__select"
                value={filters.haulier || ''}
                onChange={e => onFilterChange('haulier', e.target.value)}
              >
                <option value="">Select</option>
                <option value="ACME Logistics">ACME Logistics</option>
                <option value="Suffolk Haulage">Suffolk Haulage</option>
                <option value="Orwell Transport">Orwell Transport</option>
                <option value="IPS Logistics">IPS Logistics</option>
              </select>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="lt-filters__btn-group">
          <button
            type="button"
            className="lt-filters__apply-btn"
            onClick={onRefresh}
          >
            Apply Filters
          </button>
          
          <button
            type="button"
            className="lt-filters__reset-icon-btn"
            onClick={onReset}
            title="Reset Filters"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
