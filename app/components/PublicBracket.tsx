import React from 'react';

// Fungsi bantuan untuk mencari data match berdasarkan match_number
const getMatch = (matches: any[], num: number) => matches.find((m) => m.match_number === num);

export default function PublicBracket({ matches }: { matches: any[] }) {
  return (
    <div className="p-8 bg-slate-950 text-white min-h-screen">
      <h2 className="text-center text-3xl font-bold mb-10 uppercase text-amber-500">Jadwal Pertandingan</h2>

      {/* Container utama bagan */}
      <div className="flex justify-center items-center gap-4 overflow-x-auto py-10">
        {/* KOLOM KIRI (Match 1, 5, 2) */}
        <div className="flex flex-col gap-8">
          <MatchBox label="Match 1" match={getMatch(matches, 1)} />
          <MatchBox label="Match 5" match={getMatch(matches, 5)} />
          <MatchBox label="Match 2" match={getMatch(matches, 2)} />
        </div>

        {/* KOLOM TENGAH (Semifinal & Final) */}
        <div className="flex flex-col gap-12 border-x-2 border-slate-700 px-6">
          <MatchBox label="Semifinal" match={getMatch(matches, 7)} highlight />
          <MatchBox label="GRAND FINAL" match={getMatch(matches, 9)} final />
          <MatchBox label="Semifinal" match={getMatch(matches, 8)} highlight />
        </div>

        {/* KOLOM KANAN (Match 3, 6, 4) */}
        <div className="flex flex-col gap-8">
          <MatchBox label="Match 3" match={getMatch(matches, 3)} />
          <MatchBox label="Match 6" match={getMatch(matches, 6)} />
          <MatchBox label="Match 4" match={getMatch(matches, 4)} />
        </div>
      </div>
    </div>
  );
}

// Komponen Kotak Tim / Match
function MatchBox({ label, match, highlight, final }: any) {
  return (
    <div className={`p-3 rounded-lg border-2 w-48 ${highlight ? 'bg-amber-900 border-amber-500' : final ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
      <div className="text-xs font-bold space-y-1">
        <div className="flex justify-between">
          {match?.team1?.nama_team || 'TBD'} <span>{match?.skor_team_1}</span>
        </div>
        <div className="flex justify-between">
          {match?.team2?.nama_team || 'TBD'} <span>{match?.skor_team_2}</span>
        </div>
      </div>
    </div>
  );
}
