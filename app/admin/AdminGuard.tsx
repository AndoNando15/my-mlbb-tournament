// app/admin/AdminGuard.tsx
'use client';
import { useState } from 'react';
import { verifyPassword } from './actions'; // Server action untuk cek sandi

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = await verifyPassword(password);
    if (isSuccess) {
      window.location.reload(); // Refresh untuk melihat konten admin
    } else {
      setError('Sandi salah!');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border-4 border-yellow-500">
          <h2 className="text-xl font-black text-red-800 uppercase mb-4">Akses Admin</h2>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border-2 border-red-200 rounded mb-4 text-center" placeholder="Masukkan sandi..." />
          {error && <p className="text-red-600 text-xs mb-4">{error}</p>}
          <button type="submit" className="w-full bg-red-800 text-white font-bold py-2 rounded">
            MASUK
          </button>
        </form>
      </div>
      {/* children disembunyikan sampai password benar */}
    </>
  );
}
