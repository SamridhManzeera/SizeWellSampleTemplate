import { NavLink } from 'react-router-dom';
import sizewellLogo from '../../../assets/SizewellIcon/SZC-nostrap-white.png';
import { useSidebar } from './SidebarContext';
import './Sidebar.scss';

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/',                label: 'Full Schedule',  icon: <CalendarIcon />,  end: true  },
  { to: '/schedule-config', label: 'Schedule Config', icon: <SettingsIcon />, end: false },
  { to: '/requests',        label: 'Requests',        icon: <RequestsIcon />, end: false },
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

  return (
    <>
      {open && (
        <div className="sidebar-backdrop" onClick={closeSidebar} role="presentation" />
      )}

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-hidden={!open}>
        <div className="sidebar__header">
          <img src={sizewellLogo} alt="Sizewell C" className="sidebar__logo" />
          <button type="button" className="sidebar__close" onClick={closeSidebar} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar__nav">
          {/* <span className="sidebar__nav-label">Navigation</span> */}
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="sidebar__link-icon">{icon}</span>
              <span className="sidebar__link-text">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__footer-text">Sizewell C</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
