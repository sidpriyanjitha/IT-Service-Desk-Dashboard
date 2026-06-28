import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { PRIORITIES, STATUSES } from '../../utils/constants';

const colors = ['#1976d2', '#0f9f6e', '#f59e0b', '#e11d48', '#64748b'];

export function TicketCharts({ tickets }) {
  const statusData = STATUSES.map((status) => ({ name: status, value: tickets.filter((ticket) => ticket.status === status).length })).filter((item) => item.value);
  const priorityData = PRIORITIES.map((priority) => ({ name: priority, tickets: tickets.filter((ticket) => ticket.priority === priority).length }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader title="Tickets by status" subtitle="Current workload distribution" />
        <div className="h-80 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={105} innerRadius={60} paddingAngle={3}>
                {statusData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <CardHeader title="Tickets by priority" subtitle="Demand by impact level" />
        <div className="h-80 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis allowDecimals={false} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="tickets" radius={[5, 5, 0, 0]} fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
