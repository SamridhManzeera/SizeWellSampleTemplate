import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import WorkforceChart from '../../../../Components/Charts/WorkforceChart/WorkforceChart';
import {
  formatMonthLabel,
  generateMonthRange,
} from '../../../../Components/Charts/WorkforceChart/monthRange';
import type { RootState } from '../../../../Store';
import '../Shared/spaceGeneralForm.scss';

const DEFAULT_COUNT = 0;

interface SpaceWorkforceFormProps {
  onGoToGeneral: () => void;
}

function SpaceWorkforceForm({ onGoToGeneral }: SpaceWorkforceFormProps) {
  const mobilisationDate = useSelector(
    (state: RootState) => state.requestForm.mobilisationDate
  );
  const demobilisationDate = useSelector(
    (state: RootState) => state.requestForm.demobilisationDate
  );
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [bulkValue, setBulkValue] = useState(DEFAULT_COUNT);

  const months = useMemo(
    () => generateMonthRange(mobilisationDate, demobilisationDate),
    [mobilisationDate, demobilisationDate]
  );
  const values = months.map((monthKey) => counts[monthKey] ?? DEFAULT_COUNT);

  const handleCountChange = (monthKey: string, rawValue: string) => {
    const parsed = Number(rawValue);
    setCounts((prev) => ({
      ...prev,
      [monthKey]: Number.isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handleApplyToAll = () => {
    setCounts((prev) => {
      const next = { ...prev };
      months.forEach((monthKey) => {
        next[monthKey] = bulkValue;
      });
      return next;
    });
  };

  if (months.length === 0) {
    return (
      <div className="sgf__card">
        <h2 className="sgf__section-title">Workforce (no. of people)</h2>
        <p>
          Set a Mobilisation Date and Demobilisation Date in the{' '}
          <button
            type="button"
            className="sgf__inline-link"
            onClick={onGoToGeneral}
          >
            General
          </button>{' '}
          section to plan monthly workforce numbers for that period.
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
          Mobilisation and Demobilisation dates set in{' '}
          <button
            type="button"
            className="sgf__inline-link"
            onClick={onGoToGeneral}
          >
            General
          </button>
          .
        </p>
        <WorkforceChart labels={months.map(formatMonthLabel)} values={values} />
      </div>

      <div className="sgf__card">
        <h2 className="sgf__section-title">Monthly Headcount</h2>
        <p className="sgf__section-hint">
          Set the peak workforce for each month in the selected range.
        </p>

        <div className="sgf__bulk-actions">
          <label htmlFor="spaceWorkforceBulkValue">
            Apply a count to every month
            <input
              id="spaceWorkforceBulkValue"
              type="number"
              min={0}
              value={bulkValue}
              onChange={(event) =>
                setBulkValue(Math.max(0, Number(event.target.value) || 0))
              }
            />
          </label>
          <button
            type="button"
            className="sgf__bulk-apply"
            onClick={handleApplyToAll}
          >
            Apply to all months
          </button>
        </div>

        <div className="sgf__count-grid">
          {months.map((monthKey) => (
            <div key={monthKey} className="sgf__field">
              <label htmlFor={`space-workforce-count-${monthKey}`}>
                {formatMonthLabel(monthKey)}
                <input
                  id={`space-workforce-count-${monthKey}`}
                  type="number"
                  min={0}
                  value={counts[monthKey] ?? DEFAULT_COUNT}
                  onChange={(event) =>
                    handleCountChange(monthKey, event.target.value)
                  }
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpaceWorkforceForm;
