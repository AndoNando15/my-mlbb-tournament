'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Team {
  id_team: number;
  nama_team: string;
  nama_kapten: string;
  no_undian: number | null;
}

export default function HalamanUndianPublik() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUndian = async () => {
    setLoading(true);
    // Kita ambil semua tim yang nilainya 'no_undian'-nya tidak kosong (is not null)
    const { data, error } = await supabase
      .from('teams')
      .select('id_team, nama_team, nama_kapten, no_undian')
      .not('no_undian', 'is', null) // Tampilkan hanya yang sudah diundi
      .order('no_undian', { ascending: true });

    if (!error) setTeams(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUndian();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent sm:text-4xl tracking-tight">🎯 LIVE DRAW SESSION NUMBER</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">Hasil pengocokan nomor undian resmi tim Turnamen Mobile Legends Bang Bang.</p>
        </div>

        {/* Tampilan Grid Hasil Undian */}
        {loading ? (
          <div className="text-center text-sm text-slate-500 py-10">Menghubungkan ke server undian...</div>
        ) : teams.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-10">Belum ada tim yang diundi oleh panitia.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id_team}
                className={`p-5 rounded-2xl border transition-all text-center space-y-3 shadow-lg ${team.no_undian ? 'bg-slate-900 border-amber-500/30 hover:border-amber-500 shadow-amber-950/20' : 'bg-slate-900/40 border-slate-800'}`}
              >
                {/* Badge Nomor Undian */}
                <div className="flex justify-center">
                  {team.no_undian ? (
                    <span className="bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 text-xl font-black font-mono w-14 h-14 rounded-full flex items-center justify-center border-2 border-slate-950 ring-4 ring-amber-500/20">
                      #{team.no_undian}
                    </span>
                  ) : (
                    <span className="bg-slate-950 text-slate-600 text-sm font-mono w-14 h-14 rounded-full flex items-center justify-center border border-slate-800">Belum</span>
                  )}
                </div>

                {/* Info Tim */}
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{team.nama_team}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Kapten: {team.nama_kapten}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
