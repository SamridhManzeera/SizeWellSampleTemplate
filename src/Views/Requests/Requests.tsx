import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useRequests } from './RequestsContext';
import { RequestStatus } from './requestTypes';
import './Requests.scss';

// ── Icons ─────────────────────────────────────────────────────────

function TruckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
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

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatSubmitted(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Main Page ─────────────────────────────────────────────────────

export default function Requests() {
  const navigate = useNavigate();
  const { requests } = useRequests();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  const filtered = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  return (
    <div className="rq">
      <PageHeader />

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="rq__hero">
        <div className="rq__hero-left">
          <div className="rq__hero-icon"><TruckIcon /></div>
          <div>
            <h1 className="rq__hero-title">Delivery Requests</h1>
            <p className="rq__hero-sub">Manage and track all delivery slot requests for Sizewell C</p>
          </div>
        </div>
        <button type="button" className="rq__apply-btn" onClick={() => navigate('/requests/apply')}>
          <PlusIcon />
          Apply Request
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="rq__stats">
        <div className="rq__stat">
          <span className="rq__stat-num">{total}</span>
          <span className="rq__stat-label">Total</span>
        </div>
        <div className="rq__stat rq__stat--pending">
          <span className="rq__stat-num">{pending}</span>
          <span className="rq__stat-label">Pending</span>
        </div>
        <div className="rq__stat rq__stat--approved">
          <span className="rq__stat-num">{approved}</span>
          <span className="rq__stat-label">Approved</span>
        </div>
        <div className="rq__stat rq__stat--rejected">
          <span className="rq__stat-num">{rejected}</span>
          <span className="rq__stat-label">Rejected</span>
        </div>
      </div>

      {/* ── List section ────────────────────────────────────── */}
      <div className="rq__list-section">
        <div className="rq__list-header">
          <h2 className="rq__list-title">Applied Requests</h2>

          <div className="rq__filter-wrap">
            <label className="rq__filter-label" htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              className="rq__filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as RequestStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="rq__table-wrap">
          <table className="rq__table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>Delivery Date</th>
                <th>Slots</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="rq__empty">No requests found.</td></tr>
              )}
              {filtered.map(req => (
                <tr key={req.id}>
                  <td><span className="rq__req-id">{req.id}</span></td>
                  <td>
                    <span className={`rq__kind rq__kind--${req.kind}`}>
                      {req.kind === 'emergency' ? '⚡ Emergency' : 'Normal'}
                    </span>
                  </td>
                  <td>{formatDate(req.deliveryDate)}</td>
                  <td>
                    <div className="rq__slots">
                      {req.inboundCount  > 0 && <span className="rq__slot-chip rq__slot-chip--in">↑ {req.inboundCount}</span>}
                      {req.outboundCount > 0 && <span className="rq__slot-chip rq__slot-chip--out">↓ {req.outboundCount}</span>}
                      {req.twoWayCount   > 0 && <span className="rq__slot-chip rq__slot-chip--tw">↕ {req.twoWayCount}</span>}
                      <span className="rq__slot-total">{req.inboundCount + req.outboundCount + req.twoWayCount * 2}</span>
                    </div>
                  </td>
                  <td className="rq__submitted">{formatSubmitted(req.submittedAt)}</td>
                  <td>
                    <span className={`rq__status rq__status--${req.status}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="rq__actions">
                      <button
                        type="button"
                        className="rq__action-btn rq__action-btn--view"
                        onClick={() => navigate(`/requests/${req.id}`)}
                      ><EyeIcon /><span>View</span></button>
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
