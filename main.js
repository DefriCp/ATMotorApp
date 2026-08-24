const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./database');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: "Bengkel POS & Stock Opname - AT Motor",
    icon: path.join(__dirname, 'src/assets/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    backgroundColor: '#f8fafc'
  });

  const distPath = path.join(__dirname, 'dist', 'index.html');

  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }
}

// --- REGISTRASI IPC HANDLERS ---

// Auth & Users
ipcMain.handle('db:loginUser', async (event, { username, password }) => db.loginUser(username, password));
ipcMain.handle('db:getPengguna', async () => db.getPengguna());
ipcMain.handle('db:addPengguna', async (event, item) => db.addPengguna(item));
ipcMain.handle('db:deletePengguna', async (event, id) => db.deletePengguna(id));

// Kategori Dinamis
ipcMain.handle('db:getKategori', async () => db.getKategori());
ipcMain.handle('db:addKategori', async (event, nama) => db.addKategori(nama));
ipcMain.handle('db:deleteKategori', async (event, id) => db.deleteKategori(id));

// Barang / Sparepart
ipcMain.handle('db:getProduk', async (event, params = {}) => {
  const { querySearch, kategori } = params || {};
  return db.getProduk(querySearch, kategori);
});
ipcMain.handle('db:addProduk', async (event, item) => db.addProduk(item));
ipcMain.handle('db:updateProduk', async (event, { id, data }) => db.updateProduk(id, data));
ipcMain.handle('db:deleteProduk', async (event, id) => db.deleteProduk(id));

// Stok Opname
ipcMain.handle('db:stokOpname', async (event, { id, stokBaru, keterangan }) => db.stokOpname(id, stokBaru, keterangan));
ipcMain.handle('db:getStokOpnameLog', async () => db.getStokOpnameLog());

// Transaksi POS
ipcMain.handle('db:simpanTransaksi', async (event, payload) => db.simpanTransaksi(payload));

// Pemasukan & Belanja
ipcMain.handle('db:getPemasukan', async () => db.getPemasukan());
ipcMain.handle('db:getBelanja', async () => db.getBelanja());
ipcMain.handle('db:addBelanja', async (event, item) => db.addBelanja(item));
ipcMain.handle('db:deleteBelanja', async (event, id) => db.deleteBelanja(id));

// Dashboard Stats
ipcMain.handle('db:getDashboardStats', async () => db.getDashboardStats());
ipcMain.handle('db:getPenjualan7Hari', async () => db.getPenjualan7Hari());

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
