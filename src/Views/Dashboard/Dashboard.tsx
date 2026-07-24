import { useState } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../Components/Layouts/PageHero/PageHero';
import FencingMap from '../../Components/Maps/FencingMap/FencingMap';
import { useDemoApiQuery } from '../../Services/Api/module/demoApi';
import './Dashboard.scss';

type ReportingPeriod = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';
type KpiColor = 'purple' | 'amber' | 'green' | 'red';

interface KpiMetric {
  value: number;
}

interface KpiSnapshot {
  total: KpiMetric;
  pending: KpiMetric;
  approved: KpiMetric;
  rejected: KpiMetric;
}

const KPI_SNAPSHOTS: Record<ReportingPeriod, KpiSnapshot> = {
  thisMonth: {
    total: { value: 124 },
    pending: { value: 24 },
    approved: { value: 82 },
    rejected: { value: 18 },
  },
  lastMonth: {
    total: { value: 111 },
    pending: { value: 19 },
    approved: { value: 79 },
    rejected: { value: 13 },
  },
  thisQuarter: {
    total: { value: 342 },
    pending: { value: 31 },
    approved: { value: 268 },
    rejected: { value: 50 },
  },
  thisYear: {
    total: { value: 1180 },
    pending: { value: 47 },
    approved: { value: 912 },
    rejected: { value: 186 },
  },
};

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.5 14.5L6 12l1.41-1.41 3.09 3.08 6.09-6.08L18 9l-7.5 7.5z" />
    </svg>
  );
}

function RejectedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.59 13L12 11.41 8.41 15 7 13.59 10.59 10 7 6.41 8.41 5 12 8.59 15.59 5 17 6.41 13.41 10 17 13.59z" />
    </svg>
  );
}

const KPI_CARD_CONFIG: {
  key: keyof KpiSnapshot;
  label: string;
  color: KpiColor;
  icon: JSX.Element;
}[] = [
  {
    key: 'total',
    label: 'Total Requests',
    color: 'purple',
    icon: <ClipboardIcon />,
  },
  {
    key: 'pending',
    label: 'Total Pending Requests',
    color: 'amber',
    icon: <ClockIcon />,
  },
  {
    key: 'approved',
    label: 'Total Approved Requests',
    color: 'green',
    icon: <CheckCircleIcon />,
  },
  {
    key: 'rejected',
    label: 'Total Rejected Requests',
    color: 'red',
    icon: <RejectedIcon />,
  },
];

export default function Dashboard() {
  const { data, error } = useDemoApiQuery('');
  console.log(data, error);
  const [period, setPeriod] = useState<ReportingPeriod>('thisMonth');
  const snapshot = KPI_SNAPSHOTS[period];

  return (
    <div>
      <PageHeader />

      <PageHero
        icon={<DashboardIcon />}
        title="Dashboard"
        subtitle="Overview of your IAM workspace."
        eyebrow={null}
        actions={null}
      />

      <div className="dash-kpi">
        <div className="dash-kpi__header">
          <div>
            <h2 className="dash-kpi__title">Request Summary</h2>
            <p className="dash-kpi__subtitle">
              KPI values update according to the selected reporting period.
            </p>
          </div>
          <select
            className="dash-kpi__period-select"
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as ReportingPeriod)
            }
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>

        <div className="dash-kpi__grid">
          {KPI_CARD_CONFIG.map(({ key, label, color, icon }) => {
            const metric = snapshot[key];
            return (
              <div
                key={key}
                className={`dash-kpi__card dash-kpi__card--${color}`}
              >
                <span className="dash-kpi__card-bar" aria-hidden="true" />
                <span className="dash-kpi__card-glow" aria-hidden="true" />
                <div className="dash-kpi__top">
                  <span className={`dash-kpi__icon dash-kpi__icon--${color}`}>
                    {icon}
                  </span>
                  <span className="dash-kpi__label">{label}</span>
                </div>
                <div className="dash-kpi__value">{metric.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dash-kpi">
        <div className="dash-kpi__header">
          <div>
            <h2 className="dash-kpi__title">Site Fencing Overview</h2>
            <p className="dash-kpi__subtitle">
              Active and planned fencing zones across the site.
            </p>
          </div>
        </div>

        <FencingMap />
      </div>
    </div>
  );
}
