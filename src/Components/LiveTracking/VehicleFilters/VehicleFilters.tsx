import { useState, useEffect, useRef } from 'react';
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
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fromPopoverRef = useRef<HTMLDivElement>(null);
  const toPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromPopoverRef.current && !fromPopoverRef.current.contains(event.target as Node)) {
        setShowFromPicker(false);
      }
      if (toPopoverRef.current && !toPopoverRef.current.contains(event.target as Node)) {
        setShowToPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Date From split
  const currentIsoString = new Date().toISOString();
  const currentDateDefault = currentIsoString.split('T')[0];
  const currentTimeDefault = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

  const dateFromDate = filters.dateFrom ? filters.dateFrom.split('T')[0] : currentDateDefault;
  const dateFromTime = filters.dateFrom && filters.dateFrom.includes('T') ? filters.dateFrom.split('T')[1] : currentTimeDefault;

  // Date To split
  const dateToDate = filters.dateTo ? filters.dateTo.split('T')[0] : currentDateDefault;
  const dateToTime = filters.dateTo && filters.dateTo.includes('T') ? filters.dateTo.split('T')[1] : currentTimeDefault;

  const handleDateFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    if (!d) {
      onFilterChange('dateFrom', '');
    } else {
      const t = dateFromTime || '00:00';
      onFilterChange('dateFrom', `${d}T${t}`);
    }
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
            <div className="lt-filters__field lt-filters__field--datetime" ref={fromPopoverRef}>
              <label className="lt-filters__label">
                From
              </label>
              <div 
                className="lt-filters__datetime-trigger"
                onClick={() => setShowFromPicker(!showFromPicker)}
              >
                <span className={`lt-filters__datetime-text ${!filters.dateFrom ? 'lt-filters__datetime-text--placeholder' : ''}`}>
                  {filters.dateFrom ? formatDateTimeLabel(filters.dateFrom) : 'Select date and time'}
                </span>
              </div>

              {showFromPicker && (
                <div className="lt-filters__datetime-popover">
                  <div className="lt-filters__popover-field">
                    <label className="lt-filters__popover-label">Select Date</label>
                    <input
                      type="date"
                      className="lt-filters__popover-input"
                      value={dateFromDate}
                      onChange={handleDateFromDateChange}
                    />
                  </div>
                  <div className="lt-filters__popover-divider" />
                  <div className="lt-filters__popover-field">
                    <label className="lt-filters__popover-label">Select Time</label>
                    <div className="lt-filters__popover-time-selects">
                      <select
                        className="lt-filters__popover-select"
                        value={dateFromTime ? dateFromTime.split(':')[0] : '00'}
                        onChange={(e) => {
                          const h = e.target.value;
                          const m = dateFromTime ? dateFromTime.split(':')[1] : '00';
                          onFilterChange('dateFrom', `${dateFromDate}T${h}:${m}`);
                        }}
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map(h => {
                          const hStr = h.toString().padStart(2, '0');
                          return <option key={hStr} value={hStr}>{hStr}</option>;
                        })}
                      </select>
                      <span className="lt-filters__popover-time-colon">:</span>
                      <select
                        className="lt-filters__popover-select"
                        value={dateFromTime ? dateFromTime.split(':')[1] : '00'}
                        onChange={(e) => {
                          const h = dateFromTime ? dateFromTime.split(':')[0] : '00';
                          const m = e.target.value;
                          onFilterChange('dateFrom', `${dateFromDate}T${h}:${m}`);
                        }}
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(m => {
                          const mStr = m.toString().padStart(2, '0');
                          return <option key={mStr} value={mStr}>{mStr}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="lt-filters__popover-close-btn"
                    onClick={() => {
                      if (!filters.dateFrom) {
                        onFilterChange('dateFrom', `${dateFromDate}T${dateFromTime}`);
                      }
                      setShowFromPicker(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Date Range: Date To */}
            <div className="lt-filters__field lt-filters__field--datetime" ref={toPopoverRef}>
              <label className="lt-filters__label">
                To
              </label>
              <div 
                className="lt-filters__datetime-trigger"
                onClick={() => setShowToPicker(!showToPicker)}
              >
                <span className={`lt-filters__datetime-text ${!filters.dateTo ? 'lt-filters__datetime-text--placeholder' : ''}`}>
                  {filters.dateTo ? formatDateTimeLabel(filters.dateTo) : 'Select date and time'}
                </span>
              </div>

              {showToPicker && (
                <div className="lt-filters__datetime-popover">
                  <div className="lt-filters__popover-field">
                    <label className="lt-filters__popover-label">Select Date</label>
                    <input
                      type="date"
                      className="lt-filters__popover-input"
                      value={dateToDate}
                      onChange={handleDateToDateChange}
                    />
                  </div>
                  <div className="lt-filters__popover-divider" />
                  <div className="lt-filters__popover-field">
                    <label className="lt-filters__popover-label">Select Time</label>
                    <div className="lt-filters__popover-time-selects">
                      <select
                        className="lt-filters__popover-select"
                        value={dateToTime ? dateToTime.split(':')[0] : '00'}
                        onChange={(e) => {
                          const h = e.target.value;
                          const m = dateToTime ? dateToTime.split(':')[1] : '00';
                          onFilterChange('dateTo', `${dateToDate}T${h}:${m}`);
                        }}
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map(h => {
                          const hStr = h.toString().padStart(2, '0');
                          return <option key={hStr} value={hStr}>{hStr}</option>;
                        })}
                      </select>
                      <span className="lt-filters__popover-time-colon">:</span>
                      <select
                        className="lt-filters__popover-select"
                        value={dateToTime ? dateToTime.split(':')[1] : '00'}
                        onChange={(e) => {
                          const h = dateToTime ? dateToTime.split(':')[0] : '00';
                          const m = e.target.value;
                          onFilterChange('dateTo', `${dateToDate}T${h}:${m}`);
                        }}
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(m => {
                          const mStr = m.toString().padStart(2, '0');
                          return <option key={mStr} value={mStr}>{mStr}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="lt-filters__popover-close-btn"
                    onClick={() => {
                      if (!filters.dateTo) {
                        onFilterChange('dateTo', `${dateToDate}T${dateToTime}`);
                      }
                      setShowToPicker(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
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

// ── Icons & Helpers ──────────────────────────────────────────────────

function formatDateTimeLabel(isoString: string | undefined) {
  let dateObj: Date;
  if (!isoString) {
    dateObj = new Date();
  } else {
    dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
  }
  
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = allMonths[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${month} ${day}, ${year}  - ${hours}:${minutes}`;
}
