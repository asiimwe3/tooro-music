// Full-length playback: resolve catalog songs to YouTube Music videos via
// Piped search instances and play them through the official YouTube IFrame
// player. The 30s Deezer preview remains the instant-start / fallback source.

const PIPED_INSTANCES = [
  "api.piped.private.coffee",
  "pipedapi.drgns.space",
  "pipedapi.adminforge.de",
  "pipedapi.kavin.rocks",
  "pipedapi.reallyaweso.me",
];
const MAP_KEY = "tm_ytmap";

type YtMap = Record<string, string>; // songId -> videoId | "x" (no result)

function readMap(): YtMap {
  try { return JSON.parse(localStorage.getItem(MAP_KEY) || "{}"); } catch { return {}; }
}
function writeMap(m: YtMap) {
  try { localStorage.setItem(MAP_KEY, JSON.stringify(m)); } catch { /* full */ }
}

/** Cached resolution: videoId, "x" (known unavailable), or undefined (not resolved yet). */
export function fullCacheGet(songId: string): string | undefined {
  return readMap()[songId];
}

async function searchPiped(query: string): Promise<string | null | "down"> {
  const enc = encodeURIComponent(query);
  for (const inst of PIPED_INSTANCES) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`https://${inst}/search?q=${enc}&filter=music_songs`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const j = await res.json();
      const items = (j.items || []).filter((it: any) => it.type === "stream" && (it.duration || 0) >= 60);
      if (items.length) {
        const url: string = items[0].url || "";
        const vid = url.startsWith("/watch?v=") ? url.slice(8) : "";
        if (vid) return vid;
      }
      return null; // search worked, no usable result
    } catch { /* try next instance */ }
  }
  return "down"; // all instances unreachable
}

/**
 * Resolve a full-length video for a song. Results are cached per song id
 * ("x" when no full version exists). Returns videoId or null.
 */
export async function resolveFullTrack(song: { id: string; title: string; artist: string }): Promise<string | null> {
  const cached = fullCacheGet(song.id);
  if (cached) return cached === "x" ? null : cached;
  const q = `${song.artist} ${song.title}`.replace(/\s*\(.*?\)\s*/g, " ").trim();
  const vid = await searchPiped(q);
  const map = readMap();
  if (vid && vid !== "down") { map[song.id] = vid; writeMap(map); return vid; }
  if (vid === null) { map[song.id] = "x"; writeMap(map); } // definitive: no full track
  return null;
}

// ─── YouTube IFrame API loader ───────────────────────────────────────────────

let ytPromise: Promise<any> | null = null;

export function ensureYT(): Promise<any> {
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (!ytPromise) {
    ytPromise = new Promise((resolve, reject) => {
      w.onYouTubeIframeAPIReady = () => resolve(w.YT);
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => { ytPromise = null; reject(new Error("YouTube API failed to load")); };
      document.head.appendChild(s);
    });
  }
  return ytPromise;
}

/**
 * Android WebView does not support the YouTube IFrame API and can go
 * silent on programmatic play. Detect it so full-song auto-handover
 * never mutes the app there; previews (always reliable) play instead.
 */
export function isWebView(): boolean {
  if (/;\s*wv\)/i.test(window.navigator.userAgent)) return true;
  if (/Android/i.test(window.navigator.userAgent) && !/Chrome\/[.0-9]+ Mobile/i.test(window.navigator.userAgent)) return true;
  return false;
}

/** User preference: auto-switch to full-length playback. Default OFF so the
 *  reliable preview always sounds; full songs play via the ▶ FULL chip or
 *  by enabling "Play full songs" in Settings. Never auto in WebView. */
export function autoFullEnabled(): boolean {
  if (isWebView()) return false;
  return localStorage.getItem("tm_autofull") === "1";
}
