'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Partidos de ejemplo para la jornada actual
const PARTIDOS = [
  { id: 1, local: 'FC Barcelona', visitante: 'Real Madrid', fecha: '19/03/2023 16:00' },
  { id: 2, local: 'Atlético de Madrid', visitante: 'Sevilla FC', fecha: '19/03/2023 18:30' },
  { id: 3, local: 'Athletic Club', visitante: 'Valencia CF', fecha: '18/03/2023 14:00' },
  { id: 4, local: 'Real Betis', visitante: 'Real Sociedad', fecha: '18/03/2023 16:15' },
  { id: 5, local: 'Villarreal CF', visitante: 'Celta de Vigo', fecha: '18/03/2023 18:30' },
  { id: 6, local: 'RCD Espanyol', visitante: 'Girona FC', fecha: '19/03/2023 14:00' },
  { id: 7, local: 'Rayo Vallecano', visitante: 'Cádiz CF', fecha: '17/03/2023 21:00' },
  { id: 8, local: 'Getafe CF', visitante: 'UD Almería', fecha: '18/03/2023 21:00' },
  { id: 9, local: 'Elche CF', visitante: 'Real Valladolid', fecha: '19/03/2023 21:00' },
  { id: 10, local: 'Mallorca', visitante: 'Osasuna', fecha: '17/03/2023 21:00' },
  { id: 11, local: 'Deportivo Alavés', visitante: 'CD Leganés', fecha: '18/03/2023 16:15' },
  { id: 12, local: 'Levante UD', visitante: 'Real Oviedo', fecha: '19/03/2023 16:15' },
  { id: 13, local: 'Granada CF', visitante: 'Málaga CF', fecha: '19/03/2023 18:30' },
  { id: 14, local: 'SD Eibar', visitante: 'SD Huesca', fecha: '18/03/2023 21:00' },
];

// Opciones para cada partido: 1 (victoria local), X (empate), 2 (victoria visitante)
type Resultado = '1' | 'X' | '2' | null;

export default function NuevaApuestaPage() {
  const router = useRouter();
  const [resultados, setResultados] = useState<Record<number, Resultado>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar selección de resultado
  const handleSelectResultado = (partidoId: number, resultado: Resultado) => {
    setResultados(prev => ({
      ...prev,
      [partidoId]: resultado
    }));
  };

  // Verificar si todos los partidos tienen un resultado seleccionado
  const isApuestaCompleta = Object.keys(resultados).length === PARTIDOS.length;

  // Función para crear el texto resumen de la quiniela
  const getResumenQuiniela = () => {
    return PARTIDOS.map(partido => resultados[partido.id] || '-').join('');
  };

  // Enviar la quiniela
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isApuestaCompleta) {
      setErrorMessage('Debes seleccionar un resultado para todos los partidos');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulamos el envío a un servidor
    setTimeout(() => {
      // Aquí iría la lógica para guardar la apuesta en el servidor
      setIsSubmitting(false);
      router.push('/dashboard/apuestas');
    }, 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Nueva Apuesta - Jornada 26
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Selecciona el resultado para cada partido de la jornada (1: Victoria local, X: Empate, 2: Victoria visitante)
        </p>
      </div>
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Equipo Local
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Apuesta
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Equipo Visitante
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-400 dark:text-gray-500">
                  {/* Fecha - sin título */}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {PARTIDOS.map((partido) => (
                <tr key={partido.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                    {partido.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {partido.local}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSelectResultado(partido.id, '1')}
                        className={`w-10 h-10 rounded-full ${
                          resultados[partido.id] === '1'
                            ? 'bg-red-600 text-white dark:bg-red-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectResultado(partido.id, 'X')}
                        className={`w-10 h-10 rounded-full ${
                          resultados[partido.id] === 'X'
                            ? 'bg-red-600 text-white dark:bg-red-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        X
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectResultado(partido.id, '2')}
                        className={`w-10 h-10 rounded-full ${
                          resultados[partido.id] === '2'
                            ? 'bg-red-600 text-white dark:bg-red-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        2
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {partido.visitante}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-xs text-gray-400 dark:text-gray-500">
                    {partido.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Resumen de la apuesta */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Resumen de tu quiniela
          </h2>
          
          <div className="grid grid-cols-14 gap-2 mb-4">
            {PARTIDOS.map(partido => (
              <div key={partido.id} className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{partido.id}</div>
                <div 
                  className={`text-xl font-bold p-2 rounded-md ${
                    resultados[partido.id] 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {resultados[partido.id] || '-'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tu apuesta: <span className="font-mono text-red-600 dark:text-red-400">{getResumenQuiniela()}</span>
            </p>
          </div>
          
          <div className="mb-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Partidos seleccionados:
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {Object.keys(resultados).length} / {PARTIDOS.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-red-600 dark:bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${(Object.keys(resultados).length / PARTIDOS.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={!isApuestaCompleta || isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : "Enviar quiniela"}
          </button>
        </div>
      </form>
    </div>
  );
} 