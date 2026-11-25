import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { user, authLoading, login } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
        <div className="text-xs font-semibold text-gray-500">Checking session...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setUsername('demo');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Bulk Mailer</h1>
            <p className="text-xs text-gray-400 font-medium">Acme Team · Sign in to continue</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-black text-white hover:bg-zinc-800 disabled:bg-gray-400 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>{submitting ? 'Signing in...' : 'Sign in'}</span>
            {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-2 text-xs">
          <div>
            <p className="font-bold text-gray-700">Demo account</p>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5">
              demo / password123
            </p>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors"
          >
            Fill
          </button>
        </div>
      </div>
    </div>
  );
}
