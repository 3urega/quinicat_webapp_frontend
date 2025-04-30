import Image from 'next/image';

// Datos simulados para los equipos
const recentMatches = [
  {
    id: 1,
    homeTeam: 'CF Montcada',
    awayTeam: 'UE Sant Andreu',
    homeScore: 2,
    awayScore: 1,
    date: '15/03/2025',
    location: 'Municipal de Montcada',
    homeTeamLogo: '/logo.svg', // Usamos el logo como placeholder
    awayTeamLogo: '/logo.svg', // Usamos el logo como placeholder
  },
  {
    id: 2,
    homeTeam: 'FC Martinenc',
    awayTeam: 'CE Europa',
    homeScore: 0,
    awayScore: 3,
    date: '14/03/2025',
    location: 'Camp del Guinardó',
    homeTeamLogo: '/logo.svg',
    awayTeamLogo: '/logo.svg',
  },
  {
    id: 3,
    homeTeam: 'FC Vilafranca',
    awayTeam: 'UE Sants',
    homeScore: 1,
    awayScore: 1,
    date: '14/03/2025',
    location: 'Municipal de Vilafranca',
    homeTeamLogo: '/logo.svg',
    awayTeamLogo: '/logo.svg',
  },
];

export default function MatchStats() {
  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Últimos Resultados
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Mantente al día con los últimos partidos de la competición local
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {recentMatches.map((match) => (
            <div 
              key={match.id} 
              className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 border-[#4CAF50]"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex-1 flex flex-col sm:flex-row items-center sm:justify-end">
                    <div className="text-center sm:text-right">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{match.homeTeam}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Local</p>
                    </div>
                    <div className="mt-2 sm:mt-0 sm:ml-4">
                      <Image 
                        src={match.homeTeamLogo} 
                        alt={match.homeTeam} 
                        width={60} 
                        height={60} 
                        className="h-12 w-12 sm:h-16 sm:w-16"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:mx-8 text-center">
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow px-4 py-2 sm:px-6 sm:py-3 border-2 border-[#FFD600]">
                      <div className="flex items-center justify-center space-x-4 sm:space-x-8">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{match.homeScore}</span>
                        <span className="text-base sm:text-xl text-[#FFD600] dark:text-[#FFD600]">-</span>
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{match.awayScore}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{match.date}</div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{match.location}</div>
                  </div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row items-center sm:justify-start mt-4 sm:mt-0">
                    <div className="sm:mr-4">
                      <Image 
                        src={match.awayTeamLogo} 
                        alt={match.awayTeam} 
                        width={60} 
                        height={60} 
                        className="h-12 w-12 sm:h-16 sm:w-16"
                      />
                    </div>
                    <div className="mt-2 sm:mt-0 text-center sm:text-left">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{match.awayTeam}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Visitante</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-[#4CAF50] bg-[#FFD600] hover:bg-[#e6c200]"
          >
            Ver todos los resultados
          </a>
        </div>
      </div>
    </section>
  );
} 