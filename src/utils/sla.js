import { addBusinessDays, addHours, differenceInMinutes, isPast } from 'date-fns';

export function calculateDueDate(priority, createdAt = new Date()) {
  const created = new Date(createdAt);
  if (priority === 'Critical') return addHours(created, 4);
  if (priority === 'High') return addHours(created, 8);
  if (priority === 'Medium') return addBusinessDays(created, 2);
  return addBusinessDays(created, 5);
}

export function getSlaStatus(ticket) {
  if (['Resolved', 'Closed'].includes(ticket.status)) return 'On Track';
  const dueDate = new Date(ticket.due_at);
  if (isPast(dueDate)) return 'Breached';
  const minutesLeft = differenceInMinutes(dueDate, new Date());
  if (minutesLeft <= 240 || minutesLeft <= 0.25 * differenceInMinutes(dueDate, new Date(ticket.created_at))) {
    return 'At Risk';
  }
  return 'On Track';
}

export function slaTone(status) {
  return {
    'On Track': 'success',
    'At Risk': 'warning',
    Breached: 'danger',
  }[status];
}
