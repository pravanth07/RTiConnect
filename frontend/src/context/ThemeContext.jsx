import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('rti_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('rti_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('rti_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

// ── Toggle Button Component ────────────────────────
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{ backgroundColor: isDark ? '#1e3a5f' : '#e5e7eb' }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span
        className="absolute top-0.5 transition-transform duration-300 w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md"
        style={{
          transform: isDark ? 'translateX(30px)' : 'translateX(2px)',
          backgroundColor: isDark ? '#1e40af' : '#ffffff',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
};
