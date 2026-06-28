import { ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';

export function MetricCard({ label, value, icon: Icon, tone = 'text-brand-600', detail }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-md bg-slate-100 p-2 dark:bg-slate-800 ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {detail && (
        <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-500">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {detail}
        </p>
      )}
    </Card>
  );
}
