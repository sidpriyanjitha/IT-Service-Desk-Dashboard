import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { AlertTriangle, CheckCircle2, Clock3, Flame, Headphones, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { TicketCharts } from '../../components/dashboard/TicketCharts';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { ROLES } from '../../utils/constants';
import { getSlaStatus, slaTone } from '../../utils/sla';

export default function Dashboard() {
  const { user } = useAuth();
  const { visibleTickets, users } = useTickets();
  const tickets = visibleTickets();
  const openTickets = tickets.filter((ticket) => !['Resolved', 'Closed'].includes(ticket.status));
  const criticalTickets = tickets.filter((ticket) => ticket.priority === 'Critical');
  const resolvedTickets = tickets.filter((ticket) => ['Resolved', 'Closed'].includes(ticket.status));
  const slaRiskTickets = tickets.filter((ticket) => ['At Risk', 'Breached'].includes(getSlaStatus(ticket)));
  const avgResolution = resolvedTickets.length
    ? Math.round(resolvedTickets.reduce((sum, ticket) => sum + differenceInHours(new Date(ticket.resolved_at), new Date(ticket.created_at)), 0) / resolvedTickets.length)
    : 0;
  const recent = [...tickets].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6);
  const queueTickets =
    user.role === ROLES.ADMIN
      ? openTickets.slice(0, 5)
      : tickets.filter((ticket) => ticket.assigned_to === user.id).slice(0, 5);
  const queueTitle = user.role === ROLES.ADMIN ? 'Admin resolution queue' : 'My assigned tickets';
  const queueSubtitle = user.role === ROLES.ADMIN ? 'All open tickets available to resolve' : 'Technician ownership snapshot';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-brand-600">{user.role} workspace</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Service desk dashboard</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Live operational view of ticket volume, SLA risk, priority, and technician workload.</p>
        </div>
        <Link className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700" to="/tickets/new">
          New ticket
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Total tickets" value={tickets.length} icon={Headphones} detail="Across visible queue" />
        <MetricCard label="Open tickets" value={openTickets.length} icon={Clock3} tone="text-sky-600" detail="Needs active attention" />
        <MetricCard label="Critical" value={criticalTickets.length} icon={Flame} tone="text-rose-600" detail="High impact incidents" />
        <MetricCard label="Resolved" value={resolvedTickets.length} icon={CheckCircle2} tone="text-emerald-600" detail="Completed requests" />
        <MetricCard label="SLA risk" value={slaRiskTickets.length} icon={AlertTriangle} tone="text-amber-600" detail="At risk or breached" />
        <MetricCard label="Avg resolution" value={`${avgResolution}h`} icon={TimerReset} tone="text-indigo-600" detail="Resolved queue average" />
      </div>

      <TicketCharts tickets={tickets} />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader title="Recent tickets" subtitle="Most recently updated items in your queue" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
                <tr>
                  <th className="px-5 py-3">Ticket</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">SLA</th>
                  <th className="px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recent.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <Link to={`/tickets/${ticket.id}`} className="font-bold text-brand-600">{ticket.ticket_number}</Link>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{ticket.title}</p>
                    </td>
                    <td className="px-5 py-4"><Badge tone="info">{ticket.status}</Badge></td>
                    <td className="px-5 py-4"><Badge tone={ticket.priority === 'Critical' ? 'danger' : ticket.priority === 'High' ? 'warning' : 'neutral'}>{ticket.priority}</Badge></td>
                    <td className="px-5 py-4"><Badge tone={slaTone(getSlaStatus(ticket))}>{getSlaStatus(ticket)}</Badge></td>
                    <td className="px-5 py-4 text-slate-500">{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title={queueTitle} subtitle={queueSubtitle} />
          <div className="space-y-3 p-5">
            {(queueTickets.length ? queueTickets : tickets.slice(0, 5)).map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block rounded-md border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-950 dark:text-white">{ticket.ticket_number}</p>
                  <Badge tone={slaTone(getSlaStatus(ticket))}>{getSlaStatus(ticket)}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{ticket.title}</p>
                <p className="mt-2 text-xs text-slate-500">Assigned to {users.find((item) => item.id === ticket.assigned_to)?.full_name || 'Unassigned'}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
