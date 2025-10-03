import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center shadow-xl hover:scale-110 hover:border-indigo-500 transition-all duration-300 z-50"
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <Moon size={24} className="text-indigo-400" />
      ) : (
        <Sun size={24} className="text-amber-500" />
      )}
    </button>
  );
}
