import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'dark');
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'blue');

  useEffect(() => {
    // Apply theme mode (dark/light)
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('themeMode', themeMode);

    // Apply theme color
    root.setAttribute('data-theme', themeColor);
    localStorage.setItem('themeColor', themeColor);

  }, [themeMode, themeColor]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
