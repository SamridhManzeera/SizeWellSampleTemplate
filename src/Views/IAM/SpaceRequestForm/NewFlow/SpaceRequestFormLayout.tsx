import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../../Components/Layouts/PageHero/PageHero';
import { ROUTES } from '../../../../Shared/Constants';
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import { resetRequestForm } from '../../../../Store/RequestForm';
import type { AppDispatch, RootState } from '../../../../Store';
import SpaceRequestFormSidebar from './SpaceRequestFormSidebar';
import SpaceGeneralForm from './SpaceGeneralForm';
import SpaceModulePage from './SpaceModulePage';
import SpaceWorkforceForm from './SpaceWorkforceForm';
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
  const modules = useSelector((state: RootState) => state.requestForm.modules);
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    dispatch(resetRequestForm());
  }, [dispatch]);

  useEffect(() => {
    if (activeSection === 'general') return;
    const activeModuleConfig = REQUEST_FORM_MODULES.find(
      (moduleConfig) => moduleConfig.segment === activeSection
    );
    if (activeModuleConfig && !modules[activeModuleConfig.key]) {
      setActiveSection('general');
    }
  }, [modules, activeSection]);

  const activeModuleConfig = REQUEST_FORM_MODULES.find(
    (moduleConfig) =>
      moduleConfig.segment === activeSection && modules[moduleConfig.key]
  );

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
          label: '← Back',
          onClick: () => navigate(ROUTES.SPACE_REQUESTS),
        }}
      />

      <div className="sfw__body">
        <SpaceRequestFormSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />
        <div className="sfw__content">
          {activeSection === 'general' && <SpaceGeneralForm />}
          {activeModuleConfig &&
            (activeModuleConfig.key === 'workforce' ? (
              <SpaceWorkforceForm
                onGoToGeneral={() => setActiveSection('general')}
              />
            ) : (
              <SpaceModulePage label={activeModuleConfig.label} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default SpaceRequestFormLayout;
