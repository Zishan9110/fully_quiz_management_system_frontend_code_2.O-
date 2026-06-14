import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDark } from '@/store/slices/themeSlice';
import { generateCSSVariables } from '@/theme/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const dispatch = useDispatch();
  const isDark = useSelector(state => state.theme.isDark);

  useEffect(() => {
    // Apply CSS variables
    const vars = generateCSSVariables(isDark);
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    // Initialize from saved preference
    const saved = localStorage.getItem('darkMode') === 'true';
    dispatch(setDark(saved));
  }, []);

  return <ThemeContext.Provider value={{ isDark }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
