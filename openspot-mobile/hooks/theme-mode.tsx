import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedScheme: ThemeMode;
}

const STORAGE_KEY = 'openspot_theme_mode_v1';
const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  // ベース（初期値）を 'dark' に設定
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    let mounted = true;
    const loadMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted || !stored) return;
        // 保存されていた値が 'light' か 'dark' の場合のみ反映
        if (stored === 'light' || stored === 'dark') {
          setModeState(stored);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };
    void loadMode();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch((error) => {
      console.error('Failed to save theme mode:', error);
    });
  };

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, resolvedScheme: mode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}
