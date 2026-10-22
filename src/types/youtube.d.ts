declare namespace YT {
  const PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    target: Player;
    data: number;
  }

  class Player {
    constructor(
      elementId: string | HTMLElement,
      config: {
        videoId: string;
        width?: number | string;
        height?: number | string;
        playerVars?: Record<string, number | string>;
        events?: {
          onReady?: (event: PlayerEvent) => void;
          onStateChange?: (event: OnStateChangeEvent) => void;
        };
      }
    );
    playVideo(): void;
    pauseVideo(): void;
    mute(): void;
    unMute(): void;
    getPlayerState(): number;
    setPlaybackQuality(suggestedQuality: string): void;
    setPlaybackQualityRange?(min: string, max: string): void;
    destroy(): void;
  }
}
