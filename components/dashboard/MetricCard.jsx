import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const MetricCard = ({ title, value, icon: Icon, color, change, action, children }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}% vs ontem
            </div>
          )}
        </div>
        {action ? (
          <div>{action}</div>
        ) : (
          <div className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].replace('bg-', 'text-')}`} />
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default MetricCard;