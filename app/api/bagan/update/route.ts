import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const { id_match, skor_team_1, skor_team_2 } = await request.json();

    // 1. Ambil data match
    const { data: match, error: fetchError } = await supabaseAdmin.from('matches').select('*').eq('id_match', id_match).single();

    if (fetchError || !match) return NextResponse.json({ error: 'Match tidak ditemukan' }, { status: 404 });

    // 2. Tentukan pemenang
    let id_pemenang = skor_team_1 > skor_team_2 ? match.id_team_1 : match.id_team_2;
    if (skor_team_1 === skor_team_2) return NextResponse.json({ error: 'Skor tidak boleh seri!' }, { status: 400 });

    // 3. Update Skor Match saat ini
    await supabaseAdmin.from('matches').update({ skor_team_1, skor_team_2, id_pemenang }).eq('id_match', id_match);

    // 4. OTOMATISASI: Majukan pemenang ke babak berikutnya

    // --- BABAK 1 (16 BESAR) KE QUARTERFINALS ---
    if (match.round === 'round_1') {
      const targetMatchNum = Math.ceil(match.match_number / 2);
      const { data: qMatch } = await supabaseAdmin.from('matches').select('*').eq('round', 'quarterfinals').eq('match_number', targetMatchNum).maybeSingle();

      if (!qMatch) {
        await supabaseAdmin.from('matches').insert({
          round: 'quarterfinals',
          match_number: targetMatchNum,
          id_team_1: match.match_number % 2 !== 0 ? id_pemenang : null,
          id_team_2: match.match_number % 2 === 0 ? id_pemenang : null,
        });
      } else {
        const updateData = match.match_number % 2 !== 0 ? { id_team_1: id_pemenang } : { id_team_2: id_pemenang };
        await supabaseAdmin.from('matches').update(updateData).eq('id_match', qMatch.id_match);
      }
    }
    // --- QUARTERFINALS KE SEMIFINALS ---
    else if (match.round === 'quarterfinals') {
      const targetMatchNum = Math.ceil(match.match_number / 2);
      const { data: sMatch } = await supabaseAdmin.from('matches').select('*').eq('round', 'semifinals').eq('match_number', targetMatchNum).maybeSingle();

      if (!sMatch) {
        await supabaseAdmin.from('matches').insert({
          round: 'semifinals',
          match_number: targetMatchNum,
          id_team_1: match.match_number % 2 !== 0 ? id_pemenang : null,
          id_team_2: match.match_number % 2 === 0 ? id_pemenang : null,
        });
      } else {
        const updateData = match.match_number % 2 !== 0 ? { id_team_1: id_pemenang } : { id_team_2: id_pemenang };
        await supabaseAdmin.from('matches').update(updateData).eq('id_match', sMatch.id_match);
      }
    }
    // --- SEMIFINALS KE FINAL ---
    else if (match.round === 'semifinals') {
      const { data: fMatch } = await supabaseAdmin.from('matches').select('*').eq('round', 'final').maybeSingle();
      if (!fMatch) {
        await supabaseAdmin.from('matches').insert({
          round: 'final',
          match_number: 1,
          id_team_1: match.match_number === 1 ? id_pemenang : null,
          id_team_2: match.match_number === 2 ? id_pemenang : null,
        });
      } else {
        const updateData = match.match_number === 1 ? { id_team_1: id_pemenang } : { id_team_2: id_pemenang };
        await supabaseAdmin.from('matches').update(updateData).eq('id_match', fMatch.id_match);
      }
    }

    return NextResponse.json({ message: 'Skor disimpan & pemenang maju ke babak berikutnya!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
