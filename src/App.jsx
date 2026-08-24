import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import KasirPage from './pages/KasirPage';
import InventoriPage from './pages/InventoriPage';
import StokOpnamePage from './pages/StokOpnamePage';
import PemasukanPage from './pages/PemasukanPage';
import BelanjaPage from './pages/BelanjaPage';
import DashboardPage from './pages/DashboardPage';
import PenggunaPage from './pages/PenggunaPage';

import ModalTambahBarang from './components/ModalTambahBarang';
import ModalStokOpname from './components/ModalStokOpname';
import StrukModal from './components/StrukModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('kasir');
  const [produkList, setProdukList] = useState([]);
  
  // Modals state
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [isModalOpnameOpen, setIsModalOpnameOpen] = useState(false);
  const [itemToOpname, setItemToOpname] = useState(null);

  const [isStrukOpen, setIsStrukOpen] = useState(false);
  const [lastTransaksiData, setLastTransaksiData] = useState(null);

  // Load data produk dari IPC Main Process (SQLite)
  const fetchProduk = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.getProduk();
        setProdukList(data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data produk via IPC:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProduk();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('kasir');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSaveProduk = async (itemData) => {
    try {
      if (window.electronAPI) {
        if (itemToEdit) {
          await window.electronAPI.updateProduk(itemToEdit.id, itemData);
        } else {
          await window.electronAPI.addProduk(itemData);
        }
        await fetchProduk();
        setIsModalTambahOpen(false);
        setItemToEdit(null);
      }
    } catch (err) {
      alert(`Gagal menyimpan barang: ${err.message}`);
    }
  };

  const handleDeleteProduk = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus barang ini dari database?")) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.deleteProduk(id);
          await fetchProduk();
        }
      } catch (err) {
        alert(`Gagal menghapus barang: ${err.message}`);
      }
    }
  };

  const handleSaveStokOpname = async (id, stokBaru, keterangan) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.stokOpname(id, stokBaru, keterangan);
        await fetchProduk();
        setIsModalOpnameOpen(false);
        setItemToOpname(null);
      }
    } catch (err) {
      alert(`Gagal update stok opname: ${err.message}`);
    }
  };

  const handleSimpanTransaksi = async (payload) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.simpanTransaksi(payload);
        setLastTransaksiData(result);
        setIsStrukOpen(true);
        await fetchProduk();
      }
    } catch (err) {
      alert(`Gagal memproses transaksi: ${err.message}`);
    }
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          activeTab={activeTab} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onRefresh={fetchProduk} 
        />

        <main className="flex-1 overflow-hidden">
          {activeTab === 'kasir' && (
            <KasirPage 
              produkList={produkList}
              onSimpanTransaksi={handleSimpanTransaksi}
              onRefreshProduk={fetchProduk}
            />
          )}

          {activeTab === 'inventori' && (
            <InventoriPage 
              produkList={produkList}
              onTambahBarang={() => { setItemToEdit(null); setIsModalTambahOpen(true); }}
              onEditBarang={(item) => { setItemToEdit(item); setIsModalTambahOpen(true); }}
              onDeleteBarang={handleDeleteProduk}
              onOpenStokOpname={(item) => { setItemToOpname(item); setIsModalOpnameOpen(true); }}
              onRefresh={fetchProduk}
            />
          )}

          {activeTab === 'stok_opname' && (
            <StokOpnamePage 
              produkList={produkList}
              onOpenStokOpname={(item) => { setItemToOpname(item); setIsModalOpnameOpen(true); }}
            />
          )}

          {activeTab === 'pemasukan' && (
            <PemasukanPage />
          )}

          {activeTab === 'belanja' && (
            <BelanjaPage />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage 
              onNavigateToInventori={() => setActiveTab('inventori')}
              onRefresh={fetchProduk}
            />
          )}

          {activeTab === 'pengguna' && currentUser.peran === 'Admin' && (
            <PenggunaPage />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ModalTambahBarang 
        isOpen={isModalTambahOpen}
        onClose={() => { setIsModalTambahOpen(false); setItemToEdit(null); }}
        onSave={handleSaveProduk}
        itemToEdit={itemToEdit}
      />

      <ModalStokOpname 
        isOpen={isModalOpnameOpen}
        onClose={() => { setIsModalOpnameOpen(false); setItemToOpname(null); }}
        onSave={handleSaveStokOpname}
        item={itemToOpname}
      />

      <StrukModal 
        isOpen={isStrukOpen}
        onClose={() => setIsStrukOpen(false)}
        dataTransaksi={lastTransaksiData}
      />
    </div>
  );
}
