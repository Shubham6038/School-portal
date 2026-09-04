import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { School, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });

      if (res.data.success) {
        localStorage.clear();
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        const role = res.data.user.role;
        if (role === 'SUPER_ADMIN') navigate('/admin/dashboard');
        else if (role === 'SCHOOL_ADMIN' || role === 'PRINCIPAL') navigate('/principal/dashboard');
        else if (role === 'TEACHER') navigate('/teacher/dashboard');
        else if (role === 'PARENT') navigate('/parent/dashboard');
        else if (role === 'STUDENT') navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-slate-950">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-3xl shadow-2xl shadow-blue-950/80 backdrop-blur-xl overflow-hidden">
          <div className="p-8 border-b border-blue-900/30 text-center relative">
            <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 text-amber-400 border border-amber-500/20 mb-3 shadow-inner">
              <School className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white uppercase">AB PUBLIC SCHOOL</h1>
            <p className="text-xs text-amber-400 font-semibold tracking-widest uppercase mt-0.5">Empowering Minds • Shaping Future</p>
            <p className="text-xs text-slate-400 mt-2">Sign in to institutional ERP Portal</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">School Email / ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              {!loading && <ArrowRight className="h-4 w-4 text-amber-300" />}
            </button>
          </form>

          <div className="px-8 pb-8 text-center text-xs text-slate-400 border-t border-slate-800/60 pt-6">
            New Student Admission?{' '}
            <Link to="/admission" className="text-amber-400 hover:text-amber-300 font-bold underline ml-1">
              Apply Online
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
