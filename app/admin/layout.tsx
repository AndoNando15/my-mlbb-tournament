// app/admin/layout.tsx
import { cookies } from 'next/headers';
import AdminGuard from './AdminGuard';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Tambahkan 'await' di sini
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (session) {
    return <>{children}</>;
  }

  return <AdminGuard>{children}</AdminGuard>;
}
