import { useState } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { MOCK_NOTIFICATIONS } from './notificationMockData';
import {
  NOTIFICATION_TYPE_META,
  Notification,
  NotificationType,
} from './notificationTypes';
import './Notifications.scss';

// ── Icons ─────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

function CheckAllIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function DocUploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 12h-2v3H9v-3H7l3-3 3 3z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

const TYPE_ICON: Record<NotificationType, () => JSX.Element> = {
  'form-submitted': SendIcon,
  documents: DocUploadIcon,
  modification: EditIcon,
  approved: CheckCircleIcon,
  alert: AlertIcon,
};

// ── Helpers ───────────────────────────────────────────────────────

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString('en-GB');
  const timePart = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}

// ── Main Page ─────────────────────────────────────────────────────

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  const filtered =
    typeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === typeFilter);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="nt">
      <PageHeader />

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="nt__hero">
        <div className="nt__hero-left">
          <div className="nt__hero-icon">
            <BellIcon />
          </div>
          <div>
            <h1 className="nt__hero-title">Notifications</h1>
            <p className="nt__hero-sub">
              Updates across your requests, documents, and site visits. Unread
              items are highlighted.
            </p>
          </div>
        </div>
        <button type="button" className="nt__mark-btn" onClick={markAllRead}>
          <CheckAllIcon /> Mark all read
        </button>
      </div>

      <div className="nt__body">
        <div className="nt__card">
          <div className="nt__card-header">
            <h2 className="nt__card-title">All Notifications</h2>

            <div className="nt__filter-wrap">
              <FilterIcon />
              <select
                className="nt__filter-select"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as NotificationType | 'all')
                }
              >
                <option value="all">All Types</option>
                {Object.entries(NOTIFICATION_TYPE_META).map(([type, meta]) => (
                  <option key={type} value={type}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="nt__list">
            {filtered.length === 0 && (
              <p className="nt__empty">No notifications found.</p>
            )}
            {filtered.map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <button
                  type="button"
                  key={n.id}
                  className={`nt__item${n.read ? '' : ' nt__item--unread'}`}
                  onClick={() => markRead(n.id)}
                >
                  <span className="nt__item-icon">
                    <Icon />
                  </span>
                  <span className="nt__item-body">
                    <span className="nt__item-title">{n.title}</span>
                    <span className="nt__item-desc">{n.description}</span>
                    <span className={`nt__badge nt__badge--${n.type}`}>
                      {NOTIFICATION_TYPE_META[n.type].label}
                    </span>
                  </span>
                  <span className="nt__item-time">
                    {formatTimestamp(n.timestamp)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
