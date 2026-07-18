import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const { data: teams } = await supabaseAdmin.from('teams').select('id_team').not('no_undian', 'is', null).order('no_undian', { ascending: true });

    if (!teams || teams.length < 2) return NextResponse.json({ error: 'Minimal 2 tim untuk buat bagan' }, { status: 400 });

    await supabaseAdmin.from('matches').delete().neq('id_match', 0);

    const matchesPayload = [];
    let currentTeams = [...teams];

    // Tentukan target tim di Quarterfinals (8)
    const targetQuarter = 8;
    const numTeams = currentTeams.length;

    // Jika tim > 8, kita butuh babak penyisihan (Round of 16 / Round of 32)
    // Rumus: Jumlah pertandingan babak awal = numTeams - targetQuarter
    // Contoh: 14 tim. 14 - 8 = 6 pertandingan (12 tim tanding, 2 tim Bye).

    if (numTeams > targetQuarter) {
      const numMatches = numTeams - targetQuarter;
      const numTeamsTanding = numMatches * 2;

      // Buat match untuk tim yang tanding
      for (let i = 0; i < numTeamsTanding; i += 2) {
        matchesPayload.push({
          round: 'round_of_16', // Babak awal
          match_number: i / 2 + 1,
          id_team_1: currentTeams[i].id_team,
          id_team_2: currentTeams[i + 1].id_team,
          skor_team_1: 0,
          skor_team_2: 0,
        });
      }
      // Tim yang tidak tanding (Bye) akan otomatis masuk ke Quarterfinals
      // Logikanya nanti di handle saat update skor
    } else {
      // Jika <= 8 tim, langsung ke Quarterfinals
      for (let i = 0; i < numTeams; i += 2) {
        matchesPayload.push({
          round: 'quarterfinals',
          match_number: i / 2 + 1,
          id_team_1: currentTeams[i].id_team,
          id_team_2: currentTeams[i + 1]?.id_team || null, // null jika bye
          skor_team_1: 0,
          skor_team_2: 0,
        });
      }
    }

    await supabaseAdmin.from('matches').insert(matchesPayload);
    return NextResponse.json({ message: 'Bagan dinamis berhasil dibuat!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
