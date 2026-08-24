import React, { useState, useEffect } from 'react';
import { ClipboardCheck, History, RefreshCw } from 'lucide-react';
import { formatTanggal } from '../utils/formatters';

export default function StokOpnamePage({ produkList, onOpenStokOpname }) {
  const [activeSubTab, setActiveSubTab] = useState('opname');
  const [logOpname, setLogOpname] = useState([]);

  const fetchLog = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.getStokOpnameLog();
        setLogOpname(data || []);
      }
    } catch (err) {
      console.error("Gagal memuat log stok opname:", err);
    }
  };

  useEffect(() => {
    fetchLog();
  }, []);

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-100">
      {/* Header & Sub-Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            STOCK OPNAME BENGKEL
          </h1>
          <p className="text-xs text-slate-500">Pemeriksaan & penyesuaian stok fisik barang dengan data sistem SQLite.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveSubTab('opname')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'opname'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Penyesuaian Stok
          </button>
          <button
            onClick={() => { setActiveSubTab('histori'); fetchLog(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'histori'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Histori Opname
          </button>
        </div>
      </div>

      {/* VIEW 1: PENYESUAIAN STOK OPNAME */}
      {activeSubTab === 'opname' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-center">Stok Sistem</th>
                <th className="px-6 py-4 text-right">Aksi Opname</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {produkList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {item.nama}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{item.kategori}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                      {item.stok} Unit
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onOpenStokOpname(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                    >
                      Hitung Opname Fisik
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: HISTORI OPNAME */}
      {activeSubTab === 'histori' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              Log Histori Perubahan Stok Opname
            </h3>
            <button onClick={fetchLog} className="p-1.5 bg-white hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Tanggal</th>
                  <th className="px-6 py-3.5">Nama Barang</th>
                  <th className="px-6 py-3.5 text-center">Stok Sebelum</th>
                  <th className="px-6 py-3.5 text-center">Stok Sesudah</th>
                  <th className="px-6 py-3.5 text-center">Selisih</th>
                  <th className="px-6 py-3.5">Catatan Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {logOpname.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      Belum ada histori log penyesuaian stok opname.
                    </td>
                  </tr>
                ) : (
                  logOpname.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500 font-medium">
                        {formatTanggal(log.tanggal)}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        {log.nama_produk}
                      </td>
                      <td className="px-6 py-3.5 text-center font-mono text-slate-500">{log.stok_sebelum} Unit</td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-900">{log.stok_sesudah} Unit</td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                          log.selisih === 0
                            ? 'bg-slate-100 text-slate-500'
                            : log.selisih > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.selisih > 0 ? `+${log.selisih}` : log.selisih}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">{log.keterangan || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
