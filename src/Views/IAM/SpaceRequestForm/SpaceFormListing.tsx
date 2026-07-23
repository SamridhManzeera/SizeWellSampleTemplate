import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import { REQUEST_FORM_MODULES } from '../../../Shared/requestFormModules';
import { ROUTES } from '../../../Shared/Constants';
import { useSpaceRequests } from './SpaceRequestsContext';
import type { SpaceRequestStatus } from './spaceRequestFormTypes';
import './SpaceFormListing.scss';

function BuildingIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 21V3h10v6h4v12h-6v-4h-2v4H5zm2-2h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V9H7v2zm0-4h2V5H7v2zm4 8h2v-2h-2v2zm0-4h2V9h-2v2zm0-4h2V5h-2v2zm6 12h2v-2h-2v2zm0-4h2v-2h-2v2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function SpaceFormListing() {
  const navigate = useNavigate();
  const { requests } = useSpaceRequests();
  const [statusFilter, setStatusFilter] = useState<SpaceRequestStatus | 'all'>(
    'all'
  );

  const total = requests.length;
  const submitted = requests.filter((r) => r.status === 'Submitted').length;
  const approved = requests.filter((r) => r.status === 'Approved').length;
  const rejected = requests.filter((r) => r.status === 'Rejected').length;

  const filtered =
    statusFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  return (
    <div className="sfl">
      <PageHeader />

      <PageHero
        icon={<BuildingIcon />}
        title="Space Requests"
        subtitle="Track space requests and jump straight to an enabled module."
        eyebrow="Contractor"
        actions={
          <button
            type="button"
            className="sfl__new-btn"
            onClick={() => navigate(ROUTES.SPACE_REQUESTS_NEW)}
          >
            <PlusIcon />
            Fill Out Request
          </button>
        }
      />

      <div className="sfl__stats">
        <div className="sfl__stat">
          <span className="sfl__stat-num">{total}</span>
          <span className="sfl__stat-label">Total</span>
        </div>
        <div className="sfl__stat sfl__stat--submitted">
          <span className="sfl__stat-num">{submitted}</span>
          <span className="sfl__stat-label">Submitted</span>
        </div>
        <div className="sfl__stat sfl__stat--approved">
          <span className="sfl__stat-num">{approved}</span>
          <span className="sfl__stat-label">Approved</span>
        </div>
        <div className="sfl__stat sfl__stat--rejected">
          <span className="sfl__stat-num">{rejected}</span>
          <span className="sfl__stat-label">Rejected</span>
        </div>
      </div>

      <div className="sfl__list-section">
        <div className="sfl__list-header">
          <h2 className="sfl__list-title">My Requests</h2>

          <div className="sfl__filter-wrap">
            <label className="sfl__filter-label" htmlFor="space-status-filter">
              Status
            </label>
            <select
              id="space-status-filter"
              className="sfl__filter-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as SpaceRequestStatus | 'all')
              }
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="sfl__table-wrap">
          <table className="sfl__table">
            <thead>
              <tr>
                <th>SRF Number</th>
                <th>Title</th>
                <th>Company</th>
                <th>Mobilisation Date</th>
                <th>Status</th>
                <th>Modules</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="sfl__empty">
                    No requests found.
                  </td>
                </tr>
              )}
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="sfl__srf-id">{row.srfNumber}</span>
                  </td>
                  <td className="sfl__title-cell">{row.title}</td>
                  <td>{row.originatorCompanyName}</td>
                  <td>{row.mobilisationDate}</td>
                  <td>
                    <span
                      className={`sfl__status sfl__status--${row.status.toLowerCase()}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="sfl__modules">
                      {REQUEST_FORM_MODULES.map((moduleConfig) => {
                        const isEnabled = row.modules[moduleConfig.key];
                        return isEnabled ? (
                          <Link
                            key={moduleConfig.key}
                            to={`${ROUTES.SPACE_REQUESTS}/${row.id}/${moduleConfig.segment}`}
                            className="sfl__module-chip sfl__module-chip--enabled"
                          >
                            {moduleConfig.label}
                          </Link>
                        ) : (
                          <span
                            key={moduleConfig.key}
                            className="sfl__module-chip sfl__module-chip--disabled"
                          >
                            {moduleConfig.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="sfl__actions">
                      <Link
                        to={`${ROUTES.SPACE_REQUESTS}/${row.id}`}
                        className="sfl__action-btn"
                      >
                        <EyeIcon />
                        <span>View</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SpaceFormListing;
