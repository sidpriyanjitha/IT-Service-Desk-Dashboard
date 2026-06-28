import { Menu, Moon, Search, Sun, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Topbar({ onMenu }) {
  const { user, logout, isDemo } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900 sm:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">Search tickets, users, assets...</span>
        </div>
        {isDemo && <span className="hidden rounded bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300 md:inline">Demo mode</span>}
        <button
          title="Toggle dark mode"
          className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={() => setDark((current) => !current)}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded bg-slate-200 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {user?.full_name?.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-950 dark:text-white">{user?.full_name}</p>
            <p className="text-xs text-slate-500">{user?.department}</p>
          </div>
        </div>
        <button title="Log out" className="rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
