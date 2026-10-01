// openspot-mobile/youtube.ts

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  duration?: number;
}

export class RiMusicService {
  // RiMusicが内部で通信に使用しているWEB_REMIX用APIキー
  private static readonly API_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30"; 
  private static readonly BASE_URL = "https://music.youtube.com/youtubei/v1";

  // RiMusicで使われている標準コンテキスト
  private static get context() {
    return {
      client: {
        clientName: "WEB_REMIX",
        clientVersion: "1.20250101.01.00",
        hl: "ja",
        gl: "JP"
      }
    };
  }

  /**
   * 1. 楽曲検索 (RiMusicの search ロジック)
   */
  static async searchTracks(query: string): Promise<TrackInfo[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/search?key=${this.API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify({
          query,
          context: this.context
        })
      });

      const data = await response.json();
      return this.parseSearchResponse(data);
    } catch (error) {
      console.error("[RiMusicService] Search error:", error);
      return [];
    }
  }

  /**
   * 2. 音声ストリーミングURL取得 (RiMusicの player ロジック)
   */
  static async getAudioStreamUrl(videoId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/player?key=${this.API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify({
          videoId,
          context: this.context
        })
      });

      const data = await response.json();
      const formats = data.streamingData?.adaptiveFormats || [];

      // 音声（audio/）のフォーマットを絞り込み、最高ビットレートのURLを取得
      const audioFormats = formats
        .filter((f: any) => f.mimeType?.includes("audio/"))
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

      return audioFormats[0]?.url || null;
    } catch (error) {
      console.error("[RiMusicService] Stream URL error:", error);
      return null;
    }
  }

  /**
   * InnerTubeの検索レスポンス解析
   */
  private static parseSearchResponse(data: any): TrackInfo[] {
    const tracks: TrackInfo[] = [];
    try {
      const contents =
        data.contents?.tabbedSearchResultsRenderer?.tabs[0]?.tabRenderer?.content
          ?.sectionListRenderer?.contents;

      if (!contents) return [];

      for (const section of contents) {
        const shelf = section.musicShelfRenderer;
        if (!shelf) continue;

        for (const item of shelf.contents) {
          const listItem = item.musicResponsiveListItemRenderer;
          if (!listItem) continue;

          const videoId = listItem.playlistItemData?.videoId || listItem.doubleTapCommand?.watchEndpoint?.videoId;
          if (!videoId) continue;

          const title = listItem.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.text || "Unknown";
          const artist = listItem.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.text || "Unknown Artist";
          const thumbnails = listItem.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails;
          const artwork = thumbnails ? thumbnails[thumbnails.length - 1].url : "";

          tracks.push({
            id: videoId,
            title,
            artist,
            artwork
          });
        }
      }
    } catch (e) {
      console.error("[RiMusicService] Parse error:", e);
    }
    return tracks;
  }
}
