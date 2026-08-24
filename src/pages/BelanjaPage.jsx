import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, RefreshCw, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { formatRupiah, formatTanggalSimple } from '../utils/formatters';

export default function BelanjaPage() {
  const [belanjaList, setBelanjaList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    kategori: 'Restok Sparepart',
    produk_id: '',
    jumlah_qty: '',
    harga_beli_satuan: '',
    judul: '',
    jumlah_biaya: '',
    keterangan: ''
  });

  const fetchData = async () => {
    try {
      if (window.electronAPI) {
        const resBelanja = await window.electronAPI.getBelanja();
        const resProduk = await window.electronAPI.getProduk();
        setBelanjaList(resBelanja || []);
        setProdukList(resProduk || []);
      }
    } catch (err) {
      console.error("Gagal memuat data belanja:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectProduk = (prodId) => {
    if (!prodId) {
      setFormData(prev => ({ ...prev, produk_id: '', harga_beli_satuan: '', judul: '' }));
      return;
    }
    const prod = produkList.find(p => p.id === parseInt(prodId));
    if (prod) {
      const qty = parseInt(formData.jumlah_qty) || 1;
      const hargaBeli = prod.harga_beli || 0;
      setFormData(prev => ({
        ...prev,
        produk_id: prod.id,
        harga_beli_satuan: hargaBeli,
        judul: `Pembelian Restok ${prod.nama}`,
        jumlah_biaya: (hargaBeli * qty).toString()
      }));
    }
  };

  const handleQtyChange = (qty) => {
    const q = parseInt(qty) || 0;
    const h = parseFloat(formData.harga_beli_satuan) || 0;
    setFormData(prev => ({
      ...prev,
      jumlah_qty: qty,
      jumlah_biaya: (q * h).toString()
    }));
  };

  const handleHargaBeliChange = (harga) => {
    const h = parseFloat(harga) || 0;
    const q = parseInt(formData.jumlah_qty) || 0;
    setFormData(prev => ({
      ...prev,
      harga_beli_satuan: harga,
      jumlah_biaya: (q * h).toString()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.jumlah_biaya) {
      alert("Harap isi Judul Belanja dan Jumlah Biaya!");
      return;
    }

    try {
      if (window.electronAPI) {
        await window.electronAPI.addBelanja(formData);
        await fetchData();
        setIsModalOpen(false);
        setFormData({
          kategori: 'Restok Sparepart',
          produk_id: '',
          jumlah_qty: '',
          harga_beli_satuan: '',
          judul: '',
          jumlah_biaya: '',
          keterangan: ''
        });
      }
    } catch (err) {
      alert(`Gagal menyimpan belanja: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus catatan belanja ini?")) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.deleteBelanja(id);
          await fetchData();
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const totalBelanja = belanjaList.reduce((acc, curr) => acc + curr.jumlah_biaya, 0);

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-rose-600" />
            Pengeluaran Belanja & Restok Barang
          </h1>
          <p className="text-xs text-slate-500">Pencatatan belanja restok (otomatis menambah stok & log opname) dan operasional.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Catat Belanja / Restok Baru
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-md">
        <span className="text-xs font-bold text-slate-500 uppercase">Total Pengeluaran Belanja</span>
        <div className="text-2xl font-extrabold text-rose-600 font-mono mt-2">
          {formatRupiah(totalBelanja)}
        </div>
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Direct Stock Opname Integration
        </p>
      </div>

      {/* Table Belanja */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">No. Ref & Tanggal</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Nama Barang / Judul</th>
              <th className="px-6 py-4 text-center">Qty Restok</th>
              <th className="px-6 py-4">Harga Beli Satuan</th>
              <th className="px-6 py-4">Total Biaya</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {belanjaList.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                  Belum ada catatan belanja pengeluaran.
                </td>
              </tr>
            ) : (
              belanjaList.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs">
                    <div className="font-bold text-slate-900">{b.no_referensi}</div>
                    <div className="text-slate-500">{formatTanggalSimple(b.tanggal)}</div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      b.produk_id 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-rose-700 border border-slate-200'
                    }`}>
                      {b.kategori}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{b.judul}</div>
                    {b.nama_produk && b.nama_produk !== '-' && (
                      <div className="text-xs text-emerald-600 font-mono font-semibold flex items-center gap-1 mt-0.5">
                        <ArrowUpRight className="w-3 h-3" /> Auto +{b.jumlah_qty} Unit ke Stok
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-900">
                    {b.jumlah_qty ? `${b.jumlah_qty} Unit` : '-'}
                  </td>

                  <td className="px-6 py-4 font-mono text-slate-600 font-medium">
                    {b.harga_beli_satuan ? formatRupiah(b.harga_beli_satuan) : '-'}
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-rose-600">
                    {formatRupiah(b.jumlah_biaya)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Belanja */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Catat Belanja / Restok Barang</h3>
              <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                Otomatis Update Stok
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Kategori Belanja</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Restok Sparepart">Restok Sparepart (Otomatis Tambah Stok)</option>
                  <option value="Alat Bengkel">Alat & Perkakas Bengkel</option>
                  <option value="Operasional">Operasional (Listrik/Air/Internet)</option>
                  <option value="Gaji / Uang Makan">Gaji / Uang Makan Montir</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              {formData.kategori === 'Restok Sparepart' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Pilih Barang yang Ditingkatkan Stoknya</label>
                    <select
                      value={formData.produk_id}
                      onChange={(e) => handleSelectProduk(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="">-- Pilih Sparepart --</option>
                      {produkList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nama} (Stok Saat Ini: {p.stok} Unit)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Jumlah Qty Beli</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.jumlah_qty}
                        onChange={(e) => handleQtyChange(e.target.value)}
                        placeholder="Isi Jumlah Qty..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Harga Beli Satuan (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.harga_beli_satuan}
                        onChange={(e) => handleHargaBeliChange(e.target.value)}
                        placeholder="Isi Harga Beli Satuan..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Judul / Keperluan Belanja</label>
                <input
                  type="text"
                  required
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Isi Judul Belanja..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Total Biaya Belanja (Rp)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.jumlah_biaya}
                  onChange={(e) => setFormData({ ...formData, jumlah_biaya: e.target.value })}
                  placeholder="Isi Total Biaya..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-base font-bold text-rose-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Catatan Keterangan</label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Isi Catatan Keterangan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md shadow-rose-600/20"
                >
                  Simpan & Otomatis Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
