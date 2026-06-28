import { Search, UserCog } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { inputClass } from '../../components/ui/Field';
import { useTickets } from '../../context/TicketContext';
import { ROLES } from '../../utils/constants';

export default function Users() {
  const { users, updateUser } = useTickets();
  const [search, setSearch] = useState('');
  const visible = users.filter((user) => `${user.full_name} ${user.email} ${user.department}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">User management</h1>
        <p className="mt-2 text-sm text-slate-500">Manage access, role assignment, department ownership, and account status.</p>
      </div>
      <Card>
        <CardHeader title="Directory" subtitle={`${visible.length} users`} action={<UserCog className="h-5 w-5 text-slate-400" />} />
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Department</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-bold text-slate-950 dark:text-white">{person.full_name}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{person.email}</td>
                  <td className="px-5 py-4">
                    <select className={inputClass} value={person.role} onChange={(event) => updateUser(person.id, { role: event.target.value })}>
                      {Object.values(ROLES).map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <input className={inputClass} value={person.department} onChange={(event) => updateUser(person.id, { department: event.target.value })} />
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => updateUser(person.id, { is_active: !person.is_active })}>
                      <Badge tone={person.is_active ? 'success' : 'danger'}>{person.is_active ? 'Active' : 'Inactive'}</Badge>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
