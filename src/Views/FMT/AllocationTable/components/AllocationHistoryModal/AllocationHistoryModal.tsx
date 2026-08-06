import { FmtCompany, FmtHistoryActor, FmtSlotHistoryEntry } from '../../../types';
import './AllocationHistoryModal.scss';

interface AllocationHistoryModalProps {
  open: boolean;
  company: FmtCompany | null;
  entries: FmtSlotHistoryEntry[];
  onClose: () => void;
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  );
}

const ACTOR_LABEL: Record<FmtHistoryActor, string> = {
  slt: 'SLT',
  contractor: 'Contractor',
  fmt: 'FMT',
};

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function AllocationHistoryModal({
  open,
  company,
  entries,
  onClose,
}: AllocationHistoryModalProps) {
  if (!open || !company) return null;

  return (
    <div className="ahm-backdrop" onClick={onClose} role="presentation">
      <div
        className="ahm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="ahm__header">
          <div className="ahm__header-left">
            <span className="ahm__header-icon">
              <HistoryIcon />
            </span>
            <div>
              <h2 className="ahm__title">Allocation History</h2>
              <p className="ahm__subtitle">{company.name}</p>
            </div>
          </div>
          <button
            type="button"
            className="ahm__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="ahm__body">
          {entries.length === 0 ? (
            <p className="ahm__empty">No allocation history for this contractor yet.</p>
          ) : (
            <ul className="ahm__timeline">
              {entries.map((entry, index) => {
                const { date, time } = formatTimestamp(entry.timestamp);
                const isPositive = entry.slotChange > 0;
                const isLatest = index === 0;

                return (
                  <li
                    key={entry.id}
                    className={`ahm__item ahm__item--${entry.actor}${isLatest ? ' ahm__item--latest' : ''
                      }`}
                  >
                    <div className="ahm__item-head">
                      <span className={`ahm__item-actor ahm__item-actor--${entry.actor}`}>
                        {ACTOR_LABEL[entry.actor]}
                      </span>
                      <span className="ahm__item-name">{entry.actorName}</span>
                      {isLatest && <span className="ahm__item-latest-tag"></span>}
                      <span className="ahm__item-time">
                        {date} · {time}
                      </span>
                    </div>

                    <dl className="ahm__kv">
                      <div className="ahm__kv-row">
                        <dt className="ahm__kv-key">Action</dt>
                        <dd className="ahm__kv-value">
                          <span className="ahm__item-action">{entry.action}</span>
                        </dd>
                      </div>

                      <div className="ahm__kv-row">
                        <dt className="ahm__kv-key">Delta Slots</dt>
                        <dd className="ahm__kv-value">
                          <span
                            className={`ahm__item-delta${isPositive
                              ? ' ahm__item-delta--pos'
                              : ' ahm__item-delta--neg'
                              }`}
                          >
                            {isPositive ? '+' : ''}
                            {entry.slotChange} slot{Math.abs(entry.slotChange) === 1 ? '' : 's'}
                          </span>
                        </dd>
                      </div>

                      {entry.note && (
                        <div className="ahm__kv-row">
                          <dt className="ahm__kv-key">Description</dt>
                          <dd className="ahm__kv-value ahm__kv-value--note">{entry.note}</dd>
                        </div>
                      )}

                      <div className="ahm__kv-row ahm__kv-row--highlight">
                        <dt className="ahm__kv-key">Updated Slot</dt>
                        <dd className="ahm__kv-value ahm__kv-value--highlight">
                          {entry.resultingAllocated}
                        </dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllocationHistoryModal;
