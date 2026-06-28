import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Field, inputClass } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', department: '', password: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">New users are registered as End Users and can submit service requests.</p>
        {error && <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        <div className="mt-5 space-y-4">
          <Field label="Full name"><input required className={inputClass} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></Field>
          <Field label="Email"><input required className={inputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label="Department"><input className={inputClass} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></Field>
          <Field label="Password"><input required className={inputClass} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
          <Button className="w-full">Register</Button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have access? <Link className="font-bold text-brand-600" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
