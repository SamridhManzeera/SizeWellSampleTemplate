import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../Shared/Constants';
import type { RequestFormModuleKey } from '../../../../Store/RequestForm';
import type { RootState } from '../../../../Store';
import '../Shared/spaceGeneralForm.scss';

interface SpaceModulePageProps {
  moduleKey: RequestFormModuleKey;
  label: string;
}

function SpaceModulePage({ moduleKey, label }: SpaceModulePageProps) {
  const isEnabled = useSelector(
    (state: RootState) => state.requestForm.modules[moduleKey]
  );

  if (!isEnabled) {
    return (
      <div className="sgf__card">
        <h2 className="sgf__section-title">{label}</h2>
        <p>
          This module isn&apos;t enabled for this request yet. Turn it on from
          the{' '}
          <Link to={`${ROUTES.SPACE_REQUESTS_NEW}/general`}>General form</Link>{' '}
          to access it here.
        </p>
      </div>
    );
  }

  return (
    <div className="sgf__card">
      <h2 className="sgf__section-title">{label}</h2>
      <p>The {label} form will be available here soon.</p>
    </div>
  );
}

export default SpaceModulePage;
