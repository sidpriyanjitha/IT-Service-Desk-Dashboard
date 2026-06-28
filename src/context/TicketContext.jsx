import { createContext, useContext, useMemo, useState } from 'react';
import { addMinutes } from 'date-fns';
import { demoActivity, demoComments, demoTickets, demoUsers } from '../lib/demoData';
import { calculateDueDate } from '../utils/sla';
import { ROLES } from '../utils/constants';
import { useAuth } from './AuthContext';

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(demoTickets);
  const [users, setUsers] = useState(demoUsers.map(({ password, ...profile }) => profile));
  const [comments, setComments] = useState(demoComments);
  const [activity, setActivity] = useState(demoActivity);
  const [toast, setToast] = useState(null);

  function showToast(message, type = 'success') {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3200);
  }

  function visibleTickets(profile = user) {
    if (!profile) return [];
    return tickets.filter((ticket) => canViewTicket(ticket, profile));
  }

  function canViewTicket(ticket, profile = user) {
    if (!profile || !ticket) return false;
    if (profile.role === ROLES.ADMIN) return true;
    if (profile.role === ROLES.TECHNICIAN) return ticket.assigned_to === profile.id;
    return ticket.created_by === profile.id;
  }

  function canManageTicket(ticket, profile = user) {
    if (!profile || !ticket) return false;
    if (profile.role === ROLES.ADMIN) return true;
    return profile.role === ROLES.TECHNICIAN && ticket.assigned_to === profile.id;
  }

  function createTicket(payload) {
    const now = new Date();
    const ticket = {
      id: `t-${crypto.randomUUID()}`,
      ticket_number: `IT-${String(tickets.length + 1).padStart(5, '0')}`,
      ...payload,
      status: 'Open',
      created_by: user.id,
      assigned_to: null,
      due_at: calculateDueDate(payload.priority, now).toISOString(),
      resolved_at: null,
      resolution_summary: '',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    setTickets((current) => [ticket, ...current]);
    addActivity(ticket.id, 'created ticket', null, 'Open', user.id);
    showToast('Ticket created successfully');
    return ticket;
  }

  function updateTicket(ticketId, changes) {
    const currentTicket = tickets.find((ticket) => ticket.id === ticketId);
    const isRequesterReopen =
      user?.role === ROLES.END_USER &&
      currentTicket?.created_by === user.id &&
      ['Resolved', 'Closed'].includes(currentTicket.status) &&
      Object.keys(changes).length === 1 &&
      changes.status === 'Open';

    if (!canManageTicket(currentTicket) && !isRequesterReopen) {
      showToast('You do not have permission to update this ticket', 'error');
      return;
    }
    setTickets((current) =>
      current.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        const statusResolved = changes.status && ['Resolved', 'Closed'].includes(changes.status);
        return {
          ...ticket,
          ...changes,
          resolved_at: statusResolved ? new Date().toISOString() : changes.status === 'Open' ? null : ticket.resolved_at,
          updated_at: new Date().toISOString(),
        };
      })
    );
    Object.entries(changes).forEach(([key, value]) => {
      if (currentTicket?.[key] !== value) addActivity(ticketId, `updated ${key.replace('_', ' ')}`, currentTicket?.[key], value, user?.id);
    });
    showToast('Ticket updated');
  }

  function addComment(ticketId, comment, isInternal = false) {
    const item = {
      id: `c-${crypto.randomUUID()}`,
      ticket_id: ticketId,
      user_id: user.id,
      comment,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };
    setComments((current) => [...current, item]);
    addActivity(ticketId, isInternal ? 'added internal note' : 'added comment', null, null, user.id);
    showToast(isInternal ? 'Internal note added' : 'Comment added');
  }

  function addActivity(ticketId, action, oldValue, newValue, actorId = user?.id) {
    setActivity((current) => [
      ...current,
      {
        id: `a-${crypto.randomUUID()}`,
        ticket_id: ticketId,
        user_id: actorId,
        action,
        old_value: oldValue,
        new_value: newValue,
        created_at: addMinutes(new Date(), 0).toISOString(),
      },
    ]);
  }

  function updateUser(userId, changes) {
    setUsers((current) => current.map((item) => (item.id === userId ? { ...item, ...changes } : item)));
    showToast('User profile updated');
  }

  const value = useMemo(
    () => ({ tickets, users, comments, activity, toast, visibleTickets, canViewTicket, canManageTicket, createTicket, updateTicket, addComment, updateUser }),
    [tickets, users, comments, activity, toast, user]
  );

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) throw new Error('useTickets must be used inside TicketProvider');
  return context;
}
