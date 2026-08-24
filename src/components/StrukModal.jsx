import React from 'react';
import { X, Printer, CheckCircle, Wrench } from 'lucide-react';
import { formatRupiah, formatTanggal } from '../utils/formatters';

export default function StrukModal({ isOpen, onClose, dataTransaksi }) {
  if (!isOpen || !dataTransaksi) return null;

  const { transaksi, detail } = dataTransaksi;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Transaksi Sukses!</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tampilan Struk */}
        <div id="section-to-print" className="p-6 bg-slate-950 font-mono text-slate-200 text-xs space-y-4 border-b border-slate-800">
          {/* Header Struk */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 mb-1">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white uppercase tracking-wider">BENGKEL MOTOR & MOBIL</h2>
            <p className="text-[10px] text-slate-400">Jl. Raya Otomotif No. 88, Kota Bengkel</p>
            <p className="text-[10px] text-slate-400">Telp/WA: 0812-3456-7890</p>
            <div className="border-b border-dashed border-slate-700 my-2"></div>
          </div>

          {/* Info Nota */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">No. Nota:</span>
              <span className="font-bold text-white">{transaksi.no_nota}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tanggal:</span>
              <span>{formatTanggal(transaksi.tanggal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mekanik:</span>
              <span>{transaksi.nama_montir || 'Montir Bengkel'}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-700 my-2"></div>

          {/* Items Barang */}
          {detail && detail.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Item Sparepart:</div>
              {detail.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-sans font-medium text-white text-[12px]">{item.nama_produk}</div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{item.jumlah} x {formatRupiah(item.harga_jual)}</span>
                    <span className="font-semibold text-slate-200">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-b border-dashed border-slate-700 my-2"></div>

          {/* Total Calculation */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal Barang:</span>
              <span>{formatRupiah(transaksi.subtotal_barang)}</span>
            </div>
            {transaksi.ongkos_montir > 0 && (
              <div className="flex justify-between text-teal-400">
                <span>Ongkos Montir/Jasa:</span>
                <span>+{formatRupiah(transaksi.ongkos_montir)}</span>
              </div>
            )}
            {transaksi.diskon > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Diskon:</span>
                <span>-{formatRupiah(transaksi.diskon)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-1">
              <span>TOTAL AKHIR:</span>
              <span className="text-emerald-400">{formatRupiah(transaksi.total_akhir)}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1">
              <span>Bayar (Tunai):</span>
              <span>{formatRupiah(transaksi.bayar)}</span>
            </div>
            <div className="flex justify-between font-bold text-blue-400">
              <span>Kembalian:</span>
              <span>{formatRupiah(transaksi.kembalian)}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-700 my-2"></div>

          <div className="text-center text-[10px] text-slate-500 italic">
            *** Terima kasih atas kunjungan servis Anda ***
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk Nota
          </button>
        </div>
      </div>
    </div>
  );
}
