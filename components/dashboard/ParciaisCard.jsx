const ParciaisCard = ({ parciais }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sistema de Parciais
      </h3>

      <div className="space-y-4">
        {parciais.map((parcial) => (
          <div key={parcial.numero} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Parcial {parcial.numero}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                parcial.status === 'concluida'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {parcial.status === 'concluida' ? 'Concluída' : 'Em andamento'}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{parcial.atual} de {parcial.meta}</span>
              <span>{Math.min(Number(parcial.progresso), 100)}%</span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  parcial.status === 'concluida' ? 'bg-green-500' : 'bg-primary-600'
                }`}
                style={{ width: `${Math.min(parcial.progresso, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Meta total: {parciais.reduce((sum, p) => sum + p.meta, 0)} finalizados
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParciaisCard;