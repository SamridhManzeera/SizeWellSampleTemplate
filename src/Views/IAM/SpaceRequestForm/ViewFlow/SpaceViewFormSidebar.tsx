/* eslint-disable react/require-default-props */
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import { GeneralIcon, MODULE_ICONS } from '../Shared/spaceModuleIcons';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';

interface SpaceViewFormSidebarProps {
  request: SpaceRequestRecord;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  allowedSegments?: string[];
}

function SpaceViewFormSidebar({
  request,
  activeSection,
  onSelectSection,
  allowedSegments,
}: SpaceViewFormSidebarProps) {
  const enabledModules = REQUEST_FORM_MODULES.filter(
    (moduleConfig) =>
      request.modules[moduleConfig.key] &&
      (!allowedSegments || allowedSegments.includes(moduleConfig.segment))
  );

  return (
    <aside className="sfw__sidebar" aria-label="Request sections">
      <nav>
        <ul className="sfw__sidebar-list">
          <li className="sfw__sidebar-item">
            <button
              type="button"
              className={`sfw__sidebar-link ${
                activeSection === 'general' ? 'sfw__sidebar-link--active' : ''
              }`}
              onClick={() => onSelectSection('general')}
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
                className={`sfw__sidebar-link ${
                  activeSection === moduleConfig.segment
                    ? 'sfw__sidebar-link--active'
                    : ''
                }`}
                onClick={() => onSelectSection(moduleConfig.segment)}
              >
                <span className="sfw__sidebar-icon">
                  {MODULE_ICONS[moduleConfig.key]}
                </span>
                <span className="sfw__sidebar-text">{moduleConfig.shortLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default SpaceViewFormSidebar;
