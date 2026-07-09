export interface OrgUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  company: string;
  lastLogin: string | null;
}

export const INITIAL_ROLES: string[] = ['Role 1', 'Role 2', 'Role 3'];

export const INITIAL_COMPANIES: string[] = [
  'Sizewell C',
  'Bylor JV',
  'Altrad Services',
];
