'use client';

import { useState } from 'react';
import Link from 'next/link';

// Datos simulados de apuestas
const APUESTAS = [
  { id: 1, jornada: 'Jornada 25', fecha: '12/03/2023', estado: 'Pendiente', resultado: '-' },
  { id: 2, jornada: 'Jornada 24', fecha: '05/03/2023', estado: 'Ganada', resultado: '10/15' },
  { id: 3, jornada: 'Jornada 23', fecha: '26/02/2023', estado: 'Perdida', resultado: '7/15' },
  { id: 4, jornada: 'Jornada 22', fecha: '19/02/2023', estado: 'Ganada', resultado: '9/15' },
  { id: 5, jornada: 'Jornada 21', fecha: '12/02/2023', estado: 'Perdida', resultado: '5/15' },
  { id: 6, jornada: 'Jornada 20', fecha: '05/02/2023', estado: 'Ganada', resultado: '11/15' },
];

export default function ApuestasPage() {
  const [filtro, setFiltro] = useState('todas');
  
  // Filtrar apuestas según el estado seleccionado
  const apuestasFiltradas = filtro === 'todas' 
    ? APUESTAS 
    : APUESTAS.filter(apuesta => apuesta.estado.toLowerCase() === filtro);
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
          Mis Apuestas
        </h1>
        
        <Link 
          href="/dashboard/apuestas/nueva"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nueva apuesta
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFiltro('todas')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtro === 'todas' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFiltro('pendiente')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtro === 'pendiente' 
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setFiltro('ganada')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtro === 'ganada' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Ganadas
          </button>
          <button 
            onClick={() => setFiltro('perdida')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtro === 'perdida' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Perdidas
          </button>
        </div>
      </div>
      
      {/* Tabla de apuestas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {apuestasFiltradas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jornada
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {apuestasFiltradas.map((apuesta) => (
                  <tr key={apuesta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {apuesta.jornada}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {apuesta.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${apuesta.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 
                          apuesta.estado === 'Ganada' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}
                      >
                        {apuesta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {apuesta.resultado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/dashboard/apuestas/${apuesta.id}`}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Ver detalles
                      </Link>
                      {apuesta.estado === 'Pendiente' && (
                        <Link 
                          href={`/dashboard/apuestas/${apuesta.id}/editar`}
                          className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Editar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay apuestas</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No se encontraron apuestas con el filtro seleccionado.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => setFiltro('todas')} 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Ver todas las apuestas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 