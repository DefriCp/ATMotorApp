import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp, Calendar, Wrench, RefreshCw } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function DashboardPage({ onNavigateToInventori, onRefresh }) {
  const [stats, setStats] = useState({
    totalPemasukanHariIni: 0,
    totalPemasukanBarangHariIni: 0,
    totalOngkosMontirHariIni: 0,
    totalTransaksiHariIni: 0,
    belanjaHariIni: 0,
    totalBelanjaKeseluruhan: 0,
    jumlahStokRendah: 0,
    produkStokRendah: []
  });
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        const resStats = await window.electronAPI.getDashboardStats();
        const resTrend = await window.electronAPI.getPenjualan7Hari();
        setStats(resStats || {});
        setTrendData(resTrend || []);
      }
    } catch (err) {
      console.error("Gagal memuat dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxTotal = trendData.length > 0 ? Math.max(...trendData.map(d => d.total), 1) : 1;

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Dashboard Performance Bengkel
          </h1>
          <p className="text-xs text-slate-500">Ringkasan keuangan, pembagian ongkos montir, belanja, dan kontrol stok.</p>
        </div>

        <button 
          onClick={() => { loadData(); if(onRefresh) onRefresh(); }}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-bold shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* SUMMARY CARDS KEUANGAN TEMA CERAH */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Pemasukan Hari Ini */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Pemasukan Hari Ini</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-mono mt-2">
            {formatRupiah(stats.totalPemasukanHariIni)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">{stats.totalTransaksiHariIni} Nota Servis & Sparepart</p>
        </div>

        {/* Total Jasa Montir Hari Ini */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Jasa Montir Hari Ini</span>
            <Wrench className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-teal-600 font-mono mt-2">
            {formatRupiah(stats.totalOngkosMontirHariIni)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Alokasi Komisi Servis</p>
        </div>

        {/* Total Belanja Pengeluaran */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Belanja / Restok</span>
            <ShoppingBag className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 font-mono mt-2">
            {formatRupiah(stats.totalBelanjaKeseluruhan)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Pengeluaran Stok & Alat</p>
        </div>

        {/* Barang Stok Menipis */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Stok Menipis</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 font-mono mt-2">
            {stats.jumlahStokRendah} <span className="text-xs text-slate-500 font-normal">Barang</span>
          </div>
          <p className="text-[10px] text-amber-600 mt-1 font-bold">Perlu Stok Opname</p>
        </div>
      </div>

      {/* TREN PENJUALAN 7 HARI TERAKHIR TEMA CERAH */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Tren Pemasukan 7 Hari Terakhir</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <span className="flex items-center gap-1 text-emerald-600"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Barang</span>
            <span className="flex items-center gap-1 text-teal-600"><div className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Jasa Montir</span>
          </div>
        </div>

        {/* Bar Chart Graphics Tema Cerah */}
        <div className="h-60 pt-6 flex items-end justify-between gap-3 border-b border-slate-100 pb-4">
          {trendData.map((day, idx) => {
            const heightPercent = maxTotal > 0 ? Math.max(10, Math.round((day.total / maxTotal) * 100)) : 10;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-800 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-center shadow-xl z-20 pointer-events-none whitespace-nowrap">
                  <div className="text-[11px] font-bold text-emerald-400 font-mono">{formatRupiah(day.total)}</div>
                  <div className="text-[9px] text-slate-300">Barang: {formatRupiah(day.omset_barang)} | Montir: {formatRupiah(day.omset_montir)}</div>
                </div>

                <div className="text-[10px] font-mono font-bold text-slate-500 mb-1 group-hover:text-blue-600 transition-colors">
                  {formatRupiah(day.total).replace(',00', '')}
                </div>

                <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex items-end p-1 h-full">
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 via-teal-500 to-emerald-500 rounded-lg transition-all duration-500 group-hover:brightness-110 shadow-xs"
                  />
                </div>

                <div className="text-xs font-bold text-slate-600 mt-2 font-mono group-hover:text-blue-600 transition-colors">
                  {day.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
