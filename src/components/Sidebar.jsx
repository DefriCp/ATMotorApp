import React from 'react';
import { ShoppingCart, Boxes, ClipboardCheck, DollarSign, ShoppingBag, LayoutDashboard, Users, Wrench, ShieldCheck, HardDrive } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      icon: LayoutDashboard,
      roles: ['Admin']
    },
    {
      id: 'kasir',
      label: 'KASIR (POS)',
      icon: ShoppingCart,
      roles: ['Admin', 'Kasir']
    },
    {
      id: 'inventori',
      label: 'BARANG',
      icon: Boxes,
      roles: ['Admin', 'Kasir']
    },
    {
      id: 'stok_opname',
      label: 'STOCK OPNAME',
      icon: ClipboardCheck,
      roles: ['Admin', 'Kasir']
    },
    {
      id: 'pemasukan',
      label: 'PEMASUKAN',
      icon: DollarSign,
      roles: ['Admin', 'Kasir']
    },
    {
      id: 'belanja',
      label: 'BELANJA',
      icon: ShoppingBag,
      roles: ['Admin', 'Kasir']
    },
    {
      id: 'pengguna',
      label: 'KELOLA AKUN',
      icon: Users,
      roles: ['Admin']
    }
  ];

  const userRole = currentUser ? currentUser.peran : 'Kasir';
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen select-none z-20 shadow-sm">
      <div>
        {/* Header Logo Bengkel */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 tracking-wide leading-tight">AT Motor POS</h1>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Tasikmalaya System
            </p>
          </div>
        </div>

        {/* Navigasi Utama (Dashboard di Paling Atas) */}
        <nav className="p-3 space-y-1 mt-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 font-medium text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Database Active</div>
            <div className="text-[10px] text-slate-500">Offline-First SQLite</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
