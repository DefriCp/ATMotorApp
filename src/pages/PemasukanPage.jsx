import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, FileText, TrendingUp, TrendingDown, Download, Calendar, Filter, Eye, Wrench, ShoppingBag, ShoppingCart } from 'lucide-react';
import { formatRupiah, formatTanggal } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExport';
import ModalDetailTransaksi from '../components/ModalDetailTransaksi';

export default function PemasukanPage({ onPrintStruk }) {
  const [pemasukanList, setPemasukanList] = useState([]);
  const [belanjaList, setBelanjaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Detail
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // State Filter Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState('semua');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        const dataPemasukan = await window.electronAPI.getPemasukan();
        const dataBelanja = await window.electronAPI.getBelanja();
        setPemasukanList(dataPemasukan || []);
        setBelanjaList(dataBelanja || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data pemasukan & belanja:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Transaksi Pemasukan Berdasarkan Tanggal
  const filteredList = pemasukanList.filter(tx => {
    if (!tx.tanggal) return true;
    const txDate = tx.tanggal.split('T')[0];
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;
    return true;
  });

  // Filter Pengeluaran Belanja Berdasarkan Tanggal
  const filteredBelanjaList = belanjaList.filter(b => {
    if (!b.tanggal) return true;
    const bDate = b.tanggal.split('T')[0];
    if (startDate && bDate < startDate) return false;
    if (endDate && bDate > endDate) return false;
    return true;
  });

  // Preset Handler Filter Tanggal
  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'hari_ini') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7_hari') {
      const d7 = new Date(today);
      d7.setDate(today.getDate() - 6);
      setStartDate(d7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'bulan_ini') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleOpenDetail = (tx) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  // --- KALKULASI FINANSIAL PERSIS (TANPA MEMASUKKAN JASA MONTIR KE LABA BERSIH BENGKEL) ---
  // 1. Total Penjualan Barang (Omset Barang)
  const totalOmsetBarang = filteredList.reduce((acc, curr) => acc + curr.subtotal_barang, 0);
  
  // 2. Modal HPP Barang (Harga Beli)
  const totalHppBarang = filteredList.reduce((acc, curr) => acc + (curr.hpp_barang || 0), 0);
  
  // 3. Laba Penjualan Sparepart = Omset Barang - Modal HPP
  const labaBarangAll = totalOmsetBarang - totalHppBarang;
  
  // 4. Total Jasa Montir (Terpisah Murni Servis)
  const totalOngkosMontir = filteredList.reduce((acc, curr) => acc + curr.ongkos_montir, 0);
  
  // 5. Total Pendapatan Kotor Kasir (Omset Barang + Jasa Montir - Diskon)
  const totalOmsetKotorKasir = filteredList.reduce((acc, curr) => acc + curr.total_akhir, 0);

  // 6. Total Belanja Operasional Terfilter
  const totalBelanja = filteredBelanjaList.reduce((acc, curr) => acc + curr.jumlah_biaya, 0);
  
  // 7. LABA BERSIH BENGKEL = Laba Sparepart (Murni Barang) - Total Belanja (TIDAK Memasukkan Jasa Montir)
  const labaBersih = labaBarangAll - totalBelanja;
  const isMinus = labaBersih < 0;

  const handleExportExcel = () => {
    const excelData = filteredList.map(tx => ({
      "No. Nota": tx.no_nota,
      "Tanggal": formatTanggal(tx.tanggal),
      "Mekanik": tx.nama_montir || 'Montir Bengkel',
      "Omset Barang (Rp)": tx.subtotal_barang,
      "HPP Modal Barang (Rp)": tx.hpp_barang || 0,
      "Laba Barang (Rp)": tx.subtotal_barang - (tx.hpp_barang || 0),
      "Ongkos Montir (Rp)": tx.ongkos_montir,
      "Diskon (Rp)": tx.diskon || 0,
      "Total Akhir Nota (Rp)": tx.total_akhir
    }));
    exportToExcel(excelData, 'Laporan_Pemasukan_AT_Motor', 'Laporan Pemasukan');
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Laporan Pemasukan & Kalkulasi Keuangan
          </h1>
          <p className="text-xs text-slate-500">Analisis Laba Bersih Bengkel (Laba Sparepart - Belanja), Jasa Montir Terpisah, dan Kasir.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            Export Excel ({filteredList.length} Transaksi)
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-bold shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Pemasukan
          </button>
        </div>
      </div>

      {/* FILTER TANGGAL */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter Rentang:
          </span>

          <button
            onClick={() => handlePresetChange('semua')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'semua'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Tanggal
          </button>

          <button
            onClick={() => handlePresetChange('hari_ini')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'hari_ini'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>

          <button
            onClick={() => handlePresetChange('7_hari')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === '7_hari'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 Hari Terakhir
          </button>

          <button
            onClick={() => handlePresetChange('bulan_ini')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'bulan_ini'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulan Ini
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setActivePreset('custom'); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">s/d</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setActivePreset('custom'); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 4 KARTU HIGHLIGHT UTAMA (LABA BERSIH = LABA SPAREPART - BELANJA) */}
      <div className="grid grid-cols-4 gap-4">
        {/* CARD 1: LABA BERSIH BENGKEL (NET PROFIT SPAREPART - BELANJA) */}
        <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-colors ${
          isMinus 
            ? 'bg-gradient-to-br from-rose-50 to-white border-rose-300' 
            : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-300'
        }`}>
          <div className={`flex items-center justify-between text-xs font-extrabold uppercase tracking-wider ${
            isMinus ? 'text-rose-800' : 'text-emerald-800'
          }`}>
            <span>LABA BERSIH BENGKEL</span>
            {isMinus ? (
              <TrendingDown className="w-5 h-5 text-rose-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className={`text-2xl font-black font-mono mt-2 ${
            isMinus ? 'text-rose-600' : 'text-emerald-700'
          }`}>
            {formatRupiah(labaBersih)}
          </div>
          <p className="text-[10px] text-slate-600 mt-1 font-medium">
            (Laba Sparepart: {formatRupiah(labaBarangAll)} - Belanja: {formatRupiah(totalBelanja)})
          </p>
        </div>

        {/* CARD 2: LABA PENJUALAN SPAREPART */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Laba Sparepart</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-2">
            {formatRupiah(labaBarangAll)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Margin Barang (Harga Jual - Beli)</p>
        </div>

        {/* CARD 3: TOTAL JASA MONTIR (TERPISAH) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Total Jasa Montir</span>
            <Wrench className="w-4 h-4 text-teal-600" />
          </span>
          <div className="text-xl font-extrabold text-teal-700 font-mono mt-2">
            {formatRupiah(totalOngkosMontir)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Pendapatan Servis / Mekanik</p>
        </div>

        {/* CARD 4: TOTAL OMSET KASIR */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Omset Kasir Masuk</span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </span>
          <div className="text-xl font-extrabold text-blue-700 font-mono mt-2">
            {formatRupiah(totalOmsetKotorKasir)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Total Uang Tunai Diterima Kasir</p>
        </div>
      </div>

      {/* RINCIAN PERHITUNGAN PENJUALAN & MODAL */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 grid grid-cols-3 gap-4 text-xs font-mono shadow-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium">Total Omset Penjualan Barang:</div>
          <div className="text-sm font-bold text-slate-900 mt-1">{formatRupiah(totalOmsetBarang)}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium">Total Modal HPP Barang (Harga Beli):</div>
          <div className="text-sm font-bold text-rose-600 mt-1">-{formatRupiah(totalHppBarang)}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium">Total Pengeluaran Belanja Periode Ini:</div>
          <div className="text-sm font-bold text-amber-700 mt-1">-{formatRupiah(totalBelanja)}</div>
        </div>
      </div>

      {/* TABEL PEMASUKAN RINCI */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Histori Transaksi & Marjin Laba per Nota (Klik untuk Rincian Item)
          </h3>
          <span className="text-xs text-slate-500 font-mono font-bold">{filteredList.length} Transaksi Terfilter</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">No. Nota & Tanggal</th>
                <th className="px-6 py-3.5">Mekanik</th>
                <th className="px-6 py-3.5">Omset Barang</th>
                <th className="px-6 py-3.5">Modal HPP</th>
                <th className="px-6 py-3.5">Laba Barang</th>
                <th className="px-6 py-3.5">Ongkos Montir</th>
                <th className="px-6 py-3.5 text-right">Total Akhir</th>
                <th className="px-6 py-3.5 text-center">Aksi Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada transaksi pemasukan pada rentang tanggal yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredList.map((tx) => {
                  const hpp = tx.hpp_barang || 0;
                  const labaBrg = tx.subtotal_barang - hpp;
                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => handleOpenDetail(tx)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 font-mono group-hover:text-blue-600 transition-colors">{tx.no_nota}</div>
                        <div className="text-xs text-slate-500">{formatTanggal(tx.tanggal)}</div>
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                          {tx.nama_montir || 'Montir Bengkel'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-800">
                        {formatRupiah(tx.subtotal_barang)}
                      </td>

                      <td className="px-6 py-4 font-mono text-rose-600 text-xs font-semibold">
                        {formatRupiah(hpp)}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        +{formatRupiah(labaBrg)}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-teal-600">
                        +{formatRupiah(tx.ongkos_montir)}
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 text-base">
                        {formatRupiah(tx.total_akhir)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenDetail(tx); }}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all mx-auto shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Item</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POPUP RINCIAN ITEM DETAIL TRANSAKSI NOTA */}
      <ModalDetailTransaksi
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaksi={selectedTx}
        onPrintStruk={onPrintStruk}
      />
    </div>
  );
}
