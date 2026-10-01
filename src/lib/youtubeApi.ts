// Loads the YouTube IFrame API once and resolves when YT.Player is usable.
// Chains any onYouTubeIframeAPIReady callback already installed by another
// component (e.g. the /trailer hero) instead of replacing it.
let loading: Promise<void> | null = null;

export function loadYouTubeApi(): Promise<void> {
  if (typeof YT !== "undefined" && YT.Player) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve) => {
    const w = window as unknown as { onYouTubeIframeAPIReady?: () => void };
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return loading;
}
