import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, AlertCircle, RefreshCw, Wrench } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryIcons';

export default function KasirPage({ produkList, onSimpanTransaksi, onRefreshProduk }) {
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [kategoriList, setKategoriList] = useState(['Semua']);
  const [cart, setCart] = useState([]);

  const [ongkosMontir, setOngkosMontir] = useState(0);
  const [namaMontir, setNamaMontir] = useState('');
  const [diskon, setDiskon] = useState(0);
  const [nominalBayar, setNominalBayar] = useState('');

  const fetchKategori = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.getKategori();
        const namaKategori = (data || []).map(k => k.nama);
        setKategoriList(['Semua', ...namaKategori]);
      }
    } catch (err) {
      console.error("Gagal memuat kategori kasir:", err);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const filteredProduk = produkList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchKategori = selectedKategori === 'Semua' || p.kategori.toLowerCase() === selectedKategori.toLowerCase();
    return matchSearch && matchKategori;
  });

  const addToCart = (produk) => {
    if (produk.stok <= 0) {
      alert("Stok barang ini sudah habis!");
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === produk.id);
      if (existing) {
        if (existing.qty + 1 > produk.stok) {
          alert(`Stok maksimal tercapai (${produk.stok} unit)`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === produk.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...produk, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stok) {
            alert(`Stok maksimal tercapai (${item.stok} unit)`);
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const subtotalBarang = cart.reduce((acc, item) => acc + (item.harga_jual * item.qty), 0);
  const totalAkhir = Math.max(0, subtotalBarang + parseFloat(ongkosMontir || 0) - parseFloat(diskon || 0));
  const bayarNum = parseFloat(nominalBayar) || 0;
  const kembalian = bayarNum >= totalAkhir ? bayarNum - totalAkhir : 0;

  const handleCheckout = () => {
    if (cart.length === 0 && parseFloat(ongkosMontir || 0) <= 0) {
      alert("Keranjang belanja dan ongkos montir masih kosong!");
      return;
    }
    if (bayarNum < totalAkhir) {
      alert("Nominal pembayaran tunai kurang dari Total Akhir!");
      return;
    }

    const payload = {
      items: cart,
      subtotal_barang: subtotalBarang,
      ongkos_montir: parseFloat(ongkosMontir || 0),
      nama_montir: namaMontir || "Montir Bengkel",
      diskon: parseFloat(diskon || 0),
      total_akhir: totalAkhir,
      bayar: bayarNum,
      kembalian: kembalian
    };

    onSimpanTransaksi(payload);

    setCart([]);
    setOngkosMontir(0);
    setDiskon(0);
    setNominalBayar('');
  };

  const setQuickBayar = (amount) => {
    setNominalBayar(amount.toString());
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* KIRI: KATALOG BARANG & FILTER KATEGORI (70%) */}
      <div className="w-[70%] p-5 flex flex-col gap-4 border-r border-slate-200 overflow-y-auto">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Barang..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>
          <button
            onClick={() => { fetchKategori(); onRefreshProduk(); }}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors shadow-xs"
            title="Refresh Data SQLite"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Kategori Dinamis */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {kategoriList.map(kat => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${selectedKategori === kat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-xs'
                }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Grid Card Barang */}
        <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-1 pb-10 flex-1">
          {filteredProduk.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 mb-2 text-slate-300" />
              <p className="font-semibold text-sm">Barang tidak ditemukan</p>
            </div>
          ) : (
            filteredProduk.map((item) => {
              const isStokHabis = item.stok <= 0;
              const isStokRendah = item.stok <= item.stok_minimal;
              return (
                <div
                  key={item.id}
                  onClick={() => !isStokHabis && addToCart(item)}
                  className={`group bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer relative shadow-xs ${isStokHabis
                      ? 'border-slate-200 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-blue-500 hover:shadow-md'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                        {getCategoryIcon(item.kategori, "w-6 h-6")}
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${isStokHabis
                          ? 'bg-rose-500 text-white'
                          : isStokRendah
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-slate-100 text-emerald-700 border border-slate-200'
                        }`}>
                        {isStokHabis ? 'Habis' : `Stok: ${item.stok}`}
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.kategori}</div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mt-0.5 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.nama}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Harga Jual</div>
                      <div className="font-bold text-emerald-600 text-base font-mono">
                        {formatRupiah(item.harga_jual)}
                      </div>
                    </div>

                    <button
                      disabled={isStokHabis}
                      className={`p-2 rounded-xl transition-all ${isStokHabis
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                        }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* KANAN: PANEL KERANJANG (30%) */}
      <div className="w-[30%] bg-white border-l border-slate-200 flex flex-col justify-between h-full shadow-xs">
        {/* Header Keranjang */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-base">Keranjang Transaksi</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            {cart.reduce((a, b) => a + b.qty, 0)} Barang
          </span>
        </div>

        {/* List Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <ShoppingCart className="w-8 h-8 mb-2 text-slate-300" />
              <p className="font-semibold text-xs text-slate-500">Belum Ada Barang Dipilih</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  {getCategoryIcon(item.kategori, "w-4 h-4")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">{item.nama}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {formatRupiah(item.harga_jual)} x {item.qty}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 font-mono mt-0.5">
                    {formatRupiah(item.harga_jual * item.qty)}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-900 px-1">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}

          {/* INPUT ONGKOS MONTIR / JASA */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                Ongkos Montir / Jasa Service
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Nama Mekanik</label>
                <input
                  type="text"
                  value={namaMontir}
                  onChange={(e) => setNamaMontir(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Isi Nama Mekanik..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Biaya Jasa (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={ongkosMontir}
                  onChange={(e) => setOngkosMontir(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-600 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Isi Biaya Jasa..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Calculation */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Barang</span>
              <span className="font-mono font-semibold text-slate-900">{formatRupiah(subtotalBarang)}</span>
            </div>

            <div className="flex justify-between text-teal-700 font-semibold">
              <span>Ongkos Montir / Jasa</span>
              <span className="font-mono">+{formatRupiah(ongkosMontir)}</span>
            </div>

            <div className="flex justify-between text-slate-600 items-center">
              <span>Diskon (Rp)</span>
              <input
                type="number"
                min="0"
                value={diskon}
                onChange={(e) => setDiskon(e.target.value)}
                className="w-28 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-right text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="Isi Diskon..."
              />
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL AKHIR</span>
              <span className="text-emerald-600 text-lg font-mono font-extrabold">{formatRupiah(totalAkhir)}</span>
            </div>
          </div>

          {/* Nominal Bayar */}
          <div>
            <input
              type="number"
              min="0"
              value={nominalBayar}
              onChange={(e) => setNominalBayar(e.target.value)}
              className="w-full bg-white border border-blue-300 rounded-xl px-3.5 py-2 text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-xs"
              placeholder="Isi Nominal Bayar..."
            />

            <div className="flex gap-1.5 mt-2">
              <button
                onClick={() => setQuickBayar(totalAkhir)}
                className="flex-1 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700"
              >
                Pas
              </button>
              <button
                onClick={() => setQuickBayar(50000)}
                className="flex-1 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700"
              >
                50rb
              </button>
              <button
                onClick={() => setQuickBayar(100000)}
                className="flex-1 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700"
              >
                100rb
              </button>
            </div>
          </div>

          {/* Kembalian */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs shadow-xs">
            <span className="font-bold text-slate-500 uppercase">Kembalian:</span>
            <span className={`text-base font-bold font-mono ${bayarNum >= totalAkhir ? 'text-blue-600' : 'text-slate-400'}`}>
              {formatRupiah(kembalian)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={(cart.length === 0 && parseFloat(ongkosMontir || 0) <= 0) || bayarNum < totalAkhir}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${(cart.length > 0 || parseFloat(ongkosMontir || 0) > 0) && bayarNum >= totalAkhir
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/20 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            Selesaikan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
