import { Track, SearchResponse } from '@/types/music';
import { searchSongs, getAudioStreamUrl } from '../youtube';

export class YTMusicAPI {
  private static toImageSet(url: string) {
    return { small: url, thumbnail: url, large: url, back: null };
  }

  /**
   * youtube.ts の検索結果をアプリ共通の Track 型に変換
   */
  private static normalizeTrack(song: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    thumbnail?: string;
  }): Track {
    const thumb = song.thumbnail || (song.id ? `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg` : '');
    
    return {
      id: song.id || '',
      provider: 'ytmusic',
      title: song.title || 'Unknown title',
      artist: song.artist || 'Unknown Artist',
      artistId: 0,
      albumTitle: song.album || '',
      albumCover: thumb,
      albumId: '',
      releaseDate: '',
      genre: '',
      duration: (song.duration || 0) * 1000, // ミリ秒に変換
      audioQuality: { maximumBitDepth: 16, maximumSamplingRate: 44100, isHiRes: false },
      version: null,
      label: '',
      labelId: 0,
      upc: '',
      mediaCount: 1,
      parental_warning: false,
      streamable: true,
      purchasable: false,
      previewable: false,
      genreId: 0,
      genreSlug: '',
      genreColor: '',
      releaseDateStream: '',
      releaseDateDownload: '',
      maximumChannelCount: 2,
      images: this.toImageSet(thumb),
      isrc: '',
    };
  }

  /**
   * 楽曲検索（youtubei.js を利用）
   */
  static async search(params: { q: string; type?: 'track' }): Promise<SearchResponse> {
    try {
      console.log('[YTMusicAPI] Searching via youtubei.js:', params.q);
      const rawSongs = await searchSongs(params.q);

      const seen = new Set<string>();
      const tracks: Track[] = [];

      for (const song of rawSongs) {
        if (!song.id || seen.has(song.id)) continue;
        seen.add(song.id);
        tracks.push(this.normalizeTrack(song));
      }

      return {
        tracks,
        albums: [],
        artists: [],
        playlists: [],
        pagination: { offset: 0, total: tracks.length, hasMore: false },
      };
    } catch (error) {
      console.error('[YTMusicAPI] search error:', error);
      return { tracks: [], albums: [], artists: [], playlists: [], pagination: { offset: 0, total: 0, hasMore: false } };
    }
  }

  /**
   * 音声ストリームURLの取得（youtubei.js を利用）
   */
  static async getStreamUrl(trackId: string): Promise<string> {
    console.log('[YTMusicAPI] getStreamUrl via youtubei.js:', { trackId });
    try {
      const streamUrl = await getAudioStreamUrl(trackId);
      if (!streamUrl) {
        throw new Error('Could not extract audio stream URL');
      }
      return streamUrl;
    } catch (error) {
      console.error('[YTMusicAPI] getStreamUrl error:', error);
      throw new Error('Failed to get stream URL');
    }
  }

  static async getDownloadUrl(trackId: string): Promise<string> {
    return this.getStreamUrl(trackId);
  }

  static async getAlbumSongs(_albumId: string): Promise<Track[]> {
    throw new Error('Albums are not supported on YouTube Music');
  }
  static async getArtistSongs(_artistId: string): Promise<Track[]> {
    throw new Error('Artist songs not available on YouTube Music');
  }
  static async getPlaylistSongs(_playlistId: string): Promise<Track[]> {
    throw new Error('Playlists are not supported on YouTube Music');
  }
  static async getPopularTracks(): Promise<Track[]> {
    throw new Error('Popular tracks not available on YouTube Music');
  }
  static async getMadeForYou(): Promise<Track[]> {
    throw new Error('Recommended tracks not available on YouTube Music');
  }
}
