import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTickets } from '../../context/TicketContext';

export function Toast() {
  const { toast } = useTickets();
  if (!toast) return null;
  const Icon = toast.type === 'error' ? AlertTriangle : CheckCircle2;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <Icon className={toast.type === 'error' ? 'h-5 w-5 text-rose-500' : 'h-5 w-5 text-emerald-500'} />
      {toast.message}
    </div>
  );
}
