import { Badge } from '../ui/Badge';

export function priorityTone(priority) {
  if (priority === 'Critical') return 'danger';
  if (priority === 'High') return 'warning';
  if (priority === 'Medium') return 'info';
  return 'neutral';
}

export function TicketStatusBadge({ value }) {
  const tone = value === 'Resolved' || value === 'Closed' ? 'success' : value === 'Waiting on User' ? 'warning' : 'info';
  return <Badge tone={tone}>{value}</Badge>;
}
