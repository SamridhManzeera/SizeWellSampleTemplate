import { useEffect } from 'react';
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
import SpaceWorkAreaForm from './SpaceWorkAreaForm';
import { useSpaceRequests } from '../SpaceRequestsContext';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';
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
  const mobilisationDate = useSelector((state: RootState) => state.requestForm.mobilisationDate);
  const demobilisationDate = useSelector((state: RootState) => state.requestForm.demobilisationDate);
  const { addRequest } = useSpaceRequests();

  useEffect(() => {
    dispatch(resetRequestForm());
  }, [dispatch]);

  const enabledModules = REQUEST_FORM_MODULES.filter(
    (moduleConfig) => modules[moduleConfig.key]
  );

  const handleSubmit = () => {
    // 1. Load general form values from localStorage
    const savedGeneral = localStorage.getItem('sizewell_general_form_values');
    let generalValues: any = {};
    if (savedGeneral) {
      try {
        generalValues = JSON.parse(savedGeneral);
      } catch (e) {}
    }

    // 2. Load places coordinates from localStorage
    const savedPlaces = localStorage.getItem('sizewell_work_area_places');
    let places: any[] = [];
    if (savedPlaces) {
      try {
        places = JSON.parse(savedPlaces);
      } catch (e) {}
    }

    // 3. Build the new SpaceRequestRecord
    const newRequest: SpaceRequestRecord = {
      id: 'SRF-' + (1000 + Math.floor(Math.random() * 9000)),
      srfNumber: generalValues.srfNumber || (100 + Math.floor(Math.random() * 900)).toString(),
      dateRaised: generalValues.dateRaised || new Date().toLocaleDateString('en-GB'),
      teamcenterNumber: generalValues.teamcenterNumber || '101' + Math.floor(Math.random() * 100000),
      revision: generalValues.revision || '001',
      title: generalValues.title || 'New Space Request',
      originatorCompanyName: generalValues.originatorCompanyName || 'Contractor Ltd',
      projectContractRefNumber: generalValues.projectContractRefNumber || 'ADW000-' + (100 + Math.floor(Math.random() * 900)),
      mobilisationDate: mobilisationDate || new Date().toLocaleDateString('en-GB'),
      demobilisationDate: demobilisationDate || new Date().toLocaleDateString('en-GB'),
      plotFootprint: generalValues.plotFootprint || 'N/A',
      developmentSiteType: generalValues.developmentSiteType || 'MDS',
      mainDevelopmentSiteArea: generalValues.mainDevelopmentSiteArea || 'N/A',
      siteZone: generalValues.siteZone || 'N/A',
      requestTypeMds: generalValues.requestTypeMds || 'N/A',
      laydownWarehousePort: generalValues.laydownWarehousePort || 'N/A',
      areaOsi: generalValues.areaOsi || 'N/A',
      requestTypeOsi: generalValues.requestTypeOsi || 'N/A',
      status: 'Submitted',
      modules: { ...modules },
      places: places,
      workforceData: { counts: {} },
      sectionReviews: {
        general: { status: 'Under Review', comment: '', attachments: [] },
        'work-area': { status: 'Under Review', comment: '', attachments: [] },
        water: { status: 'Under Review', comment: '', attachments: [] },
        welfare: { status: 'Under Review', comment: '', attachments: [] },
        power: { status: 'Under Review', comment: '', attachments: [] },
        workforce: { status: 'Under Review', comment: '', attachments: [] },
      }
    };

    // 4. Submit the request and navigate back
    addRequest(newRequest);
    
    // Clear draft keys from localStorage
    localStorage.removeItem('sizewell_general_form_values');
    localStorage.removeItem('sizewell_work_area_places');

    navigate(ROUTES.SPACE_REQUESTS);
  };

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
        <SpaceRequestFormSidebar />
        <div className="sfw__content">
          <section id="section-general" className="sfw__section">
            <SpaceGeneralForm />
          </section>
          {enabledModules.map((moduleConfig) => (
            <section
              key={moduleConfig.key}
              id={`section-${moduleConfig.segment}`}
              className="sfw__section"
            >
              {moduleConfig.key === 'workforce' ? (
                <SpaceWorkforceForm />
              ) : moduleConfig.key === 'workArea' ? (
                <SpaceWorkAreaForm />
              ) : (
                <SpaceModulePage label={moduleConfig.label} />
              )}
            </section>
          ))}

          <div className="sfw__actions" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="sfl__new-btn"
              onClick={handleSubmit}
              style={{ padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', height: 'auto' }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpaceRequestFormLayout;
