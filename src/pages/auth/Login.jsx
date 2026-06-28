import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Headphones, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, inputClass } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: 'admin@servicedesk.dev', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-[radial-gradient(circle_at_20%_20%,rgba(25,118,210,0.35),transparent_30%),linear-gradient(135deg,#0f172a,#145fad)] p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-white/15"><Headphones className="h-6 w-6" /></div>
          <div>
            <p className="font-black uppercase tracking-wide">DeskOps</p>
            <p className="text-sm text-sky-100">IT Service Desk Platform</p>
          </div>
        </div>
        <div className="max-w-xl">
          <h1 className="text-5xl font-black leading-tight">Triage, assign, resolve, and report from one service desk command center.</h1>
          <p className="mt-5 text-lg text-sky-100">A portfolio-grade IT support dashboard with SLA tracking, role-based workflows, and realistic service desk operations.</p>
        </div>
      </section>
      <section className="grid place-items-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase text-brand-600">Welcome back</p>
            <h1 className="mt-2 text-3xl font-black">Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Demo credentials are prefilled. Use any seeded role from the README.</p>
          </div>
          {error && <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</div>}
          <div className="space-y-4">
            <Field label="Email">
              <input className={inputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </Field>
            <Field label="Password">
              <input className={inputClass} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </Field>
            <Button className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">
            New requester? <Link className="font-bold text-brand-600" to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
