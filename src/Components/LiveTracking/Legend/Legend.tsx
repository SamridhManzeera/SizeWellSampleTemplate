import './Legend.scss';

export default function Legend() {
  return (
    <div className="lt-legend">
      <h4 className="lt-legend__title">Legend</h4>
      <ul className="lt-legend__list">
        <li className="lt-legend__item">
          <span className="lt-legend__dot lt-legend__dot--a" />
          <span className="lt-legend__text">Contractor A</span>
        </li>
        <li className="lt-legend__item">
          <span className="lt-legend__dot lt-legend__dot--b" />
          <span className="lt-legend__text">Contractor B</span>
        </li>
        <li className="lt-legend__item">
          <span className="lt-legend__dot lt-legend__dot--c" />
          <span className="lt-legend__text">Contractor C</span>
        </li>
        <li className="lt-legend__item">
          <span className="lt-legend__dot lt-legend__dot--d" />
          <span className="lt-legend__text">Contractor D</span>
        </li>
        <li className="lt-legend__item">
          <span className="lt-legend__vehicle-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </span>
          <span className="lt-legend__text">Vehicle Marker</span>
        </li>
      </ul>
    </div>
  );
}
