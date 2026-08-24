import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { formatTanggal } from '../utils/formatters';

export default function PenggunaPage() {
  const [penggunaList, setPenggunaList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_lengkap: '',
    peran: 'Kasir'
  });

  const fetchPengguna = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.getPengguna();
        setPenggunaList(data || []);
      }
    } catch (err) {
      console.error("Gagal memuat pengguna:", err);
    }
  };

  useEffect(() => {
    fetchPengguna();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.nama_lengkap) {
      alert("Harap isi Username dan Nama Lengkap!");
      return;
    }
    try {
      if (window.electronAPI) {
        await window.electronAPI.addPengguna(formData);
        await fetchPengguna();
        setIsModalOpen(false);
        setFormData({ username: '', password: '', nama_lengkap: '', peran: 'Kasir' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin menghapus akun pengguna ini?")) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.deletePengguna(id);
          await fetchPengguna();
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Kelola Akun Pengguna & Hak Akses
          </h1>
          <p className="text-xs text-slate-500">Manajemen akun kasir & admin pengguna aplikasi bengkel.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchPengguna} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Akun Pengguna Baru
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID & Username</th>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Peran (Role)</th>
              <th className="px-6 py-4">Tanggal Dibuat</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {penggunaList.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono">
                  <div className="font-bold text-slate-900">{u.username}</div>
                  <div className="text-[10px] text-slate-400">ID: #{u.id}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">{u.nama_lengkap}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.peran === 'Admin'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {u.peran}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{formatTanggal(u.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  {u.id !== 1 && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">Tambah Akun Pengguna</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Misal: kasir2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="******"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Misal: Andi Saputra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Peran (Role)</label>
                <select
                  value={formData.peran}
                  onChange={(e) => setFormData({ ...formData, peran: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Kasir">Kasir (POS & Stok Opname)</option>
                  <option value="Admin">Admin (Akses Penuh)</option>
                </select>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/20"
                >
                  Simpan Akun Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
