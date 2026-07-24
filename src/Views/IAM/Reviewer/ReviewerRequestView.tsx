import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import { ROUTES } from '../../../Shared/Constants';
import { REQUEST_FORM_MODULES } from '../../../Shared/requestFormModules';
import SpaceViewFormSidebar from '../SpaceRequestForm/ViewFlow/SpaceViewFormSidebar';
import SpaceViewFormGeneral from '../SpaceRequestForm/ViewFlow/SpaceViewFormGeneral';
import SpaceViewModulePage from '../SpaceRequestForm/ViewFlow/SpaceViewModulePage';
import SpaceViewWorkforceForm from '../SpaceRequestForm/ViewFlow/SpaceViewWorkforceForm';
import SpaceViewWorkAreaForm from '../SpaceRequestForm/ViewFlow/SpaceViewWorkAreaForm';
import {
  getSectionReview,
  useSpaceRequests,
} from '../SpaceRequestForm/SpaceRequestsContext';
import ReviewerDecisionPanel from './ReviewerDecisionPanel';
import ReviewReopenTab from '../SpaceRequestForm/Shared/ReviewReopenTab';
import '../SpaceRequestForm/Shared/spaceFormLayout.scss';
import '../SpaceRequestForm/Shared/sectionReviewPanel.scss';

function ClipboardIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z" />
    </svg>
  );
}

const REVIEWER_LISTING_ROUTES: Record<string, string> = {
  'work-area': ROUTES.REVIEWER_WORK_AREA,
  it: ROUTES.REVIEWER_IT,
  water: ROUTES.REVIEWER_WATER,
  welfare: ROUTES.REVIEWER_WELFARE,
  power: ROUTES.REVIEWER_POWER,
  workforce: ROUTES.REVIEWER_WORKFORCE,
};

function ReviewerRequestView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getRequest, saveSectionDraft, submitSectionReview } =
    useSpaceRequests();
  const request = getRequest(id ?? '');
  const restrictedSection = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(
    () => restrictedSection ?? 'general'
  );
  const [isReviewOpen, setIsReviewOpen] = useState(true);

  useEffect(() => {
    setIsReviewOpen(true);
  }, [activeSection]);

  const backRoute = restrictedSection
    ? REVIEWER_LISTING_ROUTES[restrictedSection] ?? ROUTES.DASHBOARD
    : ROUTES.DASHBOARD;

  if (!request) {
    return (
      <div className="sfw">
        <PageHeader />
        <PageHero
          icon={<ClipboardIcon />}
          title="Request Not Found"
          subtitle={`We couldn't find a request with reference "${id}".`}
          eyebrow={null}
          actions={null}
          backAction={{
            label: '← Back',
            onClick: () => navigate(backRoute),
          }}
        />
      </div>
    );
  }

  const activeModuleConfig = REQUEST_FORM_MODULES.find(
    (moduleConfig) =>
      moduleConfig.segment === activeSection &&
      request.modules[moduleConfig.key]
  );

  return (
    <div className="sfw">
      <PageHeader />

      <PageHero
        icon={<ClipboardIcon />}
        title={request.title}
        subtitle={`Review the submission for SRF ${request.srfNumber} and record your decision.`}
        eyebrow={`SRF ${request.srfNumber} · ${request.status}`}
        actions={null}
        backAction={{
          label: '← Back',
          onClick: () => navigate(backRoute),
        }}
      />

      {!isReviewOpen && (
        <div className="rvw__toolbar-row">
          <ReviewReopenTab onClick={() => setIsReviewOpen(true)} />
        </div>
      )}

      <div className="sfw__body">
        <SpaceViewFormSidebar
          request={request}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          allowedSegments={restrictedSection ? [restrictedSection] : undefined}
        />
        <div className="rvw__body">
          <div className="rvw__main">
            {activeSection === 'general' && (
              <SpaceViewFormGeneral request={request} />
            )}
            {activeModuleConfig &&
              (activeModuleConfig.key === 'workforce' ? (
                <SpaceViewWorkforceForm
                  request={request}
                  onGoToGeneral={() => setActiveSection('general')}
                />
              ) : activeModuleConfig.key === 'workArea' ? (
                <SpaceViewWorkAreaForm
                  request={request}
                  role="view"
                />
              ) : (
                <SpaceViewModulePage
                  request={request}
                  label={activeModuleConfig.label}
                />
              ))}
          </div>
          {isReviewOpen && (
            <ReviewerDecisionPanel
              key={activeSection}
              sectionReview={getSectionReview(request, activeSection)}
              onSaveDraft={(comment, attachments) =>
                saveSectionDraft(
                  request.id,
                  activeSection,
                  comment,
                  attachments
                )
              }
              onSubmit={(status, comment, attachments) =>
                submitSectionReview(
                  request.id,
                  activeSection,
                  status,
                  comment,
                  attachments
                )
              }
              onClose={() => setIsReviewOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewerRequestView;
