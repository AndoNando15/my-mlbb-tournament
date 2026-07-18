'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Team {
  id_team: number;
  nama_team: string;
  nama_kapten: string;
  no_kapten: string;
  alamat_kapten: string;
  no_undian: number | null;
  status_gugur: boolean;
  created_at: string;
}

interface Player {
  id_player: number;
  id_team: number;
  nama_pemain: string;
  nickname_game: string;
  id_game: string;
  jenjang_pemain: string;
  is_cadangan: boolean;
}

type SortField = 'id_team' | 'nama_team' | 'nama_kapten' | 'no_kapten' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function DashboardAdmin() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // [BARU] State untuk menyimpan data matches (pertandingan)
  const [matches, setMatches] = useState<any[]>([]);

  // State Navigasi Menu Sidebar
  const [activeMenu, setActiveMenu] = useState<'pendaftaran' | 'undian' | 'bagan'>('pendaftaran');

  // State Sort Header
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // State Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Form States
  const [teamFormData, setTeamFormData] = useState({
    nama_team: '',
    nama_kapten: '',
    no_kapten: '',
    alamat_kapten: '',
  });
  const [playerFormData, setPlayerFormData] = useState<Player[]>([]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('teams').select('*');
    if (error) alert('Gagal mengambil data: ' + error.message);
    else setTeams(data || []);
    setLoading(false);
  };

  // [BARU] Fungsi mengambil data match dari Supabase dengan Join Relasi Nama Tim
  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        id_match, round, match_number, skor_team_1, skor_team_2, id_pemenang, id_team_1, id_team_2,
        team1:id_team_1 (nama_team),
        team2:id_team_2 (nama_team)
      `,
      )
      .order('match_number', { ascending: true });

    if (!error) setMatches(data || []);
  };

  useEffect(() => {
    fetchTeams();
    fetchMatches(); // [BARU] Panggil data match saat inisialisasi halaman
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatTanggal = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const generateEmptyPlayers = (teamId = 0) => {
    return Array.from({ length: 6 }, (_, index) => ({
      id_player: 0,
      id_team: teamId,
      nama_pemain: '',
      nickname_game: '',
      id_game: '',
      jenjang_pemain: 'Umum',
      is_cadangan: index === 5,
    })) as Player[];
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTeam(null);
    setTeamFormData({ nama_team: '', nama_kapten: '', no_kapten: '', alamat_kapten: '' });
    setPlayerFormData(generateEmptyPlayers());
    setIsModalOpen(true);
  };

  const openActionModal = async (team: Team, mode: 'edit' | 'view') => {
    setModalMode(mode);
    setSelectedTeam(team);
    setTeamFormData({
      nama_team: team.nama_team,
      nama_kapten: team.nama_kapten,
      no_kapten: team.no_kapten,
      alamat_kapten: team.alamat_kapten,
    });

    setLoading(true);
    const { data, error } = await supabase.from('players').select('*').eq('id_team', team.id_team).order('is_cadangan', { ascending: true });

    if (error) {
      alert('Gagal mengambil roster: ' + error.message);
      setPlayerFormData(generateEmptyPlayers(team.id_team));
    } else {
      const exactSlots = Array.from({ length: 6 }, (_, index) => {
        const found = data?.find((p, i) => p.is_cadangan === (index === 5) && (index === 5 ? true : i === index));
        return (
          found || {
            id_player: 0,
            id_team: team.id_team,
            nama_pemain: '',
            nickname_game: '',
            id_game: '',
            jenjang_pemain: 'Umum',
            is_cadangan: index === 5,
          }
        );
      });
      setPlayerFormData(exactSlots as Player[]);
    }
    setLoading(false);
    setIsModalOpen(true);
  };

  const handlePlayerInputChange = (index: number, field: string, value: string) => {
    const updated = [...playerFormData];
    updated[index] = { ...updated[index], [field]: value };
    setPlayerFormData(updated);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'view') return;

    if (modalMode === 'edit' && selectedTeam) {
      const { error: teamUpdateError } = await supabase.from('teams').update(teamFormData).eq('id_team', selectedTeam.id_team);
      if (teamUpdateError) {
        alert('Gagal update tim: ' + teamUpdateError.message);
        return;
      }

      try {
        for (const player of playerFormData) {
          if (player.nama_pemain && player.nickname_game) {
            if (player.id_player === 0) {
              const { id_player, ...insertData } = player;
              await supabase.from('players').insert([insertData]);
            } else {
              await supabase
                .from('players')
                .update({
                  nama_pemain: player.nama_pemain,
                  nickname_game: player.nickname_game,
                  id_game: player.id_game,
                  jenjang_pemain: player.jenjang_pemain,
                })
                .eq('id_player', player.id_player);
            }
          }
        }
        alert('Data berhasil diperbarui!');
      } catch (err: any) {
        alert('Gagal perbarui roster: ' + err.message);
      }
      setIsModalOpen(false);
      fetchTeams();
    } else if (modalMode === 'create') {
      const payload = { ...teamFormData, anggota_tim: playerFormData };
      try {
        const response = await fetch('/api/pendaftaran', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Gagal menyimpan.');
        alert(`Sukses mendaftarkan tim manual!`);
        setIsModalOpen(false);
        fetchTeams();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteTeam = async (id_team: number, name: string) => {
    if (confirm(`Hapus tim "${name}" beserta anggotanya?`)) {
      const { error } = await supabase.from('teams').delete().eq('id_team', id_team);
      if (error) alert(error.message);
      else {
        alert('Tim sukses dihapus.');
        fetchTeams();
      }
    }
  };

  const processedTeams = teams
    .filter((team) => team.nama_team.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'nama_team') comparison = a.nama_team.localeCompare(b.nama_team);
      else if (sortField === 'nama_kapten') comparison = a.nama_kapten.localeCompare(b.nama_kapten);
      else if (sortField === 'no_kapten') comparison = a.no_kapten.localeCompare(b.no_kapten);
      else if (sortField === 'id_team') comparison = a.id_team - b.id_team;
      else if (sortField === 'created_at') comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return ' ⇅';
    return sortOrder === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* ─── SIDEBAR PANEL (KIRI) ─── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-6">
          {/* Logo / Judul Brand */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-xl">🏆</span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider uppercase">MLBB Arena</h2>
              <p className="text-[10px] text-slate-500 font-semibold">CMS PANEL ADMIN</p>
            </div>
          </div>

          {/* Navigasi Link Menu */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveMenu('pendaftaran')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'pendaftaran' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              🛡️ Pendaftaran Tim
            </button>
            <button
              onClick={() => setActiveMenu('undian')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'undian' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              🎲 Sesi Draw / Undian
            </button>
            <button
              onClick={() => setActiveMenu('bagan')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'bagan' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              ⚔️ Bagan Pertandingan
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-600 font-mono">v1.0.0 © 2026 Admin</div>
      </aside>

      {/* ─── KONTEN UTAMA WORKSPACE (KANAN) ─── */}
      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-x-hidden">
        {/* 1. TAMPILAN JIKA MENU "PENDAFTARAN TIM" AKTIF */}
        {activeMenu === 'pendaftaran' && (
          <>
            {/* Header Konten Eksekutif */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
              <div>
                <h1 className="text-xl font-bold text-white">⚙️ Kontrol Panel Data Tim</h1>
                <p className="text-xs text-slate-400 mt-0.5">Kelola data pendaftaran berkas roster pemain turnamen aktif.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all">
                  ➕ Tambah Tim Manual
                </button>
                <button onClick={fetchTeams} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all">
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Workspace Tabel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900/50">
                <input
                  type="text"
                  placeholder="Cari nama tim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs table-fixed min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider select-none">
                      <th onClick={() => handleSort('id_team')} className="p-4 font-semibold text-center w-16 cursor-pointer hover:text-white transition-colors">
                        No{renderSortIcon('id_team')}
                      </th>
                      <th onClick={() => handleSort('nama_team')} className="p-4 font-semibold cursor-pointer hover:text-white transition-colors w-1/4">
                        Nama Tim{renderSortIcon('nama_team')}
                      </th>
                      <th onClick={() => handleSort('nama_kapten')} className="p-4 font-semibold cursor-pointer hover:text-white transition-colors w-1/5">
                        Nama Kapten{renderSortIcon('nama_kapten')}
                      </th>
                      <th onClick={() => handleSort('no_kapten')} className="p-4 font-semibold cursor-pointer hover:text-white transition-colors w-1/5">
                        WhatsApp{renderSortIcon('no_kapten')}
                      </th>
                      <th onClick={() => handleSort('created_at')} className="p-4 font-semibold cursor-pointer hover:text-white transition-colors w-1/5">
                        Waktu Daftar{renderSortIcon('created_at')}
                      </th>
                      <th className="p-4 font-semibold text-center w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-slate-500">
                          Memuat data dari cloud database...
                        </td>
                      </tr>
                    ) : processedTeams.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-slate-500">
                          Belum ada data registrasi tim.
                        </td>
                      </tr>
                    ) : (
                      processedTeams.map((team, index) => (
                        <tr key={team.id_team} className="hover:bg-slate-850/40 transition-colors">
                          <td className="p-4 text-center font-mono text-slate-500">{index + 1}</td>
                          <td className="p-4 font-bold text-white truncate">{team.nama_team}</td>
                          <td className="p-4 text-slate-300 truncate">{team.nama_kapten}</td>
                          <td className="p-4 text-indigo-400 font-mono truncate">{team.no_kapten}</td>
                          <td className="p-4 text-slate-400 font-mono truncate">{formatTanggal(team.created_at)}</td>
                          <td className="p-4 flex justify-center gap-1.5">
                            <button onClick={() => openActionModal(team, 'view')} className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 px-2 py-1 rounded text-[11px] font-medium transition-all">
                              👁️ Detail
                            </button>
                            <button onClick={() => openActionModal(team, 'edit')} className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded text-[11px] font-medium transition-all">
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleDeleteTeam(team.id_team, team.nama_team)} className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-2 py-1 rounded text-[11px] font-medium transition-all">
                              🗑️ Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* 2. TAMPILAN JIKA MENU "SESI DRAW / UNDIAN" AKTIF */}
        {activeMenu === 'undian' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
              <div>
                <h1 className="text-xl font-bold text-white">🎲 Kontrol Panel Sesi Undian</h1>
                <p className="text-xs text-slate-400 mt-0.5">Kocok nomor undian secara massal dan acak untuk seluruh tim terdaftar.</p>
              </div>
              <button
                onClick={async () => {
                  if (confirm('Apakah kamu yakin ingin mengacak nomor undian untuk SEMUA tim sekarang?')) {
                    try {
                      const res = await fetch('/api/undian', { method: 'POST' });
                      const result = await res.json();
                      if (!res.ok) throw new Error(result.error);

                      alert(result.message);
                      window.location.reload();
                    } catch (err: any) {
                      alert('Gagal mengundi: ' + err.message);
                    }
                  }
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md"
              >
                🎲 Pemicu Acak Undian Baru
              </button>
            </div>

            {/* Tabel Status Hasil Undian */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs table-fixed min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                      <th className="p-4 font-semibold w-20 text-center">No</th>
                      <th className="p-4 font-semibold w-1/2">Nama Tim</th>
                      <th className="p-4 font-semibold w-1/4 text-center">Nomor Hasil Undian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-10 text-center text-slate-500">
                          Belum ada data tim untuk diundi.
                        </td>
                      </tr>
                    ) : (
                      [...teams]
                        .sort((a, b) => (a.no_undian || 999) - (b.no_undian || 999))
                        .map((team, index) => (
                          <tr key={team.id_team} className="hover:bg-slate-850/40 transition-colors">
                            <td className="p-4 text-center font-mono text-slate-500">{index + 1}</td>
                            <td className="p-4 font-bold text-white">{team.nama_team}</td>
                            <td className="p-4 text-center">
                              {team.no_undian !== null && team.no_undian !== undefined ? (
                                <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-bold font-mono border border-amber-500/20">#{team.no_undian}</span>
                              ) : (
                                <span className="text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Belum Diundi</span>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* 3. [BARU] TAMPILAN DINAMIS FITUR ADMIN BAGAN PERTANDINGAN */}
        {activeMenu === 'bagan' && (
          <>
            {/* Header Bagan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl gap-4 shadow-xl">
              <div>
                <h1 className="text-xl font-bold text-white">⚔️ Manajemen Bracket & Live Skor</h1>
                <p className="text-xs text-slate-400 mt-0.5">Kelola jalannya skor pertandingan babak perempat final secara langsung.</p>
              </div>
              <button
                onClick={async () => {
                  if (confirm('Generate ulang bagan berdasarkan nomor undian sekarang? (Skor lama akan tereset)')) {
                    try {
                      const res = await fetch('/api/bagan/generate', { method: 'POST' });
                      const result = await res.json();

                      if (!res.ok) throw new Error(result.error || 'Gagal generate bagan');

                      alert('Bagan Turnamen Berhasil Dibuat!');
                      // Panggil fungsi fetching yang sah agar state langsung ter-update dengan format yang benar
                      await fetchMatches();
                    } catch (err: any) {
                      alert('Gagal membuat bagan: ' + err.message);
                    }
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md"
              >
                🎮 Generate / Reset Bagan Baru
              </button>
            </div>

            {/* Kontainer Utama Pengisian Skor Perempat Final */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">🏆 Babak Perempat Final (Quarterfinals)</div>

              {matches.length === 0 ? (
                <div className="p-10 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-850">Belum ada bagan yang dibuat. Silakan klik tombol "Generate / Reset Bagan Baru" di atas.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((match) => (
                    <div key={match.id_match} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider">MATCH #{match.match_number}</span>
                        {match.id_pemenang && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">✓ Selesai</span>}
                      </div>

                      <div className="space-y-2">
                        {/* Tim 1 */}
                        <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-800/80">
                          <span className={`text-xs font-semibold ${match.id_pemenang && match.id_pemenang === match.id_team_1 ? 'text-amber-400' : 'text-slate-200'}`}>{match.team1?.nama_team || 'Bye / Kosong'}</span>
                          <input
                            type="number"
                            id={`s1-${match.id_match}`}
                            defaultValue={match.skor_team_1}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white p-1 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Tim 2 */}
                        <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-800/80">
                          <span className={`text-xs font-semibold ${match.id_pemenang && match.id_pemenang === match.id_team_2 ? 'text-amber-400' : 'text-slate-200'}`}>{match.team2?.nama_team || 'Bye / Kosong'}</span>
                          <input
                            type="number"
                            id={`s2-${match.id_match}`}
                            defaultValue={match.skor_team_2}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white p-1 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Tombol Simpan Skor Per Match */}
                      <button
                        onClick={async () => {
                          const s1 = parseInt((document.getElementById(`s1-${match.id_match}`) as HTMLInputElement).value) || 0;
                          const s2 = parseInt((document.getElementById(`s2-${match.id_match}`) as HTMLInputElement).value) || 0;

                          try {
                            const response = await fetch('/api/bagan/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id_match: match.id_match, skor_team_1: s1, skor_team_2: s2 }),
                            });
                            const result = await response.json();
                            if (!response.ok) throw new Error(result.error);

                            alert(result.message);
                            fetchMatches(); // Muat ulang data secara realtime setelah skor dikunci
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }}
                        className="w-full bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/60 rounded py-1.5 text-[11px] font-bold transition-all"
                      >
                        💾 Kunci & Simpan Skor Match
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ─── KODE MODAL DI LUAR MAIN ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] max-w-4xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {modalMode === 'create' && '➕ Registrasi Tim & Roster Baru'}
                {modalMode === 'edit' && `✏️ Edit Data & Roster Tim: ${teamFormData.nama_team}`}
                {modalMode === 'view' && `👁️ Preview Berkas Pendaftaran: ${teamFormData.nama_team}`}
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded uppercase font-medium">Mode: {modalMode}</span>
            </div>

            <form onSubmit={handleSaveAll} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="sm:col-span-2 text-xs font-semibold text-indigo-400 uppercase">🛡️ Info Kontak Kapten & Tim</div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nama Tim</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={teamFormData.nama_team}
                    onChange={(e) => setTeamFormData({ ...teamFormData, nama_team: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nama Lengkap Kapten</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={teamFormData.nama_kapten}
                    onChange={(e) => setTeamFormData({ ...teamFormData, nama_kapten: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">WhatsApp Kapten</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={teamFormData.no_kapten}
                    onChange={(e) => setTeamFormData({ ...teamFormData, no_kapten: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={teamFormData.alamat_kapten}
                    onChange={(e) => setTeamFormData({ ...teamFormData, alamat_kapten: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-amber-400 uppercase">⚔️ Susunan Pemain Roster</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {playerFormData.map((player, index) => (
                    <div key={index} className={`p-3 rounded-xl border space-y-2 text-left ${player.is_cadangan ? 'bg-amber-950/20 border-amber-900/40' : 'bg-slate-950 border-slate-850'}`}>
                      <span className={`text-[10px] font-bold block uppercase ${player.is_cadangan ? 'text-amber-400' : 'text-indigo-400'}`}>{player.is_cadangan ? 'Pemain Cadangan (Slot 6)' : `Pemain Inti ${index + 1}`}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 block">Nama Asli</label>
                          <input
                            type="text"
                            placeholder="Nama Lengkap"
                            required={!player.is_cadangan && modalMode !== 'view'}
                            disabled={modalMode === 'view'}
                            value={player.nama_pemain}
                            onChange={(e) => handlePlayerInputChange(index, 'nama_pemain', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block">Nickname</label>
                          <input
                            type="text"
                            placeholder="In-Game Name"
                            required={!player.is_cadangan && modalMode !== 'view'}
                            disabled={modalMode === 'view'}
                            value={player.nickname_game}
                            onChange={(e) => handlePlayerInputChange(index, 'nickname_game', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block">User ID</label>
                          <input
                            type="text"
                            placeholder="ID Game"
                            required={!player.is_cadangan && modalMode !== 'view'}
                            disabled={modalMode === 'view'}
                            value={player.id_game}
                            onChange={(e) => handlePlayerInputChange(index, 'id_game', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block">Jenjang</label>
                          <select
                            disabled={modalMode === 'view'}
                            value={player.jenjang_pemain}
                            onChange={(e) => handlePlayerInputChange(index, 'jenjang_pemain', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-white focus:outline-none"
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-lg hover:bg-slate-700">
                  {modalMode === 'view' ? 'Tutup Preview' : 'Batal'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 py-2 rounded-lg font-bold">
                    {modalMode === 'create' ? 'Simpan Roster Baru' : 'Konfirmasi Update Roster'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
