import { Company, Allocation, SlotKey } from '../../types';
import { buildSlotKey } from '../../mockData';
import './ScheduleGrid.scss';

interface ScheduleGridProps {
  companies: Company[];
  allocations: Map<SlotKey, Allocation>;
  allocatedCounts: Map<string, number>;
  selectedDate: string;
  onAvailableSlotClick: (companyId: string, hour: number) => void;
  onOccupiedSlotClick: (allocation: Allocation) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function ScheduleGrid({
  companies,
  allocations,
  allocatedCounts,
  selectedDate,
  onAvailableSlotClick,
  onOccupiedSlotClick,
}: ScheduleGridProps) {
  return (
    <div className="sg-wrapper">
      <table className="sg">
        <thead>
          <tr className="sg__head-row">
            <th className="sg__structure-col">STRUCTURE</th>
            {HOURS.map((hour) => (
              <th key={hour} className="sg__hour-col">
                {formatHour(hour)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => {
            const allocated = allocatedCounts.get(company.id) ?? 0;
            const isFull = allocated >= company.assignedDeliveries;

            return (
              <tr key={company.id} className="sg__company-row">
                <td className="sg__company-cell">
                  <span className="sg__bay-name">{company.name}</span>
                  <div className="sg__chips">
                    <span className="sg__chip sg__chip--assigned">
                      <strong>{company.assignedDeliveries}</strong> assigned
                    </span>
                    <span className={`sg__chip sg__chip--allocated${isFull ? ' sg__chip--full' : ''}`}>
                      <strong>{allocated}</strong> allocated
                    </span>
                  </div>
                </td>
                {HOURS.map((hour) => {
                  const key = buildSlotKey(company.id, selectedDate, hour);
                  const allocation = allocations.get(key);
                  const isOccupied = !!allocation;
                  const isDisabled = !isOccupied && isFull;

                  return (
                    <td key={hour} className="sg__slot-cell">
                      <button
                        type="button"
                        className={`sg__slot${isOccupied ? ' sg__slot--occupied' : ' sg__slot--available'}${isDisabled ? ' sg__slot--disabled' : ''}`}
                        onClick={() =>
                          isOccupied
                            ? onOccupiedSlotClick(allocation)
                            : onAvailableSlotClick(company.id, hour)
                        }
                        disabled={isDisabled}
                        title={
                          isDisabled
                            ? 'No remaining deliveries'
                            : isOccupied
                            ? `${allocation.deliveryCount} deliveries · click to view`
                            : 'Available · click to allocate'
                        }
                      >
                        {isOccupied && (
                          <span className="sg__slot-badge">{allocation.deliveryCount}</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleGrid;
