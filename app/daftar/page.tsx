'use client';

import React, { useState } from 'react';

export default function HalamanDaftar() {
  // 1. State untuk menampung data Tim & Kontak Kapten
  const [teamData, setTeamData] = useState({
    nama_team: '',
    nama_kapten: '',
    no_kapten: '',
    alamat_kapten: '',
  });

  // 2. State untuk menampung data 6 Pemain (5 Inti + 1 Cadangan)
  const [players, setPlayers] = useState(
    Array.from({ length: 6 }, (_, index) => ({
      nama_pemain: '',
      nickname_game: '',
      id_game: '',
      jenjang_pemain: 'Umum',
      is_cadangan: index === 5, // Slot ke-6 otomatis jadi cadangan
    })),
  );

  // Handler untuk mendeteksi perubahan input Data Tim
  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk mendeteksi perubahan input Data Pemain berdasarkan indeks
  const handlePlayerChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [name]: value };
    setPlayers(updatedPlayers);
  };

  // Fungsi saat form disubmit ke API backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...teamData,
      anggota_tim: players,
    };

    try {
      // Menembak data ke API Route internal Next.js
      const response = await fetch('/api/pendaftaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat mendaftar.');
      }

      alert(`Selamat! Tim "${teamData.nama_team}" berhasil didaftarkan!`);

      // Reset Form setelah sukses pendaftaran
      setTeamData({ nama_team: '', nama_kapten: '', no_kapten: '', alamat_kapten: '' });
      setPlayers(
        Array.from({ length: 6 }, (_, index) => ({
          nama_pemain: '',
          nickname_game: '',
          id_game: '',
          jenjang_pemain: 'Umum',
          is_cadangan: index === 5,
        })),
      );
    } catch (error: any) {
      alert(`Pendaftaran Gagal: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">REGISTRASI TURNAMEN MLBB</h1>
          <p className="mt-2 text-sm text-indigo-100">Daftarkan tim terbaikmu. Pastikan ID Game benar untuk keperluan validasi MVP.</p>
        </div>

        {/* Form Utama */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          {/* BAGIAN 1: DATA TIM & KAPTEN */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-indigo-400 border-b border-slate-800 pb-2">🛡️ Data Tim & Kontak Kapten</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Nama Tim</label>
                <input
                  type="text"
                  name="nama_team"
                  required
                  value={teamData.nama_team}
                  onChange={handleTeamChange}
                  placeholder="Masukkan nama tim..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap Kapten</label>
                <input
                  type="text"
                  name="nama_kapten"
                  required
                  value={teamData.nama_kapten}
                  onChange={handleTeamChange}
                  placeholder="Nama kapten tim..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">No. WhatsApp Kapten</label>
                <input
                  type="tel"
                  name="no_kapten"
                  required
                  value={teamData.no_kapten}
                  onChange={handleTeamChange}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Alamat Domisili Kapten</label>
                <input
                  type="text"
                  name="alamat_kapten"
                  required
                  value={teamData.alamat_kapten}
                  onChange={handleTeamChange}
                  placeholder="Alamat asal/kota kapten..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 2: DATA PEMAIN */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-indigo-400 border-b border-slate-800 pb-2">⚔️ Susunan Pemain Tim</h2>

            <div className="space-y-4">
              {players.map((player, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all ${player.is_cadangan ? 'bg-slate-950/40 border-amber-900/40 hover:border-amber-700' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                  {/* Label Status Pemain */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${player.is_cadangan ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      {player.is_cadangan ? `Pemain Cadangan (Slot 6)` : `Pemain Inti ${index + 1}`}
                    </span>
                  </div>

                  {/* Input Grid Per Pemain */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1">Nama Asli</label>
                      <input
                        type="text"
                        name="nama_pemain"
                        required={!player.is_cadangan} // Hanya wajib diisi untuk 5 pemain inti
                        value={player.nama_pemain}
                        onChange={(e) => handlePlayerChange(index, e)}
                        placeholder="Nama Lengkap"
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1">Nickname Game</label>
                      <input
                        type="text"
                        name="nickname_game"
                        required={!player.is_cadangan}
                        value={player.nickname_game}
                        onChange={(e) => handlePlayerChange(index, e)}
                        placeholder="Contoh: Evos_Sanz"
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1">User ID + Zone ID</label>
                      <input
                        type="text"
                        name="id_game"
                        required={!player.is_cadangan}
                        value={player.id_game}
                        onChange={(e) => handlePlayerChange(index, e)}
                        placeholder="Contoh: 12345678 (2134)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1">Jenjang Pendidikan</label>
                      <select
                        name="jenjang_pemain"
                        value={player.jenjang_pemain}
                        onChange={(e) => handlePlayerChange(index, e)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                      >
                        <option value="SD/SMP">SD / SMP</option>
                        <option value="SMA/SMK">SMA / SMK</option>
                        <option value="Kuliah">Kuliah</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Kirim Pendaftaran & Kunci Tim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
