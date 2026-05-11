import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Menu button para mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Título da página */}
        <div className="lg:hidden">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        {/* Ações do header */}
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <FiBell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Perfil */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              Administrador
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;