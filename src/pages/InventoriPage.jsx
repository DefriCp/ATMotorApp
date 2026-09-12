import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ClipboardCheck, Boxes, RefreshCw, Download } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryIcons';
import { exportToExcel } from '../utils/excelExport';

export default function InventoriPage({ produkList, onTambahBarang, onEditBarang, onDeleteBarang, onOpenStokOpname, onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [kategoriList, setKategoriList] = useState(['Semua']);

  const fetchKategori = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.getKategori();
        setKategoriList(['Semua', ...(data || []).map(k => k.nama)]);
      }
    } catch (err) {
      console.error("Gagal memuat kategori inventori:", err);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // Filter & Urutkan Produk Sesuai Abjad (A-Z)
  const filteredProduk = produkList
    .filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
      const matchKategori = selectedKategori === 'Semua' || item.kategori.toLowerCase() === selectedKategori.toLowerCase();
      return matchSearch && matchKategori;
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }));

  const handleExportExcel = () => {
    const dataExcel = filteredProduk.map(p => ({
      "ID Barang": p.id,
      "Nama Sparepart": p.nama,
      "Kategori": p.kategori,
      "Harga Beli (Rp)": p.harga_beli,
      "Harga Jual (Rp)": p.harga_jual,
      "Estimasi Laba per Unit (Rp)": p.harga_jual - p.harga_beli,
      "Sisa Stok (Unit)": p.stok,
      "Stok Minimal": p.stok_minimal
    }));
    exportToExcel(dataExcel, 'Master_Barang_AT_Motor', 'Master Barang');
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-100 font-sans text-slate-800">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            BARANG (Master Sparepart Bengkel)
          </h1>
          <p className="text-xs text-slate-500">Kelola master data barang sparepart diurutkan secara otomatis dari A-Z.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            Export Excel ({filteredProduk.length} Barang)
          </button>
          <button
            onClick={() => { fetchKategori(); onRefresh(); }}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Data SQLite"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onTambahBarang}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Barang Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Barang..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Filter Kategori:</span>
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            {kategoriList.map(kat => (
              <option key={kat} value={kat}>{kat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Full-width Data Table (Urut Abjad A-Z) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ikon & Nama Barang (A-Z)</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga Beli</th>
                <th className="px-6 py-4">Harga Jual</th>
                <th className="px-6 py-4 text-center">Sisa Stok</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredProduk.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data barang yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredProduk.map((item) => {
                  const isStokRendah = item.stok <= item.stok_minimal;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            {getCategoryIcon(item.kategori, "w-5 h-5")}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{item.nama}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.kategori}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-600">
                        {formatRupiah(item.harga_beli)}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                        {formatRupiah(item.harga_jual)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                            item.stok <= 0
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isStokRendah
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {item.stok} Unit
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenStokOpname(item)}
                            title="Stok Opname"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Opname</span>
                          </button>

                          <button
                            onClick={() => onEditBarang(item)}
                            title="Edit Barang"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteBarang(item.id)}
                            title="Hapus Barang"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
