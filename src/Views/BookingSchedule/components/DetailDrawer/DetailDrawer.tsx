import { Allocation } from '../../types';
import './DetailDrawer.scss';

interface DetailDrawerProps {
  open: boolean;
  allocation: Allocation | null;
  onClose: () => void;
  onEdit: (allocation: Allocation) => void;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`;
}

function formatDate(dateStr: string): string {
  return dateStr.split('-').reverse().join('/');
}

function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;
  } catch {
    return isoString;
  }
}

function DetailDrawer({ open, allocation, onClose, onEdit }: DetailDrawerProps) {
  return (
    <>
      {open && <div className="dd-backdrop" onClick={onClose} role="presentation" />}
      <aside className={`dd${open ? ' dd--open' : ''}`} aria-hidden={!open}>
        <div className="dd__header">
          <div className="dd__header-left">
            <h2 className="dd__title">Allocation Details</h2>
            {allocation && <span className="dd__badge">Occupied</span>}
          </div>
          <button type="button" className="dd__close" onClick={onClose} aria-label="Close drawer">
            ✕
          </button>
        </div>

        {allocation ? (
          <>
            <div className="dd__body">
              <section className="dd__section">
                <h3 className="dd__section-title">Booking Info</h3>
                <dl className="dd__dl">
                  <dt>Structure</dt>
                  <dd>{allocation.companyName}</dd>

                  <dt>Date</dt>
                  <dd>{formatDate(allocation.date)}</dd>

                  <dt>Time Slot</dt>
                  <dd>{formatHour(allocation.hour)}</dd>

                  <dt>Deliveries</dt>
                  <dd>
                    <span className="dd__count-badge">{allocation.deliveryCount}</span>
                  </dd>

                  <dt>Route Type</dt>
                  <dd>
                    <span className="dd__route-badge">
                      {allocation.routeType === 'one-way' ? '→ One Way' : '↔ Two Way'}
                    </span>
                  </dd>

                  <dt>Created At</dt>
                  <dd className="dd__muted">{formatDateTime(allocation.createdAt)}</dd>
                </dl>
              </section>

              <section className="dd__section">
                <h3 className="dd__section-title">Vehicle & Driver</h3>
                <dl className="dd__dl">
                  <dt>Vehicle No.</dt>
                  <dd>
                    <span className="dd__vehicle-plate">{allocation.vehicleNumber || '—'}</span>
                  </dd>

                  <dt>Driver</dt>
                  <dd>{allocation.driverName || '—'}</dd>
                </dl>
              </section>

              {allocation.notes && (
                <section className="dd__section">
                  <h3 className="dd__section-title">Notes</h3>
                  <p className="dd__notes">{allocation.notes}</p>
                </section>
              )}
            </div>

            <div className="dd__footer">
              <button type="button" className="dd__btn dd__btn--edit" onClick={() => onEdit(allocation)}>
                <span className="dd__btn-icon">✎</span>
                Edit Allocation
              </button>
            </div>
          </>
        ) : (
          <div className="dd__empty">No allocation selected.</div>
        )}
      </aside>
    </>
  );
}

export default DetailDrawer;
