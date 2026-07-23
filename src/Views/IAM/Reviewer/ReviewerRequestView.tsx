import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import { ROUTES } from '../../../Shared/Constants';
import { REQUEST_FORM_MODULES } from '../../../Shared/requestFormModules';
import SpaceViewFormGeneral from '../SpaceRequestForm/ViewFlow/SpaceViewFormGeneral';
import SpaceViewModulePage from '../SpaceRequestForm/ViewFlow/SpaceViewModulePage';
import SpaceViewWorkforceForm from '../SpaceRequestForm/ViewFlow/SpaceViewWorkforceForm';
import { useReviewerRequests } from './ReviewerRequestsContext';
import ReviewerRequestSidebar, {
  REVIEW_SECTION_ID,
} from './ReviewerRequestSidebar';
import ReviewerDecisionPanel from './ReviewerDecisionPanel';
import '../SpaceRequestForm/Shared/spaceFormLayout.scss';

function ClipboardIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z" />
    </svg>
  );
}

function ReviewerRequestView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getReview, submitReview } = useReviewerRequests();
  const review = getReview(id ?? '');
  const [activeSection, setActiveSection] = useState(
    () => searchParams.get('section') ?? 'general'
  );

  if (!review) {
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
            onClick: () => navigate(ROUTES.REVIEWER_REQUESTS),
          }}
        />
      </div>
    );
  }

  const activeModuleConfig = REQUEST_FORM_MODULES.find(
    (moduleConfig) =>
      moduleConfig.segment === activeSection && review.modules[moduleConfig.key]
  );

  return (
    <div className="sfw">
      <PageHeader />

      <PageHero
        icon={<ClipboardIcon />}
        title={review.title}
        subtitle={`Review the submission for SRF ${review.srfNumber} and record your decision.`}
        eyebrow={`SRF ${review.srfNumber} · ${review.status}`}
        actions={null}
        backAction={{
          label: '← Back',
          onClick: () => navigate(ROUTES.REVIEWER_REQUESTS),
        }}
      />

      <div className="sfw__body">
        <ReviewerRequestSidebar
          review={review}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />
        <div className="sfw__content">
          {activeSection === 'general' && (
            <SpaceViewFormGeneral request={review} />
          )}
          {activeSection === REVIEW_SECTION_ID && (
            <ReviewerDecisionPanel
              review={review}
              onSubmit={(decision, comment) =>
                submitReview(review.id, decision, comment)
              }
            />
          )}
          {activeModuleConfig &&
            (activeModuleConfig.key === 'workforce' ? (
              <SpaceViewWorkforceForm
                request={review}
                onGoToGeneral={() => setActiveSection('general')}
              />
            ) : (
              <SpaceViewModulePage
                request={review}
                label={activeModuleConfig.label}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default ReviewerRequestView;
