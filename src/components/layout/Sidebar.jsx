import { NavLink } from 'react-router-dom';
import { BarChart3, Headphones, LayoutDashboard, PlusCircle, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets', label: 'Tickets', icon: Headphones },
  { to: '/tickets/new', label: 'Create Ticket', icon: PlusCircle },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = navItems.filter((item) => !item.adminOnly || user?.role === ROLES.ADMIN);

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-brand-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-slate-950 dark:text-white">DeskOps</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Service Desk</p>
            </div>
          </div>
          <button className="rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase text-slate-400">Signed in as</p>
          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{user?.full_name}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>
      </aside>
    </>
  );
}
