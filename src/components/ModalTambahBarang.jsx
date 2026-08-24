import React, { useState, useEffect } from 'react';
import { X, Save, PackagePlus, Plus } from 'lucide-react';

export default function ModalTambahBarang({ isOpen, onClose, onSave, itemToEdit = null }) {
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'Oli & Pelumas',
    harga_beli: '',
    harga_jual: '',
    stok: '',
    stok_minimal: '5'
  });

  const [kategoriList, setKategoriList] = useState([]);
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [newKatNama, setNewKatNama] = useState('');

  const fetchKategori = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.getKategori();
        setKategoriList(data || []);
        if (data && data.length > 0 && !formData.kategori) {
          setFormData(prev => ({ ...prev, kategori: data[0].nama }));
        }
      }
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKategori();
      if (itemToEdit) {
        setFormData({
          nama: itemToEdit.nama || '',
          kategori: itemToEdit.kategori || 'Oli & Pelumas',
          harga_beli: itemToEdit.harga_beli || '',
          harga_jual: itemToEdit.harga_jual || '',
          stok: itemToEdit.stok || '',
          stok_minimal: itemToEdit.stok_minimal || '5'
        });
      } else {
        setFormData({
          nama: '',
          kategori: 'Oli & Pelumas',
          harga_beli: '',
          harga_jual: '',
          stok: '',
          stok_minimal: '5'
        });
      }
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTambahKategoriBaru = async (e) => {
    e.preventDefault();
    if (!newKatNama.trim()) return;
    try {
      if (window.electronAPI) {
        const newKat = await window.electronAPI.addKategori(newKatNama.trim());
        await fetchKategori();
        setFormData(prev => ({ ...prev, kategori: newKat.nama }));
        setNewKatNama('');
        setShowAddKategori(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.harga_jual || formData.stok === '') {
      alert("Harap isi Nama Barang, Harga Jual, dan Stok!");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <PackagePlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">
              {itemToEdit ? 'Edit Sparepart Bengkel' : 'Tambah Sparepart Baru'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Kategori Barang</label>
              <button
                type="button"
                onClick={() => setShowAddKategori(!showAddKategori)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Tambah Kategori
              </button>
            </div>

            {showAddKategori ? (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKatNama}
                  onChange={(e) => setNewKatNama(e.target.value)}
                  placeholder="Isi Kategori Baru..."
                  className="flex-1 bg-slate-50 border border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={handleTambahKategoriBaru}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {kategoriList.map((kat) => (
                  <option key={kat.id} value={kat.nama}>{kat.nama}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Sparepart / Barang</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              placeholder="Isi Nama Barang..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Harga Beli (Rp)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.harga_beli}
                onChange={(e) => setFormData({ ...formData, harga_beli: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                placeholder="Isi Harga Beli..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.harga_jual}
                onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-emerald-600 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="Isi Harga Jual..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Stok Awal</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                placeholder="Isi Stok Awal..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Stok Minimal</label>
              <input
                type="number"
                min="1"
                required
                value={formData.stok_minimal}
                onChange={(e) => setFormData({ ...formData, stok_minimal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                placeholder="Isi Stok Minimal..."
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Sparepart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
