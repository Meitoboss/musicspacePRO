import React, { createContext, useContext } from 'react';

type ResolvedScheme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedScheme: ResolvedScheme;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  // 常に 'dark' に固定
  const mode: ThemeMode = 'dark';
  const resolvedScheme: ResolvedScheme = 'dark';
  
  // 他のコンポーネントから setMode が呼ばれても何も変更しないダミー関数
  const setMode = (_nextMode: ThemeMode) => {};

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, resolvedScheme }}>
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
