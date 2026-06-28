import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Field, inputClass } from '../../components/ui/Field';
import { useTickets } from '../../context/TicketContext';
import { CATEGORIES, PRIORITIES } from '../../utils/constants';

export default function CreateTicket() {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const [form, setForm] = useState({ title: '', description: '', category: 'Hardware', priority: 'Medium' });

  function handleSubmit(event) {
    event.preventDefault();
    const ticket = createTicket(form);
    navigate(`/tickets/${ticket.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Create ticket</h1>
        <p className="mt-2 text-sm text-slate-500">Capture impact, category, and urgency so the service desk can triage quickly.</p>
      </div>
      <Card>
        <CardHeader title="Request details" subtitle="Required fields are used for routing and SLA calculation" />
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <Field label="Title"><input required className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Short summary of the issue" /></Field>
          <Field label="Description"><textarea required rows="7" className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What happened, who is affected, and what changed recently?" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><select className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Priority"><select className={inputClass} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{PRIORITIES.map((item) => <option key={item}>{item}</option>)}</select></Field>
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950">
            <Paperclip className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">Attachment placeholder</p>
            <p className="mt-1 text-xs text-slate-500">Screenshots, logs, and error exports can be connected to Supabase Storage later.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/tickets')}>Cancel</Button>
            <Button>Submit ticket</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
