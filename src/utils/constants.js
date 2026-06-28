export const ROLES = {
  ADMIN: 'Admin',
  TECHNICIAN: 'Technician',
  END_USER: 'End User',
};

export const CATEGORIES = [
  'Hardware',
  'Software',
  'Network',
  'Microsoft 365',
  'Account Access',
  'Printer',
  'Email',
  'Security',
  'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const STATUSES = ['Open', 'In Progress', 'Waiting on User', 'Resolved', 'Closed'];

export const priorityWeight = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};
