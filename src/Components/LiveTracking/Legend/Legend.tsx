import './Legend.scss';

export default function Legend() {
  return (
    <div className="lt-legend">
      <h4 className="lt-legend__title">Legend</h4>
      <ul className="lt-legend__list">
        <li className="lt-legend__item">
          <span className="lt-legend__color lt-legend__color--green" />
          <span className="lt-legend__text">Correct Route</span>
        </li>
        <li className="lt-legend__item">
          <span className="lt-legend__color lt-legend__color--red" />
          <span className="lt-legend__text">Incorrect Route</span>
        </li>
        <li className="lt-legend__item">
          <span className="lt-legend__icon">🚚</span>
          <span className="lt-legend__text">Current Position</span>
        </li>
      </ul>
    </div>
  );
}
