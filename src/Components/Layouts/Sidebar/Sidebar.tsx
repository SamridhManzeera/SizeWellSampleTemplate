import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import sizewellLogo from '../../../assets/SizewellIcon/SZC-nostrap-white.png';
import { useSidebar } from './SidebarContext';
import './Sidebar.scss';

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function RequestsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

function ContractorIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
    </svg>
  );
}

function FormIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-5h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z" />
    </svg>
  );
}

const NAV_GROUPS = [
  {
    key: 'admin',
    label: 'Admin',
    icon: <AdminIcon />,
    items: [
      { to: '/', label: 'Full Schedule', icon: <CalendarIcon />, end: true },
      {
        to: '/schedule-config',
        label: 'Schedule Config',
        icon: <SettingsIcon />,
        end: false,
      },
      {
        to: '/live-tracking',
        label: 'Live Tracking',
        icon: <RequestsIcon />,
        end: false,
      },
      {
        to: '/admin/profile',
        label: 'Profile',
        icon: <ProfileIcon />,
        end: true,
      },
    ],
  },
  {
    key: 'contractor',
    label: 'Contractor / Supplier',
    icon: <ContractorIcon />,
    items: [
      {
        to: '/requests',
        label: 'Requests',
        icon: <RequestsIcon />,
        end: false,
      },
      {
        to: '/contractor/profile',
        label: 'Profile',
        icon: <ProfileIcon />,
        end: true,
      },
    ],
  },
  {
    key: 'login',
    label: 'Login',
    icon: <LoginIcon />,
    items: [
      { to: '/login', label: 'Login V1', icon: <FormIcon />, end: true },
      { to: '/login-v2', label: 'Login V2', icon: <FormIcon />, end: true },
      { to: '/login-v3', label: 'Login V3', icon: <FormIcon />, end: true },
      { to: '/login-v4', label: 'Login V4', icon: <FormIcon />, end: true },
      { to: '/login-v5', label: 'Login V5', icon: <FormIcon />, end: true },
      { to: '/login-v6', label: 'Login V6', icon: <FormIcon />, end: true },
    ],
  },
];

export function HamburgerButton() {
  const { openSidebar } = useSidebar();
  return (
    <button
      type="button"
      className="sidebar-hamburger"
      onClick={openSidebar}
      aria-label="Open menu"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
      </svg>
    </button>
  );
}

function Sidebar() {
  const { open, closeSidebar } = useSidebar();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    admin: true,
    contractor: true,
  });

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          role="presentation"
        />
      )}

      <aside
        className={`sidebar${open ? ' sidebar--open' : ''}`}
        aria-hidden={!open}
      >
        <div className="sidebar__header">
          <img src={sizewellLogo} alt="Sizewell C" className="sidebar__logo" />
          <button
            type="button"
            className="sidebar__close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_GROUPS.map((group) => {
            const isOpen = expanded[group.key];
            return (
              <div key={group.key} className="sidebar__group">
                <button
                  type="button"
                  className={`sidebar__group-btn${
                    isOpen ? ' sidebar__group-btn--open' : ''
                  }`}
                  onClick={() => toggle(group.key)}
                >
                  <span className="sidebar__group-icon">{group.icon}</span>
                  <span className="sidebar__group-label">{group.label}</span>
                  <span
                    className={`sidebar__group-chevron${
                      isOpen ? ' sidebar__group-chevron--open' : ''
                    }`}
                  >
                    <ChevronIcon />
                  </span>
                </button>

                <div
                  className={`sidebar__group-items${
                    isOpen ? ' sidebar__group-items--open' : ''
                  }`}
                >
                  {group.items.map(({ to, label, icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `sidebar__link${
                          isActive ? ' sidebar__link--active' : ''
                        }`
                      }
                      onClick={closeSidebar}
                    >
                      <span className="sidebar__link-dot" />
                      <span className="sidebar__link-icon">{icon}</span>
                      <span className="sidebar__link-text">{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__footer-text">Sizewell C</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
