import WorkforceChart from '../../../../Components/Charts/WorkforceChart/WorkforceChart';
import {
  formatMonthLabel,
  generateMonthRange,
  ukDateToMonthKey,
} from '../../../../Components/Charts/WorkforceChart/monthRange';
import type { SpaceRequestRecord } from '../spaceRequestFormTypes';
import '../Shared/spaceGeneralForm.scss';

interface SpaceViewWorkforceFormProps {
  request: SpaceRequestRecord;
}

function SpaceViewWorkforceForm({ request }: SpaceViewWorkforceFormProps) {
  const months = generateMonthRange(
    ukDateToMonthKey(request.mobilisationDate),
    ukDateToMonthKey(request.demobilisationDate)
  );
  const { counts } = request.workforceData;
  const values = months.map((monthKey) => counts[monthKey] ?? 0);

  if (months.length === 0) {
    return (
      <div className="sgf__card">
        <h2 className="sgf__section-title">Workforce (no. of people)</h2>
        <p>
          No Mobilisation / Demobilisation date range was submitted for SRF{' '}
          {request.srfNumber}.
        </p>
      </div>
    );
  }

  return (
    <div className="sgf">
      <div className="sgf__card">
        <h2 className="sgf__section-title">Workforce (no. of people)</h2>
        <p className="sgf__section-hint">
          Planning for {formatMonthLabel(months[0])} –{' '}
          {formatMonthLabel(months[months.length - 1])}, based on the
          Mobilisation and Demobilisation dates in{' '}
          <a href="#section-general">General</a>.
        </p>
        <WorkforceChart labels={months.map(formatMonthLabel)} values={values} />
      </div>

      <div className="sgf__card">
        <h2 className="sgf__section-title">Monthly Headcount</h2>
        <div className="sgf__count-grid">
          {months.map((monthKey) => (
            <div key={monthKey} className="sgf__field">
              <label htmlFor={`view-workforce-count-${monthKey}`}>
                {formatMonthLabel(monthKey)}
                <input
                  id={`view-workforce-count-${monthKey}`}
                  type="number"
                  value={counts[monthKey] ?? 0}
                  readOnly
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpaceViewWorkforceForm;
