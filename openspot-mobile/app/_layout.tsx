import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { ThemeModeProvider } from '@/hooks/theme-mode';
import { LikedSongsProvider } from '@/hooks/useLikedSongs';
import { useApiStatus } from '@/hooks/useApiStatus';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/lib/i18n';

SplashScreen.preventAutoHideAsync();

const LANGUAGE_KEY = 'openspot_language_v1';
const PROVIDER_KEY = 'openspot_provider_v1';

function AppNavigation() {
  const { apiStatus, loading } = useApiStatus();

  useEffect(() => {
    const checkAndSwitchProvider = async () => {
      if (loading || !apiStatus) return;

      try {
        const currentProvider = await AsyncStorage.getItem(PROVIDER_KEY);
        if (!currentProvider) return;

        if (currentProvider === 'ytmusic' && apiStatus.ytmusic?.disabled) {
          await AsyncStorage.setItem(PROVIDER_KEY, 'saavn');
          console.log('Auto-switched provider from ytmusic to saavn (ytmusic disabled)');
        } else if (currentProvider === 'saavn' && apiStatus.saavn?.disabled) {
          await AsyncStorage.setItem(PROVIDER_KEY, 'ytmusic');
          console.log('Auto-switched provider from saavn to ytmusic (saavn disabled)');
        }
      } catch (error) {
        console.error('Failed to check/switch provider:', error);
      }
    };

    checkAndSwitchProvider();
  }, [apiStatus, loading]);

  return (
    <LikedSongsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' }, // ダークモード背景色（黒）固定
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* ステータスバーを非表示＆ダーク固定 */}
      <StatusBar style="light" hidden={true} />
    </LikedSongsProvider>
  );
}

export default function RootLayout() {
  const { i18n } = useTranslation();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // アプリ起動時に保存された言語設定を読み込み（デフォルトは 'ja'）
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        const targetLang = savedLang || 'ja';
        if (i18n.language !== targetLang) {
          await i18n.changeLanguage(targetLang);
        }
      } catch (error) {
        console.error('Failed to load saved language:', error);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeModeProvider>
          <AppNavigation />
        </ThemeModeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
