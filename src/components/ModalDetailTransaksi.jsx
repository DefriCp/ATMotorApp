import React from 'react';
import { X, Receipt, Wrench, Package, Printer, CheckCircle2, UserCheck, DollarSign } from 'lucide-react';
import { formatRupiah, formatTanggal } from '../utils/formatters';

export default function ModalDetailTransaksi({ isOpen, onClose, transaksi, onPrintStruk }) {
  if (!isOpen || !transaksi) return null;

  const detailItems = transaksi.detail_items || [];
  const hpp = transaksi.hpp_barang || 0;
  const labaBarang = transaksi.subtotal_barang - hpp;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 font-mono">{transaksi.no_nota}</h3>
              <p className="text-xs text-slate-500 font-medium">{formatTanggal(transaksi.tanggal)}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Info Mekanik & Ringkasan */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-semibold uppercase block">Mekanik Servis:</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                {transaksi.nama_montir || 'Montir Bengkel'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-500 font-semibold uppercase block">Status Pembayaran:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Tunai
              </span>
            </div>
          </div>

          {/* Rincian Items Barang */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-600" />
              Rincian Sparepart & Barang
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Nama Sparepart</th>
                    <th className="px-4 py-2.5 text-center">Harga Beli</th>
                    <th className="px-4 py-2.5 text-center">Harga Jual</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {detailItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-slate-400 font-medium">
                        Tidak ada sparepart barang (Hanya Jasa Servis).
                      </td>
                    </tr>
                  ) : (
                    detailItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-900">{item.nama_produk}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-slate-500">{formatRupiah(item.harga_beli)}</td>
                        <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-800">{formatRupiah(item.harga_jual)}</td>
                        <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-900">{item.jumlah}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rincian Analisis Keuangan & Laba per Nota */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Omset Barang:</span>
              <span className="font-bold text-slate-900">{formatRupiah(transaksi.subtotal_barang)}</span>
            </div>

            <div className="flex justify-between text-rose-600 font-medium">
              <span>Total Modal HPP Barang:</span>
              <span>-{formatRupiah(hpp)}</span>
            </div>

            <div className="flex justify-between text-blue-700 font-bold border-t border-slate-200 pt-1.5">
              <span>Laba Bersih Sparepart Nota Ini:</span>
              <span>+{formatRupiah(labaBarang)}</span>
            </div>

            <div className="flex justify-between text-teal-700 font-bold">
              <span>Jasa Montir / Mekanik:</span>
              <span>+{formatRupiah(transaksi.ongkos_montir)}</span>
            </div>

            {transaksi.diskon > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Diskon Nota:</span>
                <span>-{formatRupiah(transaksi.diskon)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 border-t border-slate-300 pt-2 font-mono">
              <span>TOTAL AKHIR PEMBAYARAN:</span>
              <span className="text-emerald-600 text-lg font-mono">{formatRupiah(transaksi.total_akhir)}</span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-dashed border-slate-200">
              <span>Tunai Bayar: {formatRupiah(transaksi.bayar)}</span>
              <span>Kembalian: {formatRupiah(transaksi.kembalian)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {onPrintStruk && (
            <button
              onClick={() => onPrintStruk(transaksi)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
            >
              <Printer className="w-4 h-4" />
              Cetak Ulang Struk
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold ml-auto"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
