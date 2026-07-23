import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../../../Shared/Constants';
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import { GeneralIcon, MODULE_ICONS } from '../Shared/spaceModuleIcons';
import type { RootState } from '../../../../Store';

function SpaceRequestFormSidebar() {
  const modules = useSelector((state: RootState) => state.requestForm.modules);
  const enabledModules = REQUEST_FORM_MODULES.filter(
    (moduleConfig) => modules[moduleConfig.key]
  );
  const basePath = ROUTES.SPACE_REQUESTS_NEW;

  return (
    <aside className="sfw__sidebar" aria-label="Request form sections">
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
                to={`${basePath}/${moduleConfig.path}`}
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

export default SpaceRequestFormSidebar;
