import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import { GeneralIcon, MODULE_ICONS } from '../Shared/spaceModuleIcons';
import scrollToSection from '../Shared/scrollToFormSection';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';

interface SpaceViewFormSidebarProps {
  request: SpaceRequestRecord;
}

function SpaceViewFormSidebar({ request }: SpaceViewFormSidebarProps) {
  const enabledModules = REQUEST_FORM_MODULES.filter(
    (moduleConfig) => request.modules[moduleConfig.key]
  );

  return (
    <aside className="sfw__sidebar" aria-label="Request sections">
      <nav>
        <ul className="sfw__sidebar-list">
          <li className="sfw__sidebar-item">
            <button
              type="button"
              className="sfw__sidebar-link"
              onClick={() => scrollToSection('section-general')}
            >
              <span className="sfw__sidebar-icon">
                <GeneralIcon />
              </span>
              <span className="sfw__sidebar-text">General</span>
            </button>
          </li>
          {enabledModules.map((moduleConfig) => (
            <li key={moduleConfig.key} className="sfw__sidebar-item">
              <button
                type="button"
                className="sfw__sidebar-link"
                onClick={() =>
                  scrollToSection(`section-${moduleConfig.segment}`)
                }
              >
                <span className="sfw__sidebar-icon">
                  {MODULE_ICONS[moduleConfig.key]}
                </span>
                <span className="sfw__sidebar-text">{moduleConfig.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default SpaceViewFormSidebar;
