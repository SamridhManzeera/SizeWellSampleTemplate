import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PageHeader from '../../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../../Components/Layouts/PageHero/PageHero';
import { ROUTES } from '../../../../Shared/Constants';
import { resetRequestForm } from '../../../../Store/RequestForm';
import type { AppDispatch } from '../../../../Store';
import SpaceRequestFormSidebar from './SpaceRequestFormSidebar';
import '../Shared/spaceFormLayout.scss';

function DocIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
    </svg>
  );
}

function SpaceRequestFormLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetRequestForm());
  }, [dispatch]);

  return (
    <div className="sfw">
      <PageHeader />

      <PageHero
        icon={<DocIcon />}
        title="Space Request Form"
        subtitle="Raise a new space request and enable the modules relevant to your work area, then complete each section."
        eyebrow="Contractor"
        actions={null}
        backAction={{
          label: 'Back to Space Requests',
          onClick: () => navigate(ROUTES.SPACE_REQUESTS),
        }}
      />

      <div className="sfw__body">
        <SpaceRequestFormSidebar />
        <div className="sfw__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default SpaceRequestFormLayout;
