import { theme } from '@/styles/theme';

export default function UserPage() {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bienvenido a tu Área Personal</h2>
        <p className="text-gray-600">
          Aquí podrás gestionar tu perfil, configurar tus preferencias y acceder a tus datos personales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Hace 2 horas</p>
              <p className="text-gray-900">Has iniciado sesión en tu cuenta</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Ayer</p>
              <p className="text-gray-900">Actualizaste tu información de perfil</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Acciones</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
              <p className="text-gray-900">Completar tu perfil</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
              <p className="text-gray-900">Verificar tu email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 