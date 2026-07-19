'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BaganUserPage() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select(
          `
          id_match, round, match_number, skor_team_1, skor_team_2, 
          team1:id_team_1(nama_team), 
          team2:id_team_2(nama_team)
        `,
        )
        .order('match_number', { ascending: true });
      if (data) setMatches(data);
    };
    fetchMatches();
  }, []);

  const findMatch = (num: number) => matches.find((m) => m.match_number === num);

  const MatchBox = ({ match }: { match?: any }) => (
    <div className="relative flex flex-col items-center">
      <span className="text-[9px] font-bold text-white mb-1 uppercase tracking-widest bg-red-800 px-2 rounded">Match #{match?.match_number || '?'}</span>

      <div className="bg-gradient-to-b from-red-700 to-red-900 p-2 rounded-lg shadow-lg border-2 border-white w-36 text-center">
        <div className="flex justify-between items-center px-1">
          <span className="text-white font-bold uppercase text-[10px] truncate w-24 text-left">{match?.team1?.nama_team || 'Menunggu...'}</span>
          <span className="text-red-900 font-bold text-xs bg-white px-1 rounded-sm">{match?.skor_team_1 ?? '-'}</span>
        </div>
        <div className="border-t-2 border-white my-1"></div>
        <div className="flex justify-between items-center px-1">
          <span className="text-white font-bold uppercase text-[10px] truncate w-24 text-left">{match?.team2?.nama_team || 'Menunggu...'}</span>
          <span className="text-red-900 font-bold text-xs bg-white px-1 rounded-sm">{match?.skor_team_2 ?? '-'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#7f1d1d] p-8 text-white font-sans">
      {/* Header Baru dengan Desain Banner */}
      <div className="flex justify-center mb-8">
        <div className="relative inline-block px-4 py-1.5 bg-gradient-to-b from-red-600 to-red-900 border border-red-400 rounded-sm shadow-md transform">
          {/* Efek Frame 3D yang disesuaikan */}
          <div className="absolute inset-0 border-2 border-red-500/30 rounded-sm pointer-events-none"></div>

          <div className="flex items-center gap-3">
            <span className="text-lg md:text-xl font-black italic text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] tracking-tighter">HUT KE-81</span>
            <div className="h-6 w-0.5 bg-red-400/50"></div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-yellow-300 drop-shadow-md">RI SAMBOGUNUNG 2026</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        {/* Kolom 1 */}
        <div className="flex flex-col gap-24 justify-center">
          <MatchBox match={findMatch(1)} />
          <MatchBox match={findMatch(2)} />
        </div>

        {/* Kolom 2 */}
        <div className="flex flex-col justify-center">
          <MatchBox match={findMatch(5)} />
        </div>

        {/* Kolom 3: Final */}
        <div className="flex flex-col items-center mx-4">
          <div className="text-3xl mb-2">🏆</div>
          <MatchBox match={findMatch(7)} />
        </div>

        {/* Kolom 4 */}
        <div className="flex flex-col justify-center">
          <MatchBox match={findMatch(6)} />
        </div>

        {/* Kolom 5 */}
        <div className="flex flex-col gap-24 justify-center">
          <MatchBox match={findMatch(3)} />
          <MatchBox match={findMatch(4)} />
        </div>
      </div>
    </div>
  );
}
