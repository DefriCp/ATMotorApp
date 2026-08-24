import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ClipboardCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';

export default function ModalStokOpname({ isOpen, onClose, onSave, item }) {
  const [stokFisik, setStokFisik] = useState('');
  const [keterangan, setKeterangan] = useState('Penyesuaian Fisik Stok Opname');

  useEffect(() => {
    if (item) {
      setStokFisik(item.stok.toString());
      setKeterangan('Penyesuaian Fisik Stok Opname');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const stokSistem = item.stok;
  const selisih = (parseInt(stokFisik) || 0) - stokSistem;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stokFisik === '') {
      alert("Masukkan jumlah stok fisik hasil hitung!");
      return;
    }
    onSave(item.id, parseInt(stokFisik), keterangan);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Stock Opname Sparepart</h3>
              <p className="text-xs text-slate-500">Penyesuaian Stok Fisik vs Stok Sistem SQLite</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              {getCategoryIcon(item.kategori, "w-8 h-8")}
            </div>
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {item.kategori}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">{item.nama}</h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Stok Sistem</span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{stokSistem} <span className="text-xs font-normal text-slate-500">Unit</span></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Stok Fisik (Hitung Manual)</label>
              <input
                type="number"
                min="0"
                required
                autoFocus
                value={stokFisik}
                onChange={(e) => setStokFisik(e.target.value)}
                className="w-full bg-slate-50 border border-emerald-500 rounded-xl px-3.5 py-2 text-xl font-bold text-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Indikator Selisih */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            selisih === 0 
              ? 'bg-slate-100 border-slate-200 text-slate-700'
              : selisih > 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <span className="text-xs font-bold uppercase">Selisih Hitung:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-base">
              {selisih > 0 && <ArrowUpRight className="w-4 h-4" />}
              {selisih < 0 && <ArrowDownRight className="w-4 h-4" />}
              <span>{selisih > 0 ? `+${selisih}` : selisih} Unit</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Catatan / Alasan Penyesuaian</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              placeholder="Contoh: Barang fisik hilang / rusak saat disimpan"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Update Stok Opname
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
