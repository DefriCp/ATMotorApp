import * as XLSX from 'xlsx';

/**
 * Utility Export Data ke File Excel (.xlsx) untuk Bengkel AT Motor Tasikmalaya
 */

export function exportToExcel(data, fileName = 'Laporan_Bengkel', sheetName = 'Data') {
  try {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diekspor ke Excel!");
      return;
    }

    // Buat worksheet dari JSON array
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate dan download file Excel
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${fileName}_${dateStr}.xlsx`);
  } catch (err) {
    console.error("Gagal mengekspor file Excel:", err);
    alert(`Gagal mengekspor Excel: ${err.message}`);
  }
}
