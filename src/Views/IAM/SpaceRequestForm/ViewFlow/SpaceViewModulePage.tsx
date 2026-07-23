import type { SpaceRequestRecord } from '../spaceRequestFormTypes';
import '../Shared/spaceGeneralForm.scss';

interface SpaceViewModulePageProps {
  request: SpaceRequestRecord;
  label: string;
}

function SpaceViewModulePage({ request, label }: SpaceViewModulePageProps) {
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
