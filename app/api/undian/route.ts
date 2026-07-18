import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Membuat client khusus admin untuk bypass batasan RLS di sisi server
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    // 1. Ambil semua data tim menggunakan client admin
    const { data: teams, error: fetchError } = await supabaseAdmin.from('teams').select('*');

    if (fetchError) {
      return NextResponse.json({ error: `Gagal mengambil data tim: ${fetchError.message}` }, { status: 500 });
    }

    if (!teams || teams.length === 0) {
      return NextResponse.json({ error: 'Belum ada tim yang terdaftar untuk diundi.' }, { status: 400 });
    }

    // 2. Acak nomor urut (Fisher-Yates Shuffle)
    const totalTeams = teams.length;
    const shuffledNumbers = Array.from({ length: totalTeams }, (_, i) => i + 1);
    for (let i = shuffledNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledNumbers[i], shuffledNumbers[j]] = [shuffledNumbers[j], shuffledNumbers[i]];
    }

    // 3. Petakan data tim lama dengan nilai nomor undian yang baru
    const payloadUpsert = teams.map((team, index) => ({
      ...team,
      no_undian: shuffledNumbers[index],
    }));

    // 4. Eksekusi simpan massal lewat client admin (Bypass RLS Policy)
    const { error: upsertError } = await supabaseAdmin.from('teams').upsert(payloadUpsert);

    if (upsertError) {
      return NextResponse.json({ error: `Gagal memperbarui database: ${upsertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Semua tim berhasil diundi secara acak!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: `Server crash: ${error.message}` }, { status: 500 });
  }
}
