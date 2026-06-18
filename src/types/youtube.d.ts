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
      elementId: string,
      config: {
        videoId: string;
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
    destroy(): void;
  }
}
