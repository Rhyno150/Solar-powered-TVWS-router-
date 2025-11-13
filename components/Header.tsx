import React from 'react';
import { SunIcon, MoonIcon, LogoutIcon } from '../icons';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, onLogout }) => {
  return (
    <header className="bg-theme-light-gray dark:bg-theme-dark-secondary p-4 shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-accent-orange">
          TVWS Connect Mapper
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-theme-dark text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange dark:focus:ring-offset-theme-dark-secondary"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-full bg-gray-200 dark:bg-theme-dark text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange-dark dark:focus:ring-offset-theme-dark-secondary"
            aria-label="Logout"
          >
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;