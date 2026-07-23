import { Link, useOutletContext } from 'react-router-dom';
import { ROUTES } from '../../../../Shared/Constants';
import type { RequestFormModuleKey } from '../../../../Store/RequestForm';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';
import '../Shared/spaceGeneralForm.scss';

interface SpaceViewModulePageProps {
  moduleKey: RequestFormModuleKey;
  label: string;
}

function SpaceViewModulePage({ moduleKey, label }: SpaceViewModulePageProps) {
  const request = useOutletContext<SpaceRequestRecord>();
  const isEnabled = request.modules[moduleKey];
  const generalPath = `${ROUTES.SPACE_REQUESTS}/${request.id}/general`;

  if (!isEnabled) {
    return (
      <div className="sgf__card">
        <h2 className="sgf__section-title">{label}</h2>
        <p>
          This module wasn&apos;t enabled for SRF {request.srfNumber}. Go back
          to <Link to={generalPath}>General</Link> to see what was submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="sgf__card">
      <h2 className="sgf__section-title">{label}</h2>
      <p>
        The {label} details for SRF {request.srfNumber} will be available here
        soon.
      </p>
    </div>
  );
}

export default SpaceViewModulePage;
