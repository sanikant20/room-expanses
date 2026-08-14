import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const ThemeModeContext = createContext();

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('themeMode');
    return stored || 'light';
  });

  const toggleThemeMode = useCallback(() => {
    const next = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('themeMode', next);
    setMode(next);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode, toggleThemeMode }), [mode, toggleThemeMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
