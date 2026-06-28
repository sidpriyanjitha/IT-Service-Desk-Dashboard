import { subHours, subDays } from 'date-fns';
import { calculateDueDate } from '../utils/sla';

export const demoUsers = [
  { id: 'u-admin', full_name: 'Sid Priyanjitha', email: 'admin@servicedesk.dev', role: 'Admin', department: 'IT Operations', is_active: true, password: 'password123' },
  { id: 'u-tech-1', full_name: 'Maya Chen', email: 'maya.chen@servicedesk.dev', role: 'Technician', department: 'Infrastructure', is_active: true, password: 'password123' },
  { id: 'u-tech-2', full_name: 'Jordan Miles', email: 'jordan.miles@servicedesk.dev', role: 'Technician', department: 'Endpoint Support', is_active: true, password: 'password123' },
  { id: 'u-tech-3', full_name: 'Sam Okafor', email: 'sam.okafor@servicedesk.dev', role: 'Technician', department: 'Security', is_active: true, password: 'password123' },
  { id: 'u-user-1', full_name: 'Priya Shah', email: 'priya.shah@servicedesk.dev', role: 'End User', department: 'Finance', is_active: true, password: 'password123' },
  { id: 'u-user-2', full_name: 'Noah Wilson', email: 'noah.wilson@servicedesk.dev', role: 'End User', department: 'Sales', is_active: true, password: 'password123' },
  { id: 'u-user-3', full_name: 'Grace Lee', email: 'grace.lee@servicedesk.dev', role: 'End User', department: 'People', is_active: false, password: 'password123' },
];

const ticketSeeds = [
  ['VPN disconnects during client calls', 'Network', 'Critical', 'In Progress', 'u-user-2', 'u-tech-1', 3],
  ['Laptop battery swollen on finance device', 'Hardware', 'Critical', 'Open', 'u-user-1', 'u-tech-2', 5],
  ['Cannot access shared mailbox', 'Microsoft 365', 'High', 'Waiting on User', 'u-user-1', 'u-tech-1', 12],
  ['Printer queue stuck on level 4', 'Printer', 'Medium', 'Open', 'u-user-2', 'u-tech-2', 18],
  ['Password reset loop after MFA enrollment', 'Account Access', 'High', 'Resolved', 'u-user-3', 'u-tech-3', 30],
  ['Suspicious email reported by sales team', 'Security', 'Critical', 'Closed', 'u-user-2', 'u-tech-3', 40],
  ['Adobe license missing after device rebuild', 'Software', 'Medium', 'In Progress', 'u-user-1', 'u-tech-2', 52],
  ['Teams audio device not detected', 'Microsoft 365', 'Low', 'Open', 'u-user-3', 'u-tech-2', 64],
  ['Wi-Fi drops in conference room Banksia', 'Network', 'High', 'In Progress', 'u-user-1', 'u-tech-1', 72],
  ['Need access to payroll folder', 'Account Access', 'Medium', 'Waiting on User', 'u-user-2', 'u-tech-3', 84],
  ['Monitor flickering after docking station update', 'Hardware', 'Low', 'Resolved', 'u-user-3', 'u-tech-2', 100],
  ['Email delivery delay to external vendor', 'Email', 'High', 'Open', 'u-user-1', 'u-tech-1', 110],
  ['BitLocker recovery prompt after reboot', 'Security', 'Critical', 'Resolved', 'u-user-2', 'u-tech-3', 130],
  ['CRM browser extension fails to load', 'Software', 'Medium', 'Closed', 'u-user-3', 'u-tech-2', 146],
  ['New starter hardware request', 'Hardware', 'Low', 'Open', 'u-user-1', null, 160],
  ['Calendar permissions need review', 'Microsoft 365', 'Low', 'Resolved', 'u-user-2', 'u-tech-1', 175],
  ['Shared drive mapping missing', 'Network', 'Medium', 'In Progress', 'u-user-3', 'u-tech-1', 188],
  ['Phishing simulation false positive', 'Security', 'Low', 'Closed', 'u-user-1', 'u-tech-3', 210],
  ['Cannot scan to email from MFD', 'Printer', 'Medium', 'Open', 'u-user-2', 'u-tech-2', 236],
  ['Mailbox archive approaching quota', 'Email', 'Medium', 'Waiting on User', 'u-user-1', 'u-tech-1', 260],
];

export const demoTickets = ticketSeeds.map(([title, category, priority, status, created_by, assigned_to, hoursAgo], index) => {
  const createdAt = subHours(new Date(), hoursAgo);
  const resolved = ['Resolved', 'Closed'].includes(status);
  return {
    id: `t-${index + 1}`,
    ticket_number: `IT-${String(index + 1).padStart(5, '0')}`,
    title,
    description: `${title}. Business impact has been logged and the service desk is tracking remediation steps with the affected user.`,
    category,
    priority,
    status,
    created_by,
    assigned_to,
    due_at: calculateDueDate(priority, createdAt).toISOString(),
    resolved_at: resolved ? subDays(new Date(), Math.max(1, Math.floor(hoursAgo / 48))).toISOString() : null,
    resolution_summary: resolved ? 'Issue validated, remediated, and confirmed with the requester.' : '',
    created_at: createdAt.toISOString(),
    updated_at: subHours(new Date(), Math.max(1, Math.floor(hoursAgo / 4))).toISOString(),
  };
});

export const demoComments = [
  { id: 'c-1', ticket_id: 't-1', user_id: 'u-user-2', comment: 'This drops every time I share my screen.', is_internal: false, created_at: subHours(new Date(), 2).toISOString() },
  { id: 'c-2', ticket_id: 't-1', user_id: 'u-tech-1', comment: 'Checking VPN profile and tunnel logs before changing the user configuration.', is_internal: true, created_at: subHours(new Date(), 1).toISOString() },
  { id: 'c-3', ticket_id: 't-3', user_id: 'u-tech-1', comment: 'Please confirm whether this is for the AP invoices mailbox or the finance shared mailbox.', is_internal: false, created_at: subHours(new Date(), 9).toISOString() },
];

export const demoActivity = demoTickets.flatMap((ticket) => [
  { id: `a-${ticket.id}-1`, ticket_id: ticket.id, user_id: ticket.created_by, action: 'created ticket', old_value: null, new_value: ticket.status, created_at: ticket.created_at },
  { id: `a-${ticket.id}-2`, ticket_id: ticket.id, user_id: ticket.assigned_to || 'u-admin', action: 'assigned technician', old_value: 'Unassigned', new_value: ticket.assigned_to || 'Unassigned', created_at: ticket.updated_at },
]);
