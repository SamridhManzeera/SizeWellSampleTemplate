import { NavLink } from 'react-router-dom';
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import { ROUTES } from '../../../../Shared/Constants';
import { GeneralIcon, MODULE_ICONS } from '../Shared/spaceModuleIcons';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';

interface SpaceViewFormSidebarProps {
  request: SpaceRequestRecord;
}

function SpaceViewFormSidebar({ request }: SpaceViewFormSidebarProps) {
  const enabledModules = REQUEST_FORM_MODULES.filter(
    (moduleConfig) => request.modules[moduleConfig.key]
  );
  const basePath = `${ROUTES.SPACE_REQUESTS}/${request.id}`;

  return (
    <aside className="sfw__sidebar" aria-label="Request sections">
      <nav>
        <ul className="sfw__sidebar-list">
          <li className="sfw__sidebar-item">
            <NavLink
              to={`${basePath}/general`}
              className={({ isActive }) =>
                `sfw__sidebar-link ${
                  isActive ? 'sfw__sidebar-link--active' : ''
                }`
              }
            >
              <span className="sfw__sidebar-icon">
                <GeneralIcon />
              </span>
              <span className="sfw__sidebar-text">General</span>
            </NavLink>
          </li>
          {enabledModules.map((moduleConfig) => (
            <li key={moduleConfig.key} className="sfw__sidebar-item">
              <NavLink
                to={`${basePath}/${moduleConfig.segment}`}
                className={({ isActive }) =>
                  `sfw__sidebar-link ${
                    isActive ? 'sfw__sidebar-link--active' : ''
                  }`
                }
              >
                <span className="sfw__sidebar-icon">
                  {MODULE_ICONS[moduleConfig.key]}
                </span>
                <span className="sfw__sidebar-text">{moduleConfig.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default SpaceViewFormSidebar;
