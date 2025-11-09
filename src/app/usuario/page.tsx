'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function UserPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Perfil de Usuario</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <img
            src={session.user?.image || '/default-avatar.png'}
            alt="Avatar"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">{session.user?.name}</h2>
            <p className="text-gray-600">{session.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 