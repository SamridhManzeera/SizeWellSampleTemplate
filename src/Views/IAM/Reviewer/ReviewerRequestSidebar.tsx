import { REQUEST_FORM_MODULES } from '../../../Shared/requestFormModules';
import {
  GeneralIcon,
  MODULE_ICONS,
} from '../SpaceRequestForm/Shared/spaceModuleIcons';
import type { ReviewRecord } from './reviewerTypes';

export const REVIEW_SECTION_ID = 'review';

interface ReviewerRequestSidebarProps {
  review: ReviewRecord;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

function ReviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function ReviewerRequestSidebar({
  review,
  activeSection,
  onSelectSection,
}: ReviewerRequestSidebarProps) {
  const enabledModules = REQUEST_FORM_MODULES.filter(
    (moduleConfig) => review.modules[moduleConfig.key]
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
                <span className="sfw__sidebar-text">{moduleConfig.label}</span>
              </button>
            </li>
          ))}
          <li className="sfw__sidebar-item">
            <button
              type="button"
              className={`sfw__sidebar-link ${
                activeSection === REVIEW_SECTION_ID
                  ? 'sfw__sidebar-link--active'
                  : ''
              }`}
              onClick={() => onSelectSection(REVIEW_SECTION_ID)}
            >
              <span className="sfw__sidebar-icon">
                <ReviewIcon />
              </span>
              <span className="sfw__sidebar-text">Review Decision</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default ReviewerRequestSidebar;
