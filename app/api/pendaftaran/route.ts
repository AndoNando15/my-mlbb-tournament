import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_team, nama_kapten, no_kapten, alamat_kapten, anggota_tim } = body;

    // 1. Validasi Input Dasar
    if (!nama_team || !nama_kapten || !no_kapten || !alamat_kapten || !anggota_tim) {
      return NextResponse.json({ error: 'Semua data tim wajib diisi!' }, { status: 400 });
    }

    // 2. Simpan Data Tim ke Tabel 'teams'
    const { data: teamData, error: teamError } = await supabase.from('teams').insert([{ nama_team, nama_kapten, no_kapten, alamat_kapten }]).select().single();

    if (teamError) {
      return NextResponse.json({ error: `Gagal menyimpan tim: ${teamError.message}` }, { status: 500 });
    }

    const insertedTeamId = teamData.id_team;

    // 3. Siapkan data pemain dengan menyisipkan id_team yang baru saja dibuat
    // Memastikan regional setting penulisan data tetap rapi dipisah dengan object mapping
    const formattedPlayers = anggota_tim
      .filter((p: any) => p.nama_pemain && p.nickname_game && p.id_game) // Hanya simpan yang diisi (cadangan kosong akan terfilter)
      .map((p: any) => ({
        id_team: insertedTeamId,
        nama_pemain: p.nama_pemain,
        nickname_game: p.nickname_game,
        id_game: p.id_game,
        jenjang_pemain: p.jenjang_pemain,
        is_cadangan: p.is_cadangan || false,
      }));

    // 4. Simpan Masal Data Pemain ke Tabel 'players'
    const { error: playersError } = await supabase.from('players').insert(formattedPlayers);

    if (playersError) {
      // Jika pemain gagal disimpan, idealnya hapus data tim yang menggantung (rollback manual)
      await supabase.from('teams').delete().eq('id_team', insertedTeamId);
      return NextResponse.json({ error: `Gagal menyimpan anggota: ${playersError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Pendaftaran tim dan pemain berhasil disave!', id_team: insertedTeamId }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
