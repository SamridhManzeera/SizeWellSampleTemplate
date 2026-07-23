import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../../Components/Layouts/PageHero/PageHero';
import { ROUTES } from '../../../../Shared/Constants';
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import { useSpaceRequests } from '../SpaceRequestsContext';
import SpaceViewFormSidebar from './SpaceViewFormSidebar';
import SpaceViewFormGeneral from './SpaceViewFormGeneral';
import SpaceViewModulePage from './SpaceViewModulePage';
import SpaceViewWorkforceForm from './SpaceViewWorkforceForm';
import '../Shared/spaceFormLayout.scss';

function DocIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
    </svg>
  );
}

function SpaceViewFormLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequest } = useSpaceRequests();
  const request = getRequest(id ?? '');

  if (!request) {
    return (
      <div className="sfw">
        <PageHeader />
        <PageHero
          icon={<DocIcon />}
          title="Request Not Found"
          subtitle={`We couldn't find a request with reference "${id}".`}
          eyebrow={null}
          actions={null}
          backAction={{
            label: '← Back',
            onClick: () => navigate(ROUTES.SPACE_REQUESTS),
          }}
        />
      </div>
    );
  }

  const enabledModules = REQUEST_FORM_MODULES.filter(
    (moduleConfig) => request.modules[moduleConfig.key]
  );

  return (
    <div className="sfw">
      <PageHeader />

      <PageHero
        icon={<DocIcon />}
        title={request.title}
        subtitle={`Viewing SRF ${request.srfNumber} in the same layout used to fill it out.`}
        eyebrow={`SRF ${request.srfNumber} · ${request.status}`}
        actions={null}
        backAction={{
          label: '← Back',
          onClick: () => navigate(ROUTES.SPACE_REQUESTS),
        }}
      />

      <div className="sfw__body">
        <SpaceViewFormSidebar request={request} />
        <div className="sfw__content">
          <section id="section-general" className="sfw__section">
            <SpaceViewFormGeneral request={request} />
          </section>
          {enabledModules.map((moduleConfig) => (
            <section
              key={moduleConfig.key}
              id={`section-${moduleConfig.segment}`}
              className="sfw__section"
            >
              {moduleConfig.key === 'workforce' ? (
                <SpaceViewWorkforceForm request={request} />
              ) : (
                <SpaceViewModulePage
                  request={request}
                  label={moduleConfig.label}
                />
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpaceViewFormLayout;
