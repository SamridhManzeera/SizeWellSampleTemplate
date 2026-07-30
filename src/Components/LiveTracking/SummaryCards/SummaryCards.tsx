import './SummaryCards.scss';

export function InboundIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export function OutboundIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

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

interface SummaryCardsProps {
  inbound: number;
  outbound: number;
  total: number;
  activeDirectionFilter: string;
  onDirectionFilterChange: (direction: string) => void;
}

export default function SummaryCards({
  inbound,
  outbound,
  total,
  activeDirectionFilter,
  onDirectionFilterChange,
}: SummaryCardsProps) {
  const cards = [
    {
      key: 'Inbound',
      label: 'Inbound Vehicles',
      value: inbound,
      icon: <InboundIcon />,
      colorClass: 'inbound',
    },
    {
      key: 'Outbound',
      label: 'Outbound Vehicles',
      value: outbound,
      icon: <OutboundIcon />,
      colorClass: 'outbound',
    },
    {
      key: '',
      label: 'Total Vehicles',
      value: total,
      icon: <TruckIcon />,
      colorClass: 'total',
    },
  ];

  return (
    <div className="lt-summary-cards">
      {cards.map(card => {
        const isActive = activeDirectionFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            className={`lt-summary-card lt-summary-card--${card.colorClass}${
              isActive ? ' lt-summary-card--active' : ''
            }`}
            onClick={() => onDirectionFilterChange(card.key)}
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
