import React, { useState, useMemo, useCallback } from 'react';
import { ThemeModeContext } from './themeModeContext';

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
