import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../../Components/Layouts/PageHero/PageHero';
import { REQUEST_FORM_MODULES } from '../../../Shared/requestFormModules';
import { ROUTES } from '../../../Shared/Constants';
import { useSpaceRequests } from '../SpaceRequestForm/SpaceRequestsContext';
import type { SpaceRequestStatus } from '../SpaceRequestForm/spaceRequestFormTypes';
import type { RequestFormModuleKey } from '../../../Store/RequestForm';
import '../SpaceRequestForm/SpaceFormListing.scss';

interface ReviewerRequestListingProps {
  moduleKey: RequestFormModuleKey;
  label: string;
}

function ClipboardIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z" />
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

function ReviewerRequestListing({
  moduleKey,
  label,
}: ReviewerRequestListingProps) {
  const { requests: allRequests, updateRequestStatus } = useSpaceRequests();
  const [statusFilter, setStatusFilter] = useState<SpaceRequestStatus | 'all'>(
    'all'
  );

  const requests = allRequests.filter((r) => r.modules[moduleKey]);
  const sectionSegment =
    REQUEST_FORM_MODULES.find((m) => m.key === moduleKey)?.segment ?? '';

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
        icon={<ClipboardIcon />}
        title={`${label} Requests`}
        subtitle={`Review submitted requests that have the ${label} module enabled.`}
        eyebrow="Reviewer"
        actions={null}
      />

      <div className="sfl__stats">
        <div className="sfl__stat">
          <span className="sfl__stat-num">{total}</span>
          <span className="sfl__stat-label">Total</span>
        </div>
        <div className="sfl__stat sfl__stat--submitted">
          <span className="sfl__stat-num">{submitted}</span>
          <span className="sfl__stat-label">Pending Review</span>
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
          <h2 className="sfl__list-title">Requests</h2>

          <div className="sfl__filter-wrap">
            <label
              className="sfl__filter-label"
              htmlFor="reviewer-status-filter"
            >
              Status
            </label>
            <select
              id="reviewer-status-filter"
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="sfl__empty">
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
                    <select
                      className="sfl__status-select"
                      value={row.status}
                      onChange={(e) =>
                        updateRequestStatus(row.id, e.target.value as any)
                      }
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </td>
                  <td>
                    <div className="sfl__actions">
                      <Link
                        to={`${ROUTES.REVIEWER_REQUESTS}/${row.id}?section=${sectionSegment}`}
                        className="sfl__action-btn"
                      >
                        <EyeIcon />
                        <span>Review</span>
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

export default ReviewerRequestListing;
