import { ChangeEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SpaceFormField from '../Shared/SpaceFormField';
import SpaceToggleSwitch from '../Shared/SpaceToggleSwitch';
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import {
  setModuleEnabled,
  setMobilisationDate,
  setDemobilisationDate,
} from '../../../../Store/RequestForm';
import type { RootState, AppDispatch } from '../../../../Store';
import '../Shared/spaceGeneralForm.scss';

interface SectionAValues {
  srfNumber: string;
  dateRaised: string;
  teamcenterNumber: string;
  revision: string;
  title: string;
  originatorCompanyName: string;
  projectContractRefNumber: string;
  plotFootprint: string;
  developmentSiteType: 'MDS' | 'OSI';
  mainDevelopmentSiteArea: string;
  siteZone: string;
  requestTypeMds: string;
  laydownWarehousePort: string;
  areaOsi: string;
  requestTypeOsi: string;
}

const INITIAL_VALUES: SectionAValues = {
  srfNumber: '',
  dateRaised: '',
  teamcenterNumber: '',
  revision: '',
  title: '',
  originatorCompanyName: '',
  projectContractRefNumber: '',
  plotFootprint: '',
  developmentSiteType: 'MDS',
  mainDevelopmentSiteArea: '',
  siteZone: '',
  requestTypeMds: '',
  laydownWarehousePort: '',
  areaOsi: '',
  requestTypeOsi: '',
};

function SpaceGeneralForm() {
  const [values, setValues] = useState<SectionAValues>(INITIAL_VALUES);
  const dispatch = useDispatch<AppDispatch>();
  const modules = useSelector((state: RootState) => state.requestForm.modules);
  const mobilisationDate = useSelector(
    (state: RootState) => state.requestForm.mobilisationDate
  );
  const demobilisationDate = useSelector(
    (state: RootState) => state.requestForm.demobilisationDate
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleDevelopmentSiteTypeChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const developmentSiteType = event.target
      .value as SectionAValues['developmentSiteType'];
    setValues((prev) => ({ ...prev, developmentSiteType }));
  };

  const isMds = values.developmentSiteType === 'MDS';

  return (
    <div className="sgf">
      <div className="sgf__card">
        <h2 className="sgf__section-title">Section A</h2>
        <div className="sgf__grid">
          <SpaceFormField
            id="srfNumber"
            name="srfNumber"
            label="SRF Number"
            value={values.srfNumber}
            onChange={handleChange}
          />
          <SpaceFormField
            id="dateRaised"
            name="dateRaised"
            label="Date Raised"
            type="date"
            value={values.dateRaised}
            onChange={handleChange}
            required
          />
          <SpaceFormField
            id="teamcenterNumber"
            name="teamcenterNumber"
            label="Teamcenter Number"
            value={values.teamcenterNumber}
            onChange={handleChange}
            required
          />
          <SpaceFormField
            id="revision"
            name="revision"
            label="Revision"
            value={values.revision}
            onChange={handleChange}
            required
          />
          <SpaceFormField
            id="title"
            name="title"
            label="Title"
            value={values.title}
            onChange={handleChange}
            required
            wide
          />
          <SpaceFormField
            id="originatorCompanyName"
            name="originatorCompanyName"
            label="Originator Company Name"
            value={values.originatorCompanyName}
            onChange={handleChange}
            required
          />
          <SpaceFormField
            id="projectContractRefNumber"
            name="projectContractRefNumber"
            label="Project / Contract Ref Number"
            value={values.projectContractRefNumber}
            onChange={handleChange}
            required
          />
          <SpaceFormField
            id="mobilisationDate"
            name="mobilisationDate"
            label="Mobilisation Date"
            type="date"
            value={mobilisationDate}
            onChange={(event) =>
              dispatch(setMobilisationDate(event.target.value))
            }
            required
          />
          <SpaceFormField
            id="demobilisationDate"
            name="demobilisationDate"
            label="Demobilisation Date"
            type="date"
            value={demobilisationDate}
            onChange={(event) =>
              dispatch(setDemobilisationDate(event.target.value))
            }
            required
          />
          <SpaceFormField
            id="plotFootprint"
            name="plotFootprint"
            label="Work Area / Service Plot Footprint M2"
            value={values.plotFootprint}
            onChange={handleChange}
            required
            wide
          />
          <div className="sgf__field">
            <label htmlFor="developmentSiteType">
              Main Development Site (or Off-Site Infrastructure)
              <select
                id="developmentSiteType"
                name="developmentSiteType"
                value={values.developmentSiteType}
                onChange={handleDevelopmentSiteTypeChange}
              >
                <option value="MDS">On-Site (MDS)</option>
                <option value="OSI">Off-Site (OSI)</option>
              </select>
            </label>
          </div>
        </div>

        {isMds ? (
          <div className="sgf__subsection">
            <h3 className="sgf__subsection-title">
              MDS <span>To be completed if MDS</span>
            </h3>
            <div className="sgf__grid">
              <SpaceFormField
                id="mainDevelopmentSiteArea"
                name="mainDevelopmentSiteArea"
                label="Main Development Site Area"
                value={values.mainDevelopmentSiteArea}
                onChange={handleChange}
                required
              />
              <SpaceFormField
                id="siteZone"
                name="siteZone"
                label="Site Zone"
                value={values.siteZone}
                onChange={handleChange}
                required
              />
              <SpaceFormField
                id="requestTypeMds"
                name="requestTypeMds"
                label="Request Type"
                value={values.requestTypeMds}
                onChange={handleChange}
                required
                wide
              />
            </div>
          </div>
        ) : (
          <div className="sgf__subsection">
            <h3 className="sgf__subsection-title">
              OSI <span>To be completed if OSI</span>
            </h3>
            <div className="sgf__grid">
              <SpaceFormField
                id="laydownWarehousePort"
                name="laydownWarehousePort"
                label="Laydown / Warehouse / Port"
                value={values.laydownWarehousePort}
                onChange={handleChange}
                required
              />
              <SpaceFormField
                id="areaOsi"
                name="areaOsi"
                label="Area"
                value={values.areaOsi}
                onChange={handleChange}
                required
              />
              <SpaceFormField
                id="requestTypeOsi"
                name="requestTypeOsi"
                label="Request Type"
                value={values.requestTypeOsi}
                onChange={handleChange}
                required
                wide
              />
            </div>
          </div>
        )}
      </div>

      <div className="sgf__card">
        <h2 className="sgf__section-title">Enable Modules</h2>
        <p className="sgf__section-hint">
          Switch on the modules that apply to this request. Each enabled module
          adds a dedicated tab to the sidebar.
        </p>
        <div className="sgf__toggles">
          {REQUEST_FORM_MODULES.map((moduleConfig) => (
            <SpaceToggleSwitch
              key={moduleConfig.key}
              id={`module-toggle-${moduleConfig.key}`}
              label={moduleConfig.label}
              checked={modules[moduleConfig.key]}
              onChange={(enabled) =>
                dispatch(
                  setModuleEnabled({ module: moduleConfig.key, enabled })
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpaceGeneralForm;
