import React, { useState } from 'react';
import { Wrench, Lock, User, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('Atmotor123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Harap isi username dan password!');
      return;
    }

    setLoading(true);
    try {
      if (window.electronAPI) {
        const user = await window.electronAPI.loginUser(username, password);
        onLoginSuccess(user);
      } else {
        if (username.toLowerCase() === 'admin' && password === 'Atmotor123') {
          onLoginSuccess({ id: 1, username: 'Admin', nama_lengkap: 'AT Motor Tasikmalaya', peran: 'Admin' });
        } else {
          throw new Error('Username atau password salah!');
        }
      }
    } catch (err) {
      setError(err.message || 'Login gagal, periksa kembali akun Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 border border-slate-200 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-xl shadow-blue-600/20 mb-1">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-wide">AT Motor Tasikmalaya</h1>
          <p className="text-xs text-slate-500 font-medium">Sistem POS & Stock Opname Bengkel</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Username Login</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all mt-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Memverifikasi Data...' : 'Masuk ke Sistem'}</span>
          </button>
        </form>

        {/* Info Akun Login */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-center">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Username: <strong className="text-slate-900 font-mono">Admin</strong> | Password: <strong className="text-slate-900 font-mono">Atmotor123</strong></span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Sistem POS Offline Bengkel AT Motor Tasikmalaya</span>
        </div>
      </div>
    </div>
  );
}
