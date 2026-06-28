import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Navigate, useParams } from 'react-router-dom';
import { History, MessageSquare, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Field, inputClass } from '../../components/ui/Field';
import { TicketStatusBadge, priorityTone } from '../../components/tickets/TicketStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { PRIORITIES, ROLES, STATUSES } from '../../utils/constants';
import { getSlaStatus, slaTone } from '../../utils/sla';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { tickets, users, comments, activity, canViewTicket, canManageTicket, updateTicket, addComment } = useTickets();
  const [comment, setComment] = useState('');
  const [note, setNote] = useState('');
  const [resolutionDraft, setResolutionDraft] = useState('');
  const [reopenOpen, setReopenOpen] = useState(false);
  const ticket = tickets.find((item) => item.id === id);
  const canStaff = [ROLES.ADMIN, ROLES.TECHNICIAN].includes(user.role);
  const canManage = canManageTicket(ticket);
  const technicians = users.filter((item) => item.role === ROLES.TECHNICIAN && item.is_active);

  const visibleComments = useMemo(
    () => comments.filter((item) => item.ticket_id === id && (!item.is_internal || canStaff)),
    [comments, id, canStaff]
  );
  const timeline = activity.filter((item) => item.ticket_id === id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  useEffect(() => {
    setResolutionDraft(ticket?.resolution_summary || '');
  }, [ticket?.id, ticket?.resolution_summary]);

  if (!ticket || !canViewTicket(ticket)) return <Navigate to="/tickets" replace />;

  function handleCommentSubmit(event, isInternal = false) {
    event.preventDefault();
    const value = isInternal ? note : comment;
    if (!value.trim()) return;
    addComment(ticket.id, value.trim(), isInternal);
    if (isInternal) setNote('');
    else setComment('');
  }

  function handleResolutionSave() {
    if (resolutionDraft === (ticket.resolution_summary || '')) return;
    updateTicket(ticket.id, { resolution_summary: resolutionDraft });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-brand-600">{ticket.ticket_number}</p>
            <TicketStatusBadge value={ticket.status} />
            <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
            <Badge tone={slaTone(getSlaStatus(ticket))}>{getSlaStatus(ticket)}</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{ticket.title}</h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-500">{ticket.description}</p>
        </div>
        {user.role === ROLES.END_USER && ['Resolved', 'Closed'].includes(ticket.status) && (
          <Button variant="secondary" onClick={() => setReopenOpen(true)}>Reopen ticket</Button>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Ticket information" subtitle="Ownership, SLA, and request metadata" />
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Category" value={ticket.category} />
              <Info label="Created by" value={users.find((item) => item.id === ticket.created_by)?.full_name} />
              <Info label="Assigned technician" value={users.find((item) => item.id === ticket.assigned_to)?.full_name || 'Unassigned'} />
              <Info label="Created" value={format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')} />
              <Info label="Updated" value={format(new Date(ticket.updated_at), 'MMM d, yyyy h:mm a')} />
              <Info label="Due" value={format(new Date(ticket.due_at), 'MMM d, yyyy h:mm a')} />
            </div>
          </Card>

          {canStaff && (
            <Card>
              <CardHeader title="Work controls" subtitle="Status, priority, owner, and resolution handling" />
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Field label="Status">
                  <select className={inputClass} disabled={!canManage} value={ticket.status} onChange={(event) => updateTicket(ticket.id, { status: event.target.value })}>
                    {STATUSES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select className={inputClass} disabled={!canManage} value={ticket.priority} onChange={(event) => updateTicket(ticket.id, { priority: event.target.value })}>
                    {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Assigned technician">
                  <select className={inputClass} disabled={user.role !== ROLES.ADMIN} value={ticket.assigned_to || ''} onChange={(event) => updateTicket(ticket.id, { assigned_to: event.target.value || null })}>
                    <option value="">Unassigned</option>
                    {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
                  </select>
                </Field>
                <Field label="Resolution summary">
                  <textarea
                    className={inputClass}
                    rows="3"
                    disabled={!canManage}
                    value={resolutionDraft}
                    onChange={(event) => setResolutionDraft(event.target.value)}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!canManage || resolutionDraft === (ticket.resolution_summary || '')}
                      onClick={handleResolutionSave}
                    >
                      Save summary
                    </Button>
                  </div>
                </Field>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Comments" subtitle="Requester-visible collaboration" action={<MessageSquare className="h-5 w-5 text-slate-400" />} />
            <div className="space-y-4 p-5">
              {visibleComments.filter((item) => !item.is_internal).length === 0 && <p className="text-sm text-slate-500">No public comments yet.</p>}
              {visibleComments.filter((item) => !item.is_internal).map((item) => <Comment key={item.id} item={item} users={users} />)}
              <form onSubmit={(event) => handleCommentSubmit(event)} className="space-y-3">
                <textarea className={inputClass} rows="4" placeholder="Add a comment" value={comment} onChange={(event) => setComment(event.target.value)} />
                <Button>Add comment</Button>
              </form>
            </div>
          </Card>

          {canStaff && (
            <Card>
              <CardHeader title="Internal notes" subtitle="Visible only to Admin and Technician roles" action={<ShieldCheck className="h-5 w-5 text-slate-400" />} />
              <div className="space-y-4 p-5">
                {visibleComments.filter((item) => item.is_internal).length === 0 && <p className="text-sm text-slate-500">No internal notes yet.</p>}
                {visibleComments.filter((item) => item.is_internal).map((item) => <Comment key={item.id} item={item} users={users} internal />)}
                <form onSubmit={(event) => handleCommentSubmit(event, true)} className="space-y-3">
                  <textarea className={inputClass} rows="4" placeholder="Add an internal note" value={note} onChange={(event) => setNote(event.target.value)} />
                  <Button variant="secondary">Add internal note</Button>
                </form>
              </div>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="Activity timeline" subtitle="Ticket audit history" action={<History className="h-5 w-5 text-slate-400" />} />
          <div className="space-y-4 p-5">
            {timeline.map((item) => (
              <div key={item.id} className="relative border-l border-slate-200 pl-4 dark:border-slate-700">
                <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-brand-600" />
                <p className="text-sm font-bold text-slate-950 dark:text-white">{item.action}</p>
                {(item.old_value || item.new_value) && <p className="mt-1 text-xs text-slate-500">{String(item.old_value || 'None')} to {String(item.new_value || 'None')}</p>}
                <p className="mt-1 text-xs text-slate-400">{users.find((person) => person.id === item.user_id)?.full_name || 'System'} · {format(new Date(item.created_at), 'MMM d, h:mm a')}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={reopenOpen}
        title="Reopen ticket?"
        body="This will move the ticket back to Open and notify the service desk queue."
        confirmLabel="Reopen"
        onCancel={() => setReopenOpen(false)}
        onConfirm={() => {
          updateTicket(ticket.id, { status: 'Open' });
          setReopenOpen(false);
        }}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value || 'None'}</p>
    </div>
  );
}

function Comment({ item, users, internal = false }) {
  const author = users.find((user) => user.id === item.user_id);
  return (
    <div className={`rounded-md border p-4 ${internal ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-slate-950 dark:text-white">{author?.full_name || 'Unknown user'}</p>
        <p className="text-xs text-slate-500">{format(new Date(item.created_at), 'MMM d, h:mm a')}</p>
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.comment}</p>
    </div>
  );
}
