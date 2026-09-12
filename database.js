const path = require('path');
const fs = require('fs');

/**
 * Database SQLite Lokal Persistent Store Bengkel POS
 * Fitur:
 * - Pengurutan Barang A-Z
 * - Input Tanggal Backdate Transaksi
 * - Montir Opsional (Tanpa Montir)
 * - Diskon Mengurangi Laba Sparepart
 */

class BengkelDatabase {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'bengkel_db.json');
    this.data = {
      pengguna: [],
      kategori: [],
      produk: [],
      transaksi: [],
      detail_transaksi: [],
      stok_opname_log: [],
      belanja: []
    };
    this.initDatabase();
  }

  initDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.pengguna || this.data.pengguna.length === 0) {
          this.seedUsers();
          this.saveDatabase();
        }
      } else {
        this.seedCleanDatabase();
        this.saveDatabase();
      }
    } catch (err) {
      console.error("Gagal memuat database, menginisialisasi database bersih:", err);
      this.seedCleanDatabase();
    }
  }

  saveDatabase() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Gagal menyimpan database:", err);
    }
  }

  seedUsers() {
    this.data.pengguna = [
      {
        id: 1,
        username: "Admin",
        password: "Atmotor123",
        nama_lengkap: "AT Motor Tasikmalaya",
        peran: "Admin",
        created_at: new Date().toISOString()
      }
    ];
  }

  seedKategori() {
    this.data.kategori = [
      { id: 1, nama: "Oli & Pelumas" },
      { id: 2, nama: "Ban" },
      { id: 3, nama: "Rem" },
      { id: 4, nama: "Kelistrikan" },
      { id: 5, nama: "Drive Train" },
      { id: 6, nama: "Aksesoris" },
      { id: 7, nama: "Lainnya" }
    ];
  }

  seedCleanDatabase() {
    this.seedUsers();
    this.seedKategori();
    this.data.produk = [];
    this.data.transaksi = [];
    this.data.detail_transaksi = [];
    this.data.stok_opname_log = [];
    this.data.belanja = [];
  }

  // --- KATEGORI BARANG DINAMIS ---
  getKategori() {
    return this.data.kategori || [];
  }

  addKategori(nama) {
    if (!nama || !nama.trim()) throw new Error("Nama kategori tidak boleh kosong!");
    const exists = this.data.kategori.some(k => k.nama.toLowerCase() === nama.trim().toLowerCase());
    if (exists) throw new Error("Kategori ini sudah ada!");

    const newId = this.data.kategori.length > 0 ? Math.max(...this.data.kategori.map(k => k.id)) + 1 : 1;
    const newKat = { id: newId, nama: nama.trim() };
    this.data.kategori.push(newKat);
    this.saveDatabase();
    return newKat;
  }

  deleteKategori(id) {
    this.data.kategori = this.data.kategori.filter(k => k.id !== parseInt(id));
    this.saveDatabase();
    return { success: true };
  }

  // --- AUTH & USER ---
  loginUser(username, password) {
    const user = this.data.pengguna.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Username atau password salah!");
    return { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap, peran: user.peran };
  }

  getPengguna() {
    return this.data.pengguna.map(u => ({ id: u.id, username: u.username, nama_lengkap: u.nama_lengkap, peran: u.peran, created_at: u.created_at }));
  }

  addPengguna(item) {
    const exists = this.data.pengguna.some(u => u.username.toLowerCase() === item.username.trim().toLowerCase());
    if (exists) throw new Error("Username sudah digunakan!");

    const newId = this.data.pengguna.length > 0 ? Math.max(...this.data.pengguna.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      username: item.username.trim(),
      password: item.password || "Atmotor123",
      nama_lengkap: item.nama_lengkap,
      peran: item.peran || "Admin",
      created_at: new Date().toISOString()
    };
    this.data.pengguna.push(newUser);
    this.saveDatabase();
    return newUser;
  }

  deletePengguna(id) {
    if (parseInt(id) === 1) throw new Error("Akun Utama tidak dapat dihapus!");
    this.data.pengguna = this.data.pengguna.filter(u => u.id !== parseInt(id));
    this.saveDatabase();
    return { success: true };
  }

  // --- QUERY BARANG (DIURUTKAN ABJAD A-Z) ---
  getProduk(querySearch = '', kategori = '') {
    let result = [...this.data.produk];
    if (kategori && kategori !== 'Semua') {
      result = result.filter(p => p.kategori.toLowerCase() === kategori.toLowerCase());
    }
    if (querySearch) {
      const q = querySearch.toLowerCase();
      result = result.filter(p => p.nama.toLowerCase().includes(q));
    }

    // Urutkan Abjad A-Z berdasarkan Nama Barang
    result.sort((a, b) => a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }));

    return result;
  }

  addProduk(item) {
    const newId = this.data.produk.length > 0 ? Math.max(...this.data.produk.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      nama: item.nama,
      kategori: item.kategori || "Umum",
      harga_beli: parseFloat(item.harga_beli) || 0,
      harga_jual: parseFloat(item.harga_jual) || 0,
      stok: parseInt(item.stok) || 0,
      stok_minimal: parseInt(item.stok_minimal) || 5,
      created_at: new Date().toISOString()
    };

    this.data.produk.push(newProduct);
    this.saveDatabase();
    return newProduct;
  }

  updateProduk(id, updatedFields) {
    const index = this.data.produk.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      this.data.produk[index] = {
        ...this.data.produk[index],
        ...updatedFields,
        harga_beli: parseFloat(updatedFields.harga_beli ?? this.data.produk[index].harga_beli),
        harga_jual: parseFloat(updatedFields.harga_jual ?? this.data.produk[index].harga_jual),
        stok: parseInt(updatedFields.stok ?? this.data.produk[index].stok),
        stok_minimal: parseInt(updatedFields.stok_minimal ?? this.data.produk[index].stok_minimal)
      };
      this.saveDatabase();
      return this.data.produk[index];
    }
    throw new Error(`Barang tidak ditemukan`);
  }

  deleteProduk(id) {
    this.data.produk = this.data.produk.filter(p => p.id !== parseInt(id));
    this.saveDatabase();
    return { success: true };
  }

  // --- STOK OPNAME ---
  stokOpname(id, stokBaru, keterangan = "Penyesuaian Fisik Stok Opname") {
    const prod = this.data.produk.find(p => p.id === parseInt(id));
    if (!prod) throw new Error("Barang tidak ditemukan");

    const stokSebelum = prod.stok;
    const selisih = parseInt(stokBaru) - stokSebelum;
    prod.stok = parseInt(stokBaru);

    const logEntry = {
      id: this.data.stok_opname_log.length + 1,
      produk_id: prod.id,
      nama_produk: prod.nama,
      stok_sebelum: stokSebelum,
      stok_sesudah: parseInt(stokBaru),
      selisih: selisih,
      keterangan: keterangan,
      tanggal: new Date().toISOString()
    };

    this.data.stok_opname_log.unshift(logEntry);
    this.saveDatabase();
    return { produk: prod, log: logEntry };
  }

  getStokOpnameLog() {
    return this.data.stok_opname_log || [];
  }

  // --- TRANSAKSI POS (MENDUKUNG BACKDATE TANGGAL & DISKON MEMOTONG LABA) ---
  simpanTransaksi(payload) {
    const { items, subtotal_barang, ongkos_montir, nama_montir, diskon, total_akhir, bayar, kembalian, tanggal } = payload;

    let hppTotal = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        const prod = this.data.produk.find(p => p.id === item.id);
        if (!prod) throw new Error(`Barang ${item.nama} tidak ditemukan`);
        if (prod.stok < item.qty) {
          throw new Error(`Stok ${prod.nama} tidak mencukupi (Tersisa: ${prod.stok})`);
        }
        hppTotal += (prod.harga_beli * item.qty);
      }
    }

    const txId = this.data.transaksi.length + 1;
    const now = new Date();
    
    // Format Tanggal Kustom (Backdate) atau Waktu Sekarang
    let txTanggalISO = now.toISOString();
    if (tanggal) {
      if (tanggal.includes('T')) {
        txTanggalISO = new Date(tanggal).toISOString();
      } else {
        const timePart = now.toTimeString().split(' ')[0];
        txTanggalISO = new Date(`${tanggal}T${timePart}`).toISOString();
      }
    }

    const dObj = new Date(txTanggalISO);
    const noNota = `NOT-${dObj.getFullYear()}${String(dObj.getMonth()+1).padStart(2,'0')}${String(dObj.getDate()).padStart(2,'0')}-${String(txId).padStart(4,'0')}`;

    // Diskon mengurangi laba bersih sparepart secara langsung!
    const diskonVal = parseFloat(diskon || 0);
    const labaBarang = (parseFloat(subtotal_barang || 0) - hppTotal) - diskonVal;

    const transaksiBaru = {
      id: txId,
      no_nota: noNota,
      tanggal: txTanggalISO,
      subtotal_barang: parseFloat(subtotal_barang || 0),
      hpp_barang: hppTotal,
      laba_barang: labaBarang,
      ongkos_montir: parseFloat(ongkos_montir || 0),
      nama_montir: nama_montir && nama_montir.trim() ? nama_montir.trim() : "Tanpa Montir",
      diskon: diskonVal,
      total_akhir: parseFloat(total_akhir),
      bayar: parseFloat(bayar),
      kembalian: parseFloat(kembalian)
    };

    this.data.transaksi.unshift(transaksiBaru);

    // Kurangi stok barang
    const detailList = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const prod = this.data.produk.find(p => p.id === item.id);
        prod.stok -= item.qty;

        const detailObj = {
          id: this.data.detail_transaksi.length + 1,
          transaksi_id: txId,
          produk_id: item.id,
          nama_produk: item.nama,
          harga_beli: prod.harga_beli,
          harga_jual: item.harga_jual,
          jumlah: item.qty,
          subtotal: item.harga_jual * item.qty
        };

        this.data.detail_transaksi.push(detailObj);
        detailList.push(detailObj);
      }
    }

    this.saveDatabase();
    return { transaksi: transaksiBaru, detail: detailList };
  }

  // --- QUERY PEMASUKAN ---
  getPemasukan() {
    return this.data.transaksi.map(t => {
      const details = this.data.detail_transaksi.filter(d => d.transaksi_id === t.id);
      return {
        ...t,
        detail_items: details
      };
    });
  }

  // --- QUERY BELANJA RESTOK ---
  getBelanja() {
    return this.data.belanja || [];
  }

  addBelanja(item) {
    const newId = this.data.belanja.length > 0 ? Math.max(...this.data.belanja.map(b => b.id)) + 1 : 1;
    const now = new Date();
    const noRef = `BLJ-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(newId).padStart(3,'0')}`;

    const qtyRestok = parseInt(item.jumlah_qty) || 0;
    const prodId = item.produk_id ? parseInt(item.produk_id) : null;
    let prodNama = item.nama_produk || "-";

    if (prodId) {
      const prod = this.data.produk.find(p => p.id === prodId);
      if (prod) {
        prodNama = prod.nama;
        const stokSebelum = prod.stok;
        prod.stok += qtyRestok;

        if (item.harga_beli_satuan) {
          prod.harga_beli = parseFloat(item.harga_beli_satuan);
        }

        const logOpnameObj = {
          id: this.data.stok_opname_log.length + 1,
          produk_id: prod.id,
          nama_produk: prod.nama,
          stok_sebelum: stokSebelum,
          stok_sesudah: prod.stok,
          selisih: qtyRestok,
          keterangan: `Restok Pembelian Belanja (${noRef})`,
          tanggal: now.toISOString()
        };
        this.data.stok_opname_log.unshift(logOpnameObj);
      }
    }

    const newBelanja = {
      id: newId,
      no_referensi: noRef,
      tanggal: item.tanggal ? new Date(item.tanggal).toISOString() : now.toISOString(),
      kategori: item.kategori || "Restok Sparepart",
      produk_id: prodId,
      nama_produk: prodNama,
      jumlah_qty: qtyRestok,
      harga_beli_satuan: parseFloat(item.harga_beli_satuan) || 0,
      judul: item.judul || `Pembelian Restok ${prodNama}`,
      jumlah_biaya: parseFloat(item.jumlah_biaya) || 0,
      keterangan: item.keterangan || "-"
    };

    this.data.belanja.unshift(newBelanja);
    this.saveDatabase();
    return newBelanja;
  }

  deleteBelanja(id) {
    this.data.belanja = this.data.belanja.filter(b => b.id !== parseInt(id));
    this.saveDatabase();
    return { success: true };
  }

  // --- QUERY DASHBOARD STATS ---
  getDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const txHariIni = this.data.transaksi.filter(t => t.tanggal.startsWith(todayStr));
    const totalPemasukanHariIni = txHariIni.reduce((acc, curr) => acc + curr.total_akhir, 0);
    const totalPemasukanBarangHariIni = txHariIni.reduce((acc, curr) => acc + curr.subtotal_barang, 0);
    const totalOngkosMontirHariIni = txHariIni.reduce((acc, curr) => acc + curr.ongkos_montir, 0);
    const totalTransaksiHariIni = txHariIni.length;

    const totalOmsetBarangAll = this.data.transaksi.reduce((acc, curr) => acc + curr.subtotal_barang, 0);
    const totalHppBarangAll = this.data.transaksi.reduce((acc, curr) => acc + (curr.hpp_barang || 0), 0);
    const totalDiskonAll = this.data.transaksi.reduce((acc, curr) => acc + (curr.diskon || 0), 0);
    
    // Laba Sparepart All = Total Omset - Total HPP - Total Diskon
    const totalLabaBarangAll = (totalOmsetBarangAll - totalHppBarangAll) - totalDiskonAll;

    const totalOngkosMontirAll = this.data.transaksi.reduce((acc, curr) => acc + curr.ongkos_montir, 0);

    const totalBelanjaAll = this.data.belanja.reduce((acc, curr) => acc + curr.jumlah_biaya, 0);

    // Laba Bersih Bengkel = Laba Sparepart (setelah terpotong diskon) - Total Belanja
    const labaBersihAll = totalLabaBarangAll - totalBelanjaAll;

    const produkStokRendah = this.data.produk.filter(p => p.stok <= p.stok_minimal);

    return {
      totalPemasukanHariIni,
      totalPemasukanBarangHariIni,
      totalOngkosMontirHariIni,
      totalTransaksiHariIni,
      totalOmsetBarangAll,
      totalHppBarangAll,
      totalLabaBarangAll,
      totalOngkosMontirAll,
      totalBelanjaKeseluruhan: totalBelanjaAll,
      labaBersihTotal: labaBersihAll,
      jumlahStokRendah: produkStokRendah.length,
      produkStokRendah: produkStokRendah
    };
  }

  getPenjualan7Hari() {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      
      const txs = this.data.transaksi.filter(t => t.tanggal.startsWith(dateStr));
      const omsetBarang = txs.reduce((acc, curr) => acc + curr.subtotal_barang, 0);
      const hppBarang = txs.reduce((acc, curr) => acc + (curr.hpp_barang || 0), 0);
      const diskonHariIni = txs.reduce((acc, curr) => acc + (curr.diskon || 0), 0);
      const omsetMontir = txs.reduce((acc, curr) => acc + curr.ongkos_montir, 0);
      const totalOmset = txs.reduce((acc, curr) => acc + curr.total_akhir, 0);
      const labaHariIni = (omsetBarang - hppBarang) - diskonHariIni;

      days.push({
        tanggal: dateStr,
        label: label,
        total: totalOmset,
        omset_barang: omsetBarang,
        omset_montir: omsetMontir,
        laba_bersih: labaHariIni,
        jumlah_transaksi: txs.length
      });
    }

    return days;
  }
}

module.exports = new BengkelDatabase();
