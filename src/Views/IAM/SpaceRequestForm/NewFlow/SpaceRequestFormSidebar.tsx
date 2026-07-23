import { useDispatch, useSelector } from 'react-redux';
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import { GeneralIcon, MODULE_ICONS } from '../Shared/spaceModuleIcons';
import SpaceToggleSwitch from '../Shared/SpaceToggleSwitch';
import { setModuleEnabled } from '../../../../Store/RequestForm';
import type { RootState, AppDispatch } from '../../../../Store';

interface SpaceRequestFormSidebarProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

function SpaceRequestFormSidebar({
  activeSection,
  onSelectSection,
}: SpaceRequestFormSidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const modules = useSelector((state: RootState) => state.requestForm.modules);

  return (
    <aside className="sfw__sidebar" aria-label="Request form sections">
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
          {REQUEST_FORM_MODULES.map((moduleConfig) => {
            const enabled = modules[moduleConfig.key];
            const isActive = activeSection === moduleConfig.segment;

            return (
              <li key={moduleConfig.key} className="sfw__sidebar-item">
                <div
                  className={`sfw__sidebar-link sfw__sidebar-module ${
                    enabled ? 'sfw__sidebar-module--enabled' : ''
                  } ${isActive ? 'sfw__sidebar-link--active' : ''}`}
                >
                  <button
                    type="button"
                    className="sfw__sidebar-module-jump"
                    disabled={!enabled}
                    onClick={() => onSelectSection(moduleConfig.segment)}
                  >
                    <span className="sfw__sidebar-icon">
                      {MODULE_ICONS[moduleConfig.key]}
                    </span>
                    <span className="sfw__sidebar-text">
                      {moduleConfig.label}
                    </span>
                  </button>
                  <SpaceToggleSwitch
                    id={`module-toggle-${moduleConfig.key}`}
                    label={`Enable ${moduleConfig.label}`}
                    checked={enabled}
                    onChange={(next) => {
                      dispatch(
                        setModuleEnabled({
                          module: moduleConfig.key,
                          enabled: next,
                        })
                      );
                      if (next) {
                        onSelectSection(moduleConfig.segment);
                      }
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default SpaceRequestFormSidebar;
