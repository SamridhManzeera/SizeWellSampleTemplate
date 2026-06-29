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
  const total = allocation
    ? allocation.inboundCount + allocation.outboundCount + allocation.twoWayCount * 2
    : 0;

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
              {/* ── Booking Info ──────────────────────────── */}
              <section className="dd__section">
                <h3 className="dd__section-title">Booking Info</h3>
                <dl className="dd__dl">
                  <dt>Structure</dt>
                  <dd>{allocation.companyName}</dd>

                  <dt>Date</dt>
                  <dd>{formatDate(allocation.date)}</dd>

                  <dt>Time Slot</dt>
                  <dd>{formatHour(allocation.hour)}</dd>

                  <dt>Total</dt>
                  <dd><span className="dd__count-badge">{total}</span></dd>

                  <dt>Created At</dt>
                  <dd className="dd__muted">{formatDateTime(allocation.createdAt)}</dd>
                </dl>
              </section>

              {/* ── Delivery Breakdown ────────────────────── */}
              {false && <section className="dd__section">
                <h3 className="dd__section-title">Delivery Breakdown</h3>
                <div className="dd__breakdown">
                  <div className="dd__breakdown-card dd__breakdown-card--inbound">
                    <span className="dd__breakdown-icon">↑</span>
                    <div className="dd__breakdown-info">
                      <span className="dd__breakdown-label">Inbound</span>
                      <span className="dd__breakdown-count">{allocation.inboundCount}</span>
                    </div>
                  </div>
                  <div className="dd__breakdown-card dd__breakdown-card--outbound">
                    <span className="dd__breakdown-icon">↓</span>
                    <div className="dd__breakdown-info">
                      <span className="dd__breakdown-label">Outbound</span>
                      <span className="dd__breakdown-count">{allocation.outboundCount}</span>
                    </div>
                  </div>
                  <div className="dd__breakdown-card dd__breakdown-card--twoway">
                    <span className="dd__breakdown-icon">↕</span>
                    <div className="dd__breakdown-info">
                      <span className="dd__breakdown-label">Two Way</span>
                      <span className="dd__breakdown-count">{allocation.twoWayCount}</span>
                    </div>
                  </div>
                </div>
              </section>}

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
