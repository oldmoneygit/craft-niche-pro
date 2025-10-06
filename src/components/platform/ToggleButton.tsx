import { ReactNode } from 'react';

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export const ToggleButton = ({ active, onClick, children, className = '' }: ToggleButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
        active
          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
};
