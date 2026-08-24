import React, { useState, useEffect } from 'react';
import { Clock, UserCircle, WifiOff, RefreshCw, LogOut } from 'lucide-react';

export default function Header({ activeTab, currentUser, onLogout, onRefresh }) {
  const [waktu, setWaktu] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const titleMap = {
    kasir: 'KASIR (Point of Sales)',
    inventori: 'BARANG (Master Sparepart)',
    stok_opname: 'STOCK OPNAME',
    pemasukan: 'PEMASUKAN & JASA MONTIR',
    belanja: 'PENGELUARAN BELANJA',
    dashboard: 'DASHBOARD RINGKASAN BENGKEL',
    pengguna: 'MANAJEMEN AKUN PENGGUNA'
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-10 shadow-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase">
          {titleMap[activeTab] || 'BENGKEL SYSTEM'}
        </h2>
        <p className="text-xs text-slate-500">Bengkel AT Motor - Sistem Mandiri Offline-First</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Indikator Offline Mode */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>Mode Offline</span>
        </div>

        {/* Tombol Refresh Data */}
        {onRefresh && (
          <button 
            onClick={onRefresh}
            title="Refresh Data SQLite"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Jam Digital */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 text-blue-700 font-mono text-xs font-bold border border-slate-200">
          <Clock className="w-3.5 h-3.5" />
          <span>{waktu.toLocaleTimeString('id-ID')}</span>
        </div>

        {/* Profil Kasir & Logout */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <UserCircle className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.nama_lengkap}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                  currentUser.peran === 'Admin' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {currentUser.peran}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Keluar dari Akun"
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
