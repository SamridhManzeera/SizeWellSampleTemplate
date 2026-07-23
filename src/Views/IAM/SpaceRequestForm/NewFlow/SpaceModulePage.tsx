import '../Shared/spaceGeneralForm.scss';

interface SpaceModulePageProps {
  label: string;
}

function SpaceModulePage({ label }: SpaceModulePageProps) {
  return (
    <div className="sgf__card">
      <h2 className="sgf__section-title">{label}</h2>
      <p>The {label} form will be available here soon.</p>
    </div>
  );
}

export default SpaceModulePage;
