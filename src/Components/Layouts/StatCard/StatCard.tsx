import { ReactNode } from 'react';
import './StatCard.scss';

export type StatCardColor = 'navy' | 'teal' | 'amber' | 'green' | 'red';

interface StatCardProps {
  label: string;
  value: number | string;
  tag: string;
  icon: ReactNode;
  color: StatCardColor;
}

function StatCard({ label, value, tag, icon, color }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <span className="stat-card__bar" aria-hidden="true" />
      <div className="stat-card__glow" aria-hidden="true" />
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon">{icon}</span>
      </div>
      <div className="stat-card__value">{value}</div>
      <span className="stat-card__tag">
        <span className="stat-card__tag-dot" aria-hidden="true" />
        {tag}
      </span>
    </div>
  );
}

export default StatCard;
