import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { inputClass } from '../../components/ui/Field';
import { TicketStatusBadge, priorityTone } from '../../components/tickets/TicketStatusBadge';
import { useTickets } from '../../context/TicketContext';
import { CATEGORIES, PRIORITIES, STATUSES, priorityWeight } from '../../utils/constants';
import { getSlaStatus, slaTone } from '../../utils/sla';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const pageSize = 8;

export default function Tickets() {
  const { visibleTickets, users } = useTickets();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: 'All', priority: 'All', category: 'All', technician: 'All', sort: 'newest' });
  const search = useDebouncedValue(filters.search);
  const allTickets = visibleTickets();
  const technicians = users.filter((user) => user.role === 'Technician');

  const filtered = useMemo(() => {
    return allTickets
      .filter((ticket) => {
        const haystack = `${ticket.ticket_number} ${ticket.title} ${ticket.description}`.toLowerCase();
        return (
          haystack.includes(search.toLowerCase()) &&
          (filters.status === 'All' || ticket.status === filters.status) &&
          (filters.priority === 'All' || ticket.priority === filters.priority) &&
          (filters.category === 'All' || ticket.category === filters.category) &&
          (filters.technician === 'All' || ticket.assigned_to === filters.technician)
        );
      })
      .sort((a, b) => {
        if (filters.sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (filters.sort === 'priority') return priorityWeight[b.priority] - priorityWeight[a.priority];
        if (filters.sort === 'due') return new Date(a.due_at) - new Date(b.due_at);
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [allTickets, search, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageTickets = filtered.slice((page - 1) * pageSize, page * pageSize);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">Tickets</h1>
          <p className="mt-2 text-sm text-slate-500">Search, filter, sort, and inspect active service desk work.</p>
        </div>
        <Link className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-bold text-white" to="/tickets/new">Create ticket</Link>
      </div>

      <Card>
        <CardHeader title="Ticket queue" subtitle={`${filtered.length} matching ticket${filtered.length === 1 ? '' : 's'}`} action={<SlidersHorizontal className="h-5 w-5 text-slate-400" />} />
        <div className="grid gap-3 border-b border-slate-100 p-5 dark:border-slate-800 md:grid-cols-3 xl:grid-cols-6">
          <div className="relative md:col-span-3 xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search tickets" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} />
          </div>
          <select className={inputClass} value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
            <option>All</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.priority} onChange={(event) => setFilter('priority', event.target.value)}>
            <option>All</option>{PRIORITIES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.category} onChange={(event) => setFilter('category', event.target.value)}>
            <option>All</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.technician} onChange={(event) => setFilter('technician', event.target.value)}>
            <option value="All">All technicians</option>{technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
          </select>
          <select className={inputClass} value={filters.sort} onChange={(event) => setFilter('sort', event.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="due">Due date</option>
          </select>
        </div>

        {pageTickets.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <p className="text-lg font-black text-slate-950 dark:text-white">No tickets found</p>
              <p className="mt-2 text-sm text-slate-500">Adjust your filters or create a new ticket.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
                  <tr>
                    <th className="px-5 py-3">Ticket</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Technician</th><th className="px-5 py-3">SLA</th><th className="px-5 py-3">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pageTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4"><Link className="font-bold text-brand-600" to={`/tickets/${ticket.id}`}>{ticket.ticket_number}</Link><p className="mt-1 max-w-sm text-slate-600 dark:text-slate-300">{ticket.title}</p></td>
                      <td className="px-5 py-4">{ticket.category}</td>
                      <td className="px-5 py-4"><TicketStatusBadge value={ticket.status} /></td>
                      <td className="px-5 py-4"><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge></td>
                      <td className="px-5 py-4">{users.find((user) => user.id === ticket.assigned_to)?.full_name || 'Unassigned'}</td>
                      <td className="px-5 py-4"><Badge tone={slaTone(getSlaStatus(ticket))}>{getSlaStatus(ticket)}</Badge></td>
                      <td className="px-5 py-4 text-slate-500">{format(new Date(ticket.due_at), 'MMM d, h:mm a')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-4 lg:hidden">
              {pageTickets.map((ticket) => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-black text-brand-600">{ticket.ticket_number}</p><p className="mt-1 font-semibold text-slate-950 dark:text-white">{ticket.title}</p></div><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge></div>
                  <div className="mt-3 flex flex-wrap gap-2"><TicketStatusBadge value={ticket.status} /><Badge tone={slaTone(getSlaStatus(ticket))}>{getSlaStatus(ticket)}</Badge><Badge>{ticket.category}</Badge></div>
                </Link>
              ))}
            </div>
          </>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500">Page {page} of {pageCount}</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <Button variant="secondary" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
