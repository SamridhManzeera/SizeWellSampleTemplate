import { useState } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import './Profile.scss';

// ── Icons ─────────────────────────────────────────────────────────

function ProfileIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.65 10A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

// ── Field helper ──────────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="pf__field">
      <span className="pf__label">{label}</span>
      <div className="pf__read-val">{value}</div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────

interface ProfileData {
  fullName: string;
  role: string;
  company: string;
  supplierId: string;
  email: string;
  phone: string;
}

const INITIAL_PROFILE: ProfileData = {
  fullName: 'Tom Holland',
  role: 'Manager',
  company: 'SizeWell',
  supplierId: '69c6239948608197ccefae0a',
  email: 'tomholland@sizewell.co.uk',
  phone: '08360152479',
};

// ── Main Page ─────────────────────────────────────────────────────

export default function Profile() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(INITIAL_PROFILE);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const isView = mode === 'view';

  const startEdit = () => {
    setDraft(profile);
    setMode('edit');
  };

  const cancelEdit = () => {
    setDraft(profile);
    setMode('view');
  };

  const saveEdit = () => {
    setProfile(draft);
    setMode('view');
  };

  return (
    <div className="pf">
      <PageHeader />

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="pf__hero">
        <div className="pf__hero-left">
          <div className="pf__hero-icon">
            <ProfileIcon />
          </div>
          <div>
            <h1 className="pf__hero-title">Profile</h1>
            <p className="pf__hero-sub">
              Manage your supplier details, contact information, and
              notification preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="pf__body">
        <div className="pf__row">
          {/* ── Account details ──────────────────────────────── */}
          <div className="pf__card pf__card--wide">
            <div className="pf__card-header">
              <div className="pf__card-title-wrap">
                <span className="pf__card-icon">
                  <BriefcaseIcon />
                </span>
                <h2 className="pf__card-title">Account details</h2>
              </div>
              {isView ? (
                <button
                  type="button"
                  className="pf__edit-btn"
                  onClick={startEdit}
                >
                  <EditIcon /> Edit
                </button>
              ) : (
                <div className="pf__edit-actions">
                  <button
                    type="button"
                    className="pf__cancel-btn"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="pf__save-btn"
                    onClick={saveEdit}
                  >
                    Save changes
                  </button>
                </div>
              )}
            </div>

            <div className="pf__grid">
              {isView ? (
                <ReadField label="Full Name" value={profile.fullName} />
              ) : (
                <div className="pf__field">
                  <label className="pf__label" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    className="pf__input"
                    value={draft.fullName}
                    onChange={(e) =>
                      setDraft({ ...draft, fullName: e.target.value })
                    }
                  />
                </div>
              )}

              <ReadField label="Role" value={profile.role} />

              {isView ? (
                <ReadField label="Company" value={profile.company} />
              ) : (
                <div className="pf__field">
                  <label className="pf__label" htmlFor="company">
                    Company
                  </label>
                  <input
                    id="company"
                    className="pf__input"
                    value={draft.company}
                    onChange={(e) =>
                      setDraft({ ...draft, company: e.target.value })
                    }
                  />
                </div>
              )}

              <ReadField label="User ID" value={profile.supplierId} />

              {isView ? (
                <ReadField label="Email" value={profile.email} />
              ) : (
                <div className="pf__field">
                  <label className="pf__label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="pf__input"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft({ ...draft, email: e.target.value })
                    }
                  />
                </div>
              )}

              {isView ? (
                <ReadField label="Phone" value={profile.phone} />
              ) : (
                <div className="pf__field">
                  <label className="pf__label" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    className="pf__input"
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft({ ...draft, phone: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Security ─────────────────────────────────────── */}
          <div className="pf__card pf__card--narrow">
            <div className="pf__card-header">
              <div className="pf__card-title-wrap">
                <span className="pf__card-icon">
                  <ShieldIcon />
                </span>
                <h2 className="pf__card-title">Security</h2>
              </div>
            </div>

            <div className="pf__security-row">
              <div>
                <p className="pf__security-title">Password</p>
                <p className="pf__security-sub">
                  Update your password regularly to keep your account secure.
                </p>
              </div>
              <button
                type="button"
                className="pf__change-btn"
                onClick={() => setShowPasswordModal(true)}
              >
                <KeyIcon /> Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Change Password Modal ────────────────────────────── */}
      {showPasswordModal && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setShowPasswordModal(false)}
          role="presentation"
        >
          <div
            className="pf-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="pf-modal__header">
              <h2 className="pf-modal__title">Change Password</h2>
              <button
                type="button"
                className="pf-modal__close"
                onClick={() => setShowPasswordModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="pf-modal__body">
              <div className="pf__field">
                <label className="pf__label" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className="pf__input"
                />
              </div>
              <div className="pf__field">
                <label className="pf__label" htmlFor="newPassword">
                  New Password
                </label>
                <input id="newPassword" type="password" className="pf__input" />
              </div>
              <div className="pf__field">
                <label className="pf__label" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="pf__input"
                />
              </div>
            </div>
            <div className="pf-modal__footer">
              <button
                type="button"
                className="pf-modal__btn pf-modal__btn--cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pf-modal__btn pf-modal__btn--confirm"
                onClick={() => setShowPasswordModal(false)}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
