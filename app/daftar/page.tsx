'use client';

import React, { useState, useEffect } from 'react';

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
      is_cadangan: index === 5,
    })),
  );

  // 3. State Pop-up Notifikasi Alert Custom
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    showWaButton?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showWaButton: false,
  });

  // 4. State Pop-up Konfirmasi Custom
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const LinkWaGroup = 'https://chat.whatsapp.com/IJO1XVGAdsxAZDkoPcdbfB';

  // Trigger modal pengganti alert browser
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', showWaButton = false) => {
    setAlertModal({ isOpen: true, title, message, type, showWaButton });
  };

  // Peringatan sistem saat pengguna mencoba me-refresh atau menutup tab secara tidak sengaja
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return 'Apakah Anda yakin ingin meninggalkan halaman?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handler input Data Tim
  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler input Data Pemain
  const handlePlayerChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [name]: value };
    setPlayers(updatedPlayers);
  };

  // Submit form ke API backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...teamData,
      anggota_tim: players,
    };

    try {
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

      // Tampilkan popup sukses dengan tombol gabung grup WhatsApp
      showAlert(
        '🎉 Pendaftaran Sukses!',
        `Selamat! Tim "${teamData.nama_team}" berhasil didaftarkan ke sistem turnamen. Langkah terakhir, silakan klik tombol di bawah untuk masuk ke grup koordinasi WhatsApp resmi turnamen!`,
        'success',
        true,
      );

      // Reset Form
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
      showAlert('Pendaftaran Gagal', error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#7f1d1d] py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto bg-white border-4 border-yellow-500 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 px-6 py-8 text-center border-b-4 border-yellow-500">
          <h1 className="text-2xl font-black tracking-tighter text-white sm:text-4xl uppercase italic">REGISTRASI TURNAMEN RI KE-81</h1>
          <p className="mt-2 text-sm text-yellow-100 font-bold tracking-widest">Daftarkan tim terbaikmu untuk kemerdekaan MLBB!</p>
        </div>

        {/* Form Utama */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          {/* BAGIAN 1: DATA TIM & KAPTEN */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-red-800 border-b-2 border-red-100 pb-2 uppercase">🛡️ Data Tim & Kontak Kapten</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-1">Nama Tim</label>
                <input
                  type="text"
                  name="nama_team"
                  required
                  value={teamData.nama_team}
                  onChange={handleTeamChange}
                  placeholder="Masukkan nama tim..."
                  className="w-full bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 text-red-950 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-1">Nama Lengkap Kapten</label>
                <input
                  type="text"
                  name="nama_kapten"
                  required
                  value={teamData.nama_kapten}
                  onChange={handleTeamChange}
                  placeholder="Nama kapten tim..."
                  className="w-full bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 text-red-950 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-1">No. WhatsApp Kapten</label>
                <input
                  type="tel"
                  name="no_kapten"
                  required
                  value={teamData.no_kapten}
                  onChange={handleTeamChange}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 text-red-950 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-1">Alamat Domisili Kapten</label>
                <input
                  type="text"
                  name="alamat_kapten"
                  required
                  value={teamData.alamat_kapten}
                  onChange={handleTeamChange}
                  placeholder="Alamat asal/kota kapten..."
                  className="w-full bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 text-red-950 font-medium"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 2: DATA PEMAIN */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-red-800 border-b-2 border-red-100 pb-2 uppercase">⚔️ Susunan Pemain Tim</h2>

            <div className="space-y-4">
              {players.map((player, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 transition-all ${player.is_cadangan ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide ${player.is_cadangan ? 'bg-yellow-600 text-white' : 'bg-red-700 text-white'}`}>
                      {player.is_cadangan ? `Pemain Cadangan (Slot 6)` : `Pemain Inti ${index + 1}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-red-900 uppercase mb-1">Nama Asli</label>
                      <input
                        type="text"
                        name="nama_pemain"
                        required={!player.is_cadangan}
                        value={player.nama_pemain}
                        onChange={(e) => handlePlayerChange(index, e)}
                        placeholder="Nama Lengkap"
                        className="w-full bg-white border border-red-200 rounded-md px-3 py-1.5 text-xs text-red-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-red-900 uppercase mb-1">Nickname Game</label>
                      <input
                        type="text"
                        name="nickname_game"
                        required={!player.is_cadangan}
                        value={player.nickname_game}
                        onChange={(e) => handlePlayerChange(index, e)}
                        placeholder="Contoh: Evos_Sanz"
                        className="w-full bg-white border border-red-200 rounded-md px-3 py-1.5 text-xs text-red-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-red-900 uppercase mb-1">User ID + Zone ID</label>
                      <input
                        type="text"
                        name="id_game"
                        required={!player.is_cadangan}
                        value={player.id_game}
                        onChange={(e) => handlePlayerChange(index, e)}
                        placeholder="Contoh: 12345678 (2134)"
                        className="w-full bg-white border border-red-200 rounded-md px-3 py-1.5 text-xs text-red-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-red-900 uppercase mb-1">Jenjang</label>
                      <select
                        name="jenjang_pemain"
                        value={player.jenjang_pemain}
                        onChange={(e) => handlePlayerChange(index, e)}
                        className="w-full bg-white border border-red-200 rounded-md px-3 py-1.5 text-xs text-red-950 focus:outline-none"
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
            <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-black text-sm py-4 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] border-b-4 border-red-950 uppercase">
              Kirim Pendaftaran Merdeka!
            </button>
          </div>
        </form>
      </div>

      {/* ─── RENDER POP-UP MODAL NOTIFIKASI CUSTOM (ALERTS) ─── */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div
            className={`bg-white border-4 border-yellow-500 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center
            ${alertModal.type === 'success' ? 'border-t-emerald-500' : alertModal.type === 'error' ? 'border-t-rose-500' : 'border-t-indigo-500'}`}
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-4xl">
              {alertModal.type === 'success' && '🇮🇩'}
              {alertModal.type === 'error' && '❌'}
              {alertModal.type === 'info' && 'ℹ️'}
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-red-800 uppercase tracking-wide">{alertModal.title}</h4>
              <p className="text-sm text-red-900 leading-relaxed px-2">{alertModal.message}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {alertModal.showWaButton && (
                <a
                  href={LinkWaGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  💬 Gabung Grup WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  if (alertModal.showWaButton) {
                    setAlertModal((prev) => ({ ...prev, isOpen: false }));
                    setConfirmModal({
                      isOpen: true,
                      title: '📌 VALIDASI KELOMPOK KOORDINASI',
                      message: 'Apakah Anda yakin sudah bergabung ke grup WhatsApp turnamen? Informasi jadwal, bagan, dan regulasi pertandingan hanya akan dibagikan di dalam grup tersebut.',
                      onConfirm: () => {
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                      },
                    });
                  } else {
                    setAlertModal((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
                className="w-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-3 rounded-xl border border-red-900 transition-all focus:outline-none"
              >
                Tutup Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RENDER CUSTOM DIALOG POP-UP MODAL KONFIRMASI ─── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white border-4 border-yellow-500 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b-2 border-red-100 pb-2">
              <span className="text-xl">💡</span>
              <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">{confirmModal.title}</h4>
            </div>
            <p className="text-xs text-red-900 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  showAlert('🎉 Pendaftaran Sukses!', 'Silakan klik tombol di bawah untuk masuk ke grup koordinasi WhatsApp resmi turnamen!', 'success', true);
                }}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-900 text-xs font-bold py-2 rounded-xl transition-all focus:outline-none"
              >
                Belum, Gabung Sekarang
              </button>
              <button type="button" onClick={confirmModal.onConfirm} className="flex-1 bg-red-800 hover:bg-red-900 text-white text-xs font-bold py-2 rounded-xl transition-all focus:outline-none shadow-md">
                Ya, Sudah Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
