import './SummaryCards.scss';

export function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function OnRouteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 11 2 2 4-4" />
    </svg>
  );
}

export function OffRouteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IdleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface SummaryCardsProps {
  metrics: {
    total: number;
    correct: number;
    incorrect: number;
    pending: number;
  };
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export default function SummaryCards({
  metrics,
  activeStatusFilter,
  onStatusFilterChange,
}: SummaryCardsProps) {
  const cards = [
    {
      key: '',
      label: 'Total Vehicles',
      value: metrics.total,
      icon: <TruckIcon />,
      colorClass: 'total',
    },
    {
      key: 'Correct',
      label: 'Correct',
      value: metrics.correct,
      icon: <OnRouteIcon />,
      colorClass: 'on-route',
    },
    {
      key: 'Incorrect',
      label: 'Incorrect',
      value: metrics.incorrect,
      icon: <OffRouteIcon />,
      colorClass: 'off-route',
    },
    {
      key: 'Pending',
      label: 'Pending Validation',
      value: metrics.pending,
      icon: <IdleIcon />,
      colorClass: 'idle',
    },
  ];

  return (
    <div className="lt-summary-cards">
      {cards.map(card => {
        const isActive = activeStatusFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            className={`lt-summary-card lt-summary-card--${card.colorClass}${
              isActive ? ' lt-summary-card--active' : ''
            }`}
            onClick={() => onStatusFilterChange(card.key)}
          >
            <div className="lt-summary-card__icon-container">{card.icon}</div>
            <div className="lt-summary-card__content">
              <span className="lt-summary-card__label">{card.label}</span>
              <span className="lt-summary-card__value">{card.value}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
