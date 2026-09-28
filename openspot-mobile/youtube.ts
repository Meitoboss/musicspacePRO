import { Innertube, UniversalCache } from 'youtubei.js/web';

let ytClient: Innertube | null = null;

export const getYouTubeClient = async (): Promise<Innertube> => {
  if (!ytClient) {
    ytClient = await Innertube.create({
      location: 'JP',
      gl: 'JP',
      hl: 'ja',
      cache: new UniversalCache(false),
      retrieve_player: false, // Hermesでの eval クラッシュを防ぐためプレイヤー取得を無効化
    });
  }
  return ytClient;
};

export const searchSongs = async (query: string) => {
  try {
    const yt = await getYouTubeClient();
    const results = await yt.music.search(query, { type: 'song' });

    return results.songs?.contents.map((song: any) => ({
      id: song.id,
      title: song.title,
      artist: song.artists?.[0]?.name || 'Unknown Artist',
      album: song.album?.name || '',
      duration: song.duration?.seconds || 0,
      thumbnail: song.thumbnails?.[0]?.url || '',
    })) || [];
  } catch (error) {
    console.error('YouTube Music 検索エラー:', error);
    return [];
  }
};

export const getAudioStreamUrl = async (videoId: string): Promise<string | null> => {
  try {
    const yt = await getYouTubeClient();

    // 1. ANDROID クライアントで直接 URL を取得（eval 不要）
    try {
      const androidInfo = await yt.getBasicInfo(videoId, 'ANDROID');
      const format = androidInfo.chooseFormat({ type: 'audio', quality: 'best' });
      if (format && format.url) {
        console.log('[youtubei.js] Android client format URL retrieved');
        return format.url;
      }
    } catch (e) {
      console.warn('[youtubei.js] Android client fetch failed, trying TV_EMBEDDED...', e);
    }

    // 2. 失敗時は TV_EMBEDDED クライアントで再試行
    const tvInfo = await yt.getBasicInfo(videoId, 'TV_EMBEDDED');
    const tvFormat = tvInfo.chooseFormat({ type: 'audio', quality: 'best' });
    if (tvFormat && tvFormat.url) {
      console.log('[youtubei.js] TV client format URL retrieved');
      return tvFormat.url;
    }

    console.error('[youtubei.js] No direct stream URL found for videoId:', videoId);
    return null;
  } catch (error) {
    console.error('ストリームURL取得エラー:', error);
    return null;
  }
};
