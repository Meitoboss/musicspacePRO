import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from 'react-i18next';

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: any[];
  albums: any[];
  artists: any[];
  playlists: any[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  searchType: 'track' | 'album' | 'artist' | 'playlist';
  setSearchType: (type: 'track' | 'album' | 'artist' | 'playlist') => void;
  searchTracks: (searchQuery: string, type?: 'track' | 'album' | 'artist' | 'playlist') => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
}

interface TopBarProps {
  currentView: 'home' | 'search';
  onViewChange: (view: 'home' | 'search') => void;
  onSearchClick: () => void;
  onSearchStart: () => void;
  searchState: UseSearchReturn;
  placeholderFontSize?: number;
  autoFocus?: boolean;
}

// HTML/CSSのロゴ (.brand-icon) をReact Nativeで再現したコンポーネント
function BrandLogoIcon({ isDark, accent }: { isDark: boolean; accent: string }) {
  const textColor = isDark ? '#ffffff' : '#1f232b';
  return (
    <View style={styles.brandIcon}>
      <View style={[styles.brandIconOuter, { borderColor: textColor }]} />
      <View style={[styles.brandIconInner, { borderColor: accent }]} />
      <View style={[styles.brandIconCenter, { borderColor: textColor }]} />
    </View>
  );
}

export function TopBar({
  currentView,
  onViewChange,
  onSearchClick,
  onSearchStart,
  searchState,
  placeholderFontSize = 16,
  autoFocus,
}: TopBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const accent = isDark ? '#1DB954' : '#167c3a';
  const { t } = useTranslation();
  const { query, setQuery, searchTracks, clearResults, searchType, setSearchType } = searchState;
  const router = useRouter();

  const handleTitlePress = () => {
    // ロゴタップ時の処理（必要に応じて記述。例: router.push('/settings')）
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      searchTracks(query.trim(), searchType);
      onSearchStart();
    }
  };

  const handleSearchTypeToggle = (type: 'track' | 'album' | 'artist' | 'playlist') => {
    setSearchType(type);
  };

  const handleSearchChange = (text: string) => {
    setQuery(text);
    
    if (!text.trim()) {
      clearResults();
    }
  };

  const handleBackPress = () => {
    if (!query.trim()) {
      router.push('/');
    } else {
      onViewChange('home');
      clearResults();
      setQuery('');
    }
  };

  const handleSearchFocus = () => {
    onSearchClick();
  };

  const handleSearchBlur = () => {
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#000' : '#f5efe6',
          borderBottomColor: isDark ? '#333' : '#e4d5c5',
        },
      ]}
    >
      <View style={styles.content}>
        {currentView === 'search' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111'} />
          </TouchableOpacity>
        )}

        <View style={styles.centerContent}>
          {currentView === 'home' ? (
            <TouchableOpacity 
              style={styles.brandTitleContainer} 
              onPress={handleTitlePress} 
              activeOpacity={0.8}
            >
              <BrandLogoIcon isDark={isDark} accent={accent} />
              <Text style={[styles.title, styles.homeTitle, { color: isDark ? '#ffffff' : '#1f232b' }]}>
                MusicSpace
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.searchViewContainer}>
              <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1a1a1a' : '#fffaf2' }]}>
                <TextInput
                  style={[styles.searchInput, { fontSize: placeholderFontSize, color: isDark ? '#fff' : '#2d2219' }]}
                  placeholder={t('components.search_placeholder')}
                  placeholderTextColor={isDark ? '#888' : '#8a6e5a'}
                  value={query}
                  onChangeText={handleSearchChange}
                  onSubmitEditing={handleSearchSubmit}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  autoFocus={autoFocus || currentView === 'search'}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => handleSearchChange('')}
                  >
                    <Ionicons name="close-circle" size={20} color={isDark ? '#888' : '#8a6e5a'} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.searchSubmitButton}
                  onPress={handleSearchSubmit}
                  disabled={!query.trim()}
                >
                  <Ionicons
                    name="search"
                    size={18}
                    color={query.trim() ? accent : isDark ? "#444" : "#b8a08c"}
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.searchTypeToggle, { backgroundColor: isDark ? '#1a1a1a' : '#fffaf2' }]}>
                <TouchableOpacity
                  style={[styles.toggleButton, searchType === 'track' && [styles.toggleButtonActive, { backgroundColor: accent }]]}
                  onPress={() => handleSearchTypeToggle('track')}
                >
                  <Text
                    style={[styles.toggleButtonText, { color: isDark ? '#888' : '#8a6e5a' }, searchType === 'track' && styles.toggleButtonTextActive]}
                    allowFontScaling={false}
                    numberOfLines={1}
                  >
                    {t('components.songs_tab')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, searchType === 'album' && [styles.toggleButtonActive, { backgroundColor: accent }]]}
                  onPress={() => handleSearchTypeToggle('album')}
                >
                  <Text
                    style={[styles.toggleButtonText, { color: isDark ? '#888' : '#8a6e5a' }, searchType === 'album' && styles.toggleButtonTextActive]}
                    allowFontScaling={false}
                    numberOfLines={1}
                  >
                    {t('components.albums_tab')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, searchType === 'artist' && [styles.toggleButtonActive, { backgroundColor: accent }]]}
                  onPress={() => handleSearchTypeToggle('artist')}
                >
                  <Text
                    style={[styles.toggleButtonText, { color: isDark ? '#888' : '#8a6e5a' }, searchType === 'artist' && styles.toggleButtonTextActive]}
                    allowFontScaling={false}
                    numberOfLines={1}
                  >
                    {t('components.artists_tab')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, searchType === 'playlist' && [styles.toggleButtonActive, { backgroundColor: accent }]]}
                  onPress={() => handleSearchTypeToggle('playlist')}
                >
                  <Text
                    style={[styles.toggleButtonText, { color: isDark ? '#888' : '#8a6e5a' }, searchType === 'playlist' && styles.toggleButtonTextActive]}
                    allowFontScaling={false}
                    numberOfLines={1}
                  >
                    {t('components.playlists_tab')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {currentView === 'home' && (
          <View style={styles.homeActions}>
            <TouchableOpacity
              style={[styles.homeSearchButton, { backgroundColor: isDark ? '#1a1a1a' : '#fffaf2' }]}
              onPress={onSearchClick}
              activeOpacity={0.85}
            >
              <Ionicons name="search" size={18} color={accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconOuter: {
    position: 'absolute',
    width: 32,
    height: 20,
    bottom: 2,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  brandIconInner: {
    position: 'absolute',
    width: 22,
    height: 14,
    bottom: 7,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
  },
  brandIconCenter: {
    position: 'absolute',
    width: 12,
    height: 9,
    bottom: 12,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  homeTitle: {
    textAlign: 'left',
  },
  searchViewContainer: {
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: 40,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
  searchSubmitButton: {
    marginLeft: 8,
    padding: 4,
  },
  homeActions: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeSearchButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  toggleButtonActive: {
    backgroundColor: '#1DB954',
  },
  toggleButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
});
