// app/admin/actions.ts
'use server';
import { cookies } from 'next/headers';

export async function verifyPassword(password: string) {
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // JANGAN SET maxAge jika ingin sesi berakhir saat browser ditutup
    });
    return true;
  }
  return false;
}
