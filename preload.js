const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload Script IPC Bridge dengan Kategori Dinamis
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Otentikasi & Akun
  loginUser: (username, password) => ipcRenderer.invoke('db:loginUser', { username, password }),
  getPengguna: () => ipcRenderer.invoke('db:getPengguna'),
  addPengguna: (item) => ipcRenderer.invoke('db:addPengguna', item),
  deletePengguna: (id) => ipcRenderer.invoke('db:deletePengguna', id),

  // Kategori Dinamis
  getKategori: () => ipcRenderer.invoke('db:getKategori'),
  addKategori: (nama) => ipcRenderer.invoke('db:addKategori', nama),
  deleteKategori: (id) => ipcRenderer.invoke('db:deleteKategori', id),

  // Barang / Sparepart
  getProduk: (params) => ipcRenderer.invoke('db:getProduk', params),
  addProduk: (item) => ipcRenderer.invoke('db:addProduk', item),
  updateProduk: (id, data) => ipcRenderer.invoke('db:updateProduk', { id, data }),
  deleteProduk: (id) => ipcRenderer.invoke('db:deleteProduk', id),

  // Stok Opname
  stokOpname: (id, stokBaru, keterangan) => ipcRenderer.invoke('db:stokOpname', { id, stokBaru, keterangan }),
  getStokOpnameLog: () => ipcRenderer.invoke('db:getStokOpnameLog'),

  // Transaksi POS
  simpanTransaksi: (payload) => ipcRenderer.invoke('db:simpanTransaksi', payload),

  // Pemasukan & Belanja
  getPemasukan: () => ipcRenderer.invoke('db:getPemasukan'),
  getBelanja: () => ipcRenderer.invoke('db:getBelanja'),
  addBelanja: (item) => ipcRenderer.invoke('db:addBelanja', item),
  deleteBelanja: (id) => ipcRenderer.invoke('db:deleteBelanja', id),

  // Dashboard Stats
  getDashboardStats: () => ipcRenderer.invoke('db:getDashboardStats'),
  getPenjualan7Hari: () => ipcRenderer.invoke('db:getPenjualan7Hari'),
});
