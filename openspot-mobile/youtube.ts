import { Innertube } from 'youtubei.js/web';

let ytClient: Innertube | null = null;

/**
 * YouTube (Innertube) クライアントの初期化
 * 日本 (JP) コンテキストを指定して、邦楽の公式音源を取得できるようにします
 */
export const getYouTubeClient = async (): Promise<Innertube> => {
  if (!ytClient) {
    ytClient = await Innertube.create({
      location: 'JP',
      gl: 'JP',
      hl: 'ja',
      retrieve_player: true,
    });
  }
  return ytClient;
};

/**
 * 1. 楽曲検索 (YouTube Music の 'song' 指定でカバー曲・ピアノ版を除外)
 * @param query 検索ワード (例: "YOASOBI アイドル")
 */
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

/**
 * 2. 音声ストリーム再生用URLの取得
 * @param videoId 曲の ID (例: "m7L3B52TfG0")
 */
export const getAudioStreamUrl = async (videoId: string): Promise<string | null> => {
  try {
    const yt = await getYouTubeClient();
    const info = await yt.getBasicInfo(videoId);
    
    // 音声のみ・最高音質のフォーマットを自動選択
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    if (!format) return null;

    // 再生可能なURLにデコードして返却
    const streamUrl = format.decipher(yt.session.player);
    return streamUrl;
  } catch (error) {
    console.error('ストリームURL取得エラー:', error);
    return null;
  }
};

/**
 * 3. 歌詞データの取得
 * @param videoId 曲の ID
 */
export const getLyrics = async (videoId: string): Promise<string | null> => {
  try {
    const yt = await getYouTubeClient();
    const lyricsData = await yt.music.getLyrics(videoId);
    return lyricsData?.description?.text || null;
  } catch (error) {
    console.error('歌詞取得エラー:', error);
    return null;
  }
};