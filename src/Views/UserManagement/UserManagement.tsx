import { useMemo, useState } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { MOCK_USERS } from './userManagementMockData';
import {
  INITIAL_COMPANIES,
  INITIAL_ROLES,
  OrgUser,
} from './userManagementTypes';
import './UserManagement.scss';

// ── Icons ─────────────────────────────────────────────────────────

function ShieldUserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6.5c1.38 0 2.5 1.12 2.5 2.5S13.38 12.5 12 12.5 9.5 11.38 9.5 10 10.62 7.5 12 7.5zM12 19c-1.79 0-3.53-.68-4.82-1.9.11-1.44 3.11-2.22 4.82-2.22s4.71.78 4.82 2.22A7.007 7.007 0 0112 19z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 14L7 11.06 8.41 9.65l2.53 2.52 5.65-5.65L18 8.03 10.94 15z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

const ROLE_COLORS = ['navy', 'teal', 'amber', 'green', 'red'];

function roleColorClass(role: string, roles: string[]) {
  const idx = roles.indexOf(role);
  return ROLE_COLORS[idx >= 0 ? idx % ROLE_COLORS.length : 0];
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatLastLogin(iso: string | null) {
  if (!iso) return '—';
  const date = new Date(iso);
  const datePart = date.toLocaleDateString('en-GB');
  const timePart = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  company: '',
  phone: '',
};

// ── Main Page ─────────────────────────────────────────────────────

export default function UserManagement() {
  const [users, setUsers] = useState<OrgUser[]>(MOCK_USERS);
  const roles = INITIAL_ROLES;
  const [companies, setCompanies] = useState<string[]>(INITIAL_COMPANIES);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [pendingCompanies, setPendingCompanies] = useState<string[]>([]);

  const stats = useMemo(
    () => ({
      total: users.length,
      byRole: roles.map((role) => ({
        role,
        count: users.filter((u) => u.role === role).length,
      })),
    }),
    [users, roles]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const q = search.trim().toLowerCase();
        const matchesSearch =
          q === '' ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.company.toLowerCase().includes(q);
        return matchesRole && matchesSearch;
      }),
    [users, search, roleFilter]
  );

  // ── User modal ────────────────────────────────────────────────

  const openCreateUser = () => {
    setEditingUserId(null);
    setUserForm({
      ...EMPTY_FORM,
      role: roles[0] ?? '',
      company: companies[0] ?? '',
    });
    setShowPassword(false);
    setShowUserModal(true);
  };

  const openEditUser = (user: OrgUser) => {
    setEditingUserId(user.id);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      company: user.company,
      phone: user.phone ?? '',
    });
    setShowPassword(false);
    setShowUserModal(true);
  };

  const closeUserModal = () => setShowUserModal(false);

  const saveUser = () => {
    if (
      !userForm.firstName ||
      !userForm.email ||
      !userForm.role ||
      !userForm.company
    )
      return;

    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? {
              ...u,
              firstName: userForm.firstName,
              lastName: userForm.lastName,
              email: userForm.email,
              role: userForm.role,
              company: userForm.company,
              phone: userForm.phone,
            }
            : u
        )
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: `u${Date.now()}`,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          role: userForm.role,
          company: userForm.company,
          phone: userForm.phone,
          lastLogin: null,
        },
      ]);
    }
    setShowUserModal(false);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // ── Company modal ─────────────────────────────────────────────

  const openCompanyModal = () => {
    setNewCompanyName('');
    setPendingCompanies([]);
    setShowCompanyModal(true);
  };

  const addPendingCompany = () => {
    const name = newCompanyName.trim();
    if (!name) return;
    setPendingCompanies((prev) => [...prev, name]);
    setNewCompanyName('');
  };

  const saveCompanies = () => {
    if (pendingCompanies.length)
      setCompanies((prev) => [...prev, ...pendingCompanies]);
    setShowCompanyModal(false);
  };

  return (
    <div className="um">
      <PageHeader />

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="um__hero">
        <span className="um__hero-pill">
          <ShieldUserIcon /> Access Governance
        </span>
        <h1 className="um__hero-title">User and Role Management</h1>
        <p className="um__hero-sub">
          Control admin, logistic team and supplier access from one secure page
          with role assignment, account lifecycle tracking and permission
          oversight.
        </p>
        <div className="um__hero-actions">
          <button
            type="button"
            className="um__hero-btn"
            onClick={openCreateUser}
          >
            Add New User
          </button>
          <button
            type="button"
            className="um__hero-btn"
            onClick={openCompanyModal}
          >
            Add Contractor
          </button>
        </div>
      </div>

      <div className="um__body">
        {/* ── Stats ─────────────────────────────────────────── */}
        <div className="um__stats">
          <div className="um__stat-card">
            <div className="um__stat-top">
              <span className="um__stat-label">Total Users</span>
              <span className="um__stat-icon um__stat-icon--navy">
                <PersonIcon />
              </span>
            </div>
            <div className="um__stat-num">{stats.total}</div>
            <span className="um__stat-tag um__stat-tag--green">
              Total active accounts
            </span>
          </div>

          {stats.byRole.map(({ role, count }) => (
            <div className="um__stat-card" key={role}>
              <div className="um__stat-top">
                <span className="um__stat-label">{role}</span>
                <span
                  className={`um__stat-icon um__stat-icon--${roleColorClass(
                    role,
                    roles
                  )}`}
                >
                  <BadgeIcon />
                </span>
              </div>
              <div className="um__stat-num">{count}</div>
              <span
                className={`um__stat-tag um__stat-tag--${roleColorClass(
                  role,
                  roles
                )}`}
              >
                {role} members
              </span>
            </div>
          ))}
        </div>

        {/* ── User Directory ───────────────────────────────── */}
        <div className="um__card">
          <div className="um__card-header">
            <div>
              <h2 className="um__card-title">User Directory</h2>
              <p className="um__card-sub">
                Search and manage accounts, roles, invitations and status
              </p>
            </div>
            <button
              type="button"
              className="um__add-user-btn"
              onClick={openCreateUser}
            >
              <PlusIcon /> Add User
            </button>
          </div>

          <div className="um__filters">
            <div className="um__search-wrap">
              <SearchIcon />
              <input
                className="um__search-input"
                placeholder="Search by name, email or site..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="um__filter-wrap">
              <FilterIcon />
              <select
                className="um__filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="um__table-wrap">
            <table className="um__table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Organisation</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="um__empty">
                      No users found.
                    </td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="um__user-cell">
                        <span className="um__avatar">
                          {initials(u.firstName, u.lastName)}
                        </span>
                        <div className="um__user-info">
                          <span className="um__user-name">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="um__user-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`um__role-pill um__role-pill--${roleColorClass(
                          u.role,
                          roles
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.company}</td>
                    <td className="um__last-login">
                      {formatLastLogin(u.lastLogin)}
                    </td>
                    <td>
                      <div className="um__row-actions">
                        <button
                          type="button"
                          className="um__icon-btn um__icon-btn--edit"
                          onClick={() => openEditUser(u)}
                          aria-label="Edit user"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="um__icon-btn um__icon-btn--delete"
                          onClick={() => deleteUser(u.id)}
                          aria-label="Delete user"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Create / Edit User Modal ──────────────────────────── */}
      {showUserModal && (
        <div
          className="um-modal-backdrop"
          onClick={closeUserModal}
          role="presentation"
        >
          <div
            className="um-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="um-modal__header">
              <div>
                <h2 className="um-modal__title">
                  {editingUserId ? 'Edit User' : 'Create New User'}
                </h2>
                <p className="um-modal__sub">
                  {editingUserId
                    ? 'Update the details for this user'
                    : 'Fill in the details to add a new user'}
                </p>
              </div>
              <button
                type="button"
                className="um-modal__close"
                onClick={closeUserModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="um-modal__body">
              <div className="um-modal__grid">
                <div className="um__field">
                  <label className="um__label" htmlFor="firstName">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    className="um__input"
                    placeholder="e.g. Jessica"
                    value={userForm.firstName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="um__field">
                  <label className="um__label" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    className="um__input"
                    placeholder="e.g. Carter"
                    value={userForm.lastName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="um__field">
                  <label className="um__label" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="um__input"
                    placeholder="e.g. jessica@sizewell.co.uk"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="um__field">
                  <label className="um__label" htmlFor="password">
                    Password {editingUserId ? '' : '*'}
                  </label>
                  <div className="um__password-wrap">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="um__input"
                      placeholder="Min. 8 characters"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="um__password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>
                <div className="um__field">
                  <label className="um__label" htmlFor="userType">
                    User Type *
                  </label>
                  <select
                    id="userType"
                    className="um__input"
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="um__field">
                  <label className="um__label" htmlFor="company">
                    Company *
                  </label>
                  <select
                    id="company"
                    className="um__input"
                    value={userForm.company}
                    onChange={(e) =>
                      setUserForm({ ...userForm, company: e.target.value })
                    }
                  >
                    <option value="">Select company...</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="um__field um__field--full">
                  <label className="um__label" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    className="um__input"
                    placeholder="e.g. +44 7700 900000"
                    value={userForm.phone}
                    onChange={(e) =>
                      setUserForm({ ...userForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="um-modal__footer">
              <button
                type="button"
                className="um-modal__btn um-modal__btn--cancel"
                onClick={closeUserModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="um-modal__btn um-modal__btn--confirm"
                onClick={saveUser}
              >
                {editingUserId ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Company Modal ─────────────────────────────────── */}
      {showCompanyModal && (
        <div
          className="um-modal-backdrop"
          onClick={() => setShowCompanyModal(false)}
          role="presentation"
        >
          <div
            className="um-modal um-modal--sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="um-modal__header">
              <div>
                <h2 className="um-modal__title">Add Contractor</h2>
                <p className="um-modal__sub">
                  Type a name and click Add, then save all at once
                </p>
              </div>
              <button
                type="button"
                className="um-modal__close"
                onClick={() => setShowCompanyModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="um-modal__body">
              <div className="um__field">
                <label className="um__label" htmlFor="companyName">
                  Contractor Name *
                </label>
                <div className="um__inline-add">
                  <input
                    id="companyName"
                    className="um__input"
                    placeholder="e.g. Wilson James"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="um__inline-add-btn"
                    onClick={addPendingCompany}
                  >
                    <PlusIcon /> Add
                  </button>
                </div>
              </div>
              {pendingCompanies.length > 0 && (
                <ul className="um__pending-list">
                  {pendingCompanies.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="um-modal__footer">
              <button
                type="button"
                className="um-modal__btn um-modal__btn--cancel"
                onClick={() => setShowCompanyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="um-modal__btn um-modal__btn--confirm"
                onClick={saveCompanies}
              >
                Add Contractor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
