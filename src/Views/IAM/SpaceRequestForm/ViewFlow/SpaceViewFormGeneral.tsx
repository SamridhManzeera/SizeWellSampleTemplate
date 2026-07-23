import { useOutletContext } from 'react-router-dom';
import SpaceFormField from '../Shared/SpaceFormField';
import SpaceToggleSwitch from '../Shared/SpaceToggleSwitch';
import { REQUEST_FORM_MODULES } from '../../../../Shared/requestFormModules';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';
import '../Shared/spaceGeneralForm.scss';

function SpaceViewFormGeneral() {
  const request = useOutletContext<SpaceRequestRecord>();
  const isMds = request.developmentSiteType === 'MDS';

  return (
    <div className="sgf">
      <div className="sgf__card">
        <h2 className="sgf__section-title">Section A</h2>
        <div className="sgf__grid">
          <SpaceFormField
            id="srfNumber"
            name="srfNumber"
            label="SRF Number"
            value={request.srfNumber}
            readOnly
          />
          <SpaceFormField
            id="dateRaised"
            name="dateRaised"
            label="Date Raised"
            value={request.dateRaised}
            readOnly
          />
          <SpaceFormField
            id="teamcenterNumber"
            name="teamcenterNumber"
            label="Teamcenter Number"
            value={request.teamcenterNumber}
            readOnly
          />
          <SpaceFormField
            id="revision"
            name="revision"
            label="Revision"
            value={request.revision}
            readOnly
          />
          <SpaceFormField
            id="title"
            name="title"
            label="Title"
            value={request.title}
            readOnly
            wide
          />
          <SpaceFormField
            id="originatorCompanyName"
            name="originatorCompanyName"
            label="Originator Company Name"
            value={request.originatorCompanyName}
            readOnly
          />
          <SpaceFormField
            id="projectContractRefNumber"
            name="projectContractRefNumber"
            label="Project / Contract Ref Number"
            value={request.projectContractRefNumber}
            readOnly
          />
          <SpaceFormField
            id="mobilisationDate"
            name="mobilisationDate"
            label="Mobilisation Date"
            value={request.mobilisationDate}
            readOnly
          />
          <SpaceFormField
            id="demobilisationDate"
            name="demobilisationDate"
            label="Demobilisation Date"
            value={request.demobilisationDate}
            readOnly
          />
          <SpaceFormField
            id="plotFootprint"
            name="plotFootprint"
            label="Work Area / Service Plot Footprint M2"
            value={request.plotFootprint}
            readOnly
            wide
          />
          <div className="sgf__field">
            <label htmlFor="developmentSiteType">
              Main Development Site (or Off-Site Infrastructure)
              <select
                id="developmentSiteType"
                name="developmentSiteType"
                value={request.developmentSiteType}
                disabled
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
                value={request.mainDevelopmentSiteArea}
                readOnly
              />
              <SpaceFormField
                id="siteZone"
                name="siteZone"
                label="Site Zone"
                value={request.siteZone}
                readOnly
              />
              <SpaceFormField
                id="requestTypeMds"
                name="requestTypeMds"
                label="Request Type"
                value={request.requestTypeMds}
                readOnly
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
                value={request.laydownWarehousePort}
                readOnly
              />
              <SpaceFormField
                id="areaOsi"
                name="areaOsi"
                label="Area"
                value={request.areaOsi}
                readOnly
              />
              <SpaceFormField
                id="requestTypeOsi"
                name="requestTypeOsi"
                label="Request Type"
                value={request.requestTypeOsi}
                readOnly
                wide
              />
            </div>
          </div>
        )}
      </div>

      <div className="sgf__card">
        <h2 className="sgf__section-title">Enabled Modules</h2>
        <p className="sgf__section-hint">
          Modules enabled for this request. Use the sidebar to open one.
        </p>
        <div className="sgf__toggles">
          {REQUEST_FORM_MODULES.map((moduleConfig) => (
            <SpaceToggleSwitch
              key={moduleConfig.key}
              id={`view-module-${moduleConfig.key}`}
              label={moduleConfig.label}
              checked={request.modules[moduleConfig.key]}
              disabled
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpaceViewFormGeneral;
