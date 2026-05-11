const ProgressCard = ({ title, current, target, percentage }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {current} de {target}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {percentage}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>

        <div className="text-center">
          <span className={`text-sm font-medium ${
            percentage >= 100 ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {percentage >= 100 ? 'Meta atingida! 🎉' : `${target - current} restantes`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;