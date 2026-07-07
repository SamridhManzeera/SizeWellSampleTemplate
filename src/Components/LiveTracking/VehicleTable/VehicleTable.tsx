import { EnhancedVehicle } from '../../../types/liveTracking';
import './VehicleTable.scss';

interface VehicleTableProps {
  vehicles: EnhancedVehicle[];
  onSelectVehicle: (id: string) => void;
  onViewOnMap: (id: string) => void;
}

export default function VehicleTable({ vehicles, onSelectVehicle, onViewOnMap }: VehicleTableProps) {
  const formatDateTime = (timeStr: string | undefined | null) => {
    if (!timeStr) return '--';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const time = date.toLocaleTimeString('en-GB', { hour12: false });
      return `${day}/${month}/${year} ${time}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="lt-table-wrap">
      <table className="lt-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Vehicle Type</th>
            <th>Route</th>
            <th>Status</th>
            <th>Speed</th>
            <th>Distance</th>
            <th>Duration</th>
            <th>Started At</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={10} className="lt-table__empty">
                No vehicles match the active filters.
              </td>
            </tr>
          ) : (
            vehicles.map(v => {
              const statusClass = 
                v.status === 'Correct' ? 'on-route' :
                v.status === 'Incorrect' ? 'off-route' : 'idle';

              const distanceText = v.summary 
                ? `${v.summary.distanceKm.toFixed(2)} km` 
                : '--';

              const durationText = v.summary 
                ? v.summary.durationHms 
                : '--';

              const speedText = `${v.currentSpeedMph.toFixed(0)} mph`;

              return (
                <tr 
                  key={v.id} 
                  className="lt-table__row"
                  onClick={() => onSelectVehicle(v.id)}
                >
                  <td className="lt-table__cell-vehicle">
                    <span className="lt-table__vehicle-id">{v.id}</span>
                    <span className="lt-table__vehicle-name">{v.name}</span>
                  </td>
                  <td>
                    <span className="lt-table__type-badge">{v.type}</span>
                  </td>
                  <td className="lt-table__cell-route">
                    <div className="lt-table__route-info">
                      <div className="lt-table__route-loc lt-table__route-loc--start">{v.startLocation}</div>
                      <div className="lt-table__route-loc lt-table__route-loc--end">
                        <span className="lt-table__route-arrow">➔</span> {v.endLocation}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`lt-table__status-badge lt-table__status-badge--${statusClass}`}>
                      {v.status === 'Correct' ? 'Correct' : 
                       v.status === 'Incorrect' ? 'Incorrect' : 'Pending Validation'}
                    </span>
                  </td>
                  <td className="lt-table__speed-val">{speedText}</td>
                  <td>{distanceText}</td>
                  <td>{durationText}</td>
                  <td className="lt-table__time-val">{formatDateTime(v.summary?.startTime)}</td>
                  <td className="lt-table__time-val">{formatDateTime(v.lastUpdated)}</td>
                  <td className="lt-table__cell-actions">
                    <button
                      type="button"
                      className="lt-table__action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOnMap(v.id);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
