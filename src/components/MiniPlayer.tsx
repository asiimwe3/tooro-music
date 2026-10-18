import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/appStore";
import { loadTrackSource, prefetchAudio, fetchFreshPreview } from "../lib/audioStore";
import { ensureYT, resolveFullTrack, fullCacheGet, autoFullEnabled, isWebView } from "../lib/fullTrack";
import { SONGS } from "../data/mock";
import { CoverArt } from "./CoverArt";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, setProgress, playbackSpeed, setPlaybackSpeed, favorites, toggleFavorite, showToast } = useAppStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objUrlRef = useRef<string | null>(null);
  const warmedRef = useRef(false);
  const retryRef = useRef<string | null>(null);
  const ytRef = useRef<any>(null);
  const ytDivRef = useRef<HTMLDivElement | null>(null);
  const watchRef = useRef<any>(null);
  const seekedRef = useRef(false);
  const [fullId, setFullId] = useState<string | null>(null);
  const [fullAvail, setFullAvail] = useState<string | null>(null);

  // Prefetch the next two catalog tracks so next/prev starts instantly
  const prefetchNeighbors = (id: string) => {
    const idx = SONGS.findIndex((s) => s.id === id);
    if (idx < 0) return;
    [SONGS[(idx + 1) % SONGS.length], SONGS[(idx + 2) % SONGS.length]].forEach((s) => {
      const u = (s as any).audioUrl;
      if (u && !u.startsWith("idb:")) prefetchAudio(u, (s as any).dzId);
    });
  };
  // ── Full-length (YouTube) mode helpers ─────────────────────────────────
  const stopWatchdog = () => { if (watchRef.current) { clearTimeout(watchRef.current); watchRef.current = null; } };

  const exitFull = (silent = false) => {
    stopWatchdog();
    try { ytRef.current?.stopVideo?.(); } catch { /* ignore */ }
    if (fullId) setFullId(null);
    setFullAvail(null);
    if (!silent) { const a = audioRef.current; if (a && useAppStore.getState().isPlaying) a.play().catch(() => {}); }
  };

  const enterFull = (videoId: string) => {
    stopWatchdog();
    setFullAvail(null);
    setFullId(videoId);
    seekedRef.current = false;
    // Fallback watchdog: if the YouTube player hasn't started in time, resume the preview
    watchRef.current = setTimeout(() => {
      const st = (() => { try { return ytRef.current?.getPlayerState?.(); } catch { return -1; } })();
      if (st !== 1) { exitFull(true); const a = audioRef.current; if (a && useAppStore.getState().isPlaying) a.play().catch(() => {}); showToast("Full song unavailable — playing preview"); }
    }, 3500);
  };

  const [expanded, setExpanded] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);

  // Warm the first catalog tracks once so the very first tap is instant
  useEffect(() => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    SONGS.slice(0, 3).forEach((s) => {
      const u = (s as any).audioUrl;
      if (u && !u.startsWith("idb:")) prefetchAudio(u, (s as any).dzId);
    });
  }, []);

  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    a.volume = volume;
    a.crossOrigin = "anonymous";
    // Safety net: if the source is dead (Deezer links expire ~daily),
    // fetch a fresh link and keep playing — silence is never acceptable.
    a.addEventListener("error", () => {
      if (!a.src || a.src === window.location.href) return;
      const song: any = useAppStore.getState().currentSong;
      if (!song || retryRef.current === song.id || !song.dzId) return;
      retryRef.current = song.id;
      fetchFreshPreview(String(song.dzId)).then((fresh) => {
        if (!fresh || (useAppStore.getState().currentSong as any)?.id !== song.id) return;
        a.src = fresh;
        a.load();
        if (useAppStore.getState().isPlaying) a.play().catch(() => {});
      });
    });
    a.addEventListener("timeupdate", () => {
      if (a.duration) { setProgress((a.currentTime / a.duration) * 100); setCurrentTime(a.currentTime); }
    });
    a.addEventListener("loadedmetadata", () => setDuration(a.duration));
    a.addEventListener("ended", nextSong);
    audioRef.current = a;
    return () => { a.pause(); };
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    const audio = audioRef.current;
    const song = currentSong as any;
    const alive = () => (useAppStore.getState().currentSong as any)?.id === song.id;
    (async () => {
      // Reset full-length mode for the new song
      stopWatchdog();
      try { ytRef.current?.stopVideo?.(); } catch { /* ignore */ }
      setFullId(null);
      setFullAvail(null);

      // Fast-start: cached blob (IndexedDB for uploads, Cache API for previews) or raw URL fallback
      const url = song.audioUrl || "";
      const src = await loadTrackSource(url, (song as any).dzId);
      if (!alive()) return;
      if (objUrlRef.current && objUrlRef.current !== src) URL.revokeObjectURL(objUrlRef.current);
      objUrlRef.current = src.startsWith("blob:") ? src : null;
      audio.src = src;
      audio.load();
      audio.playbackRate = playbackSpeed;
      if (useAppStore.getState().isPlaying) audio.play().catch(() => {});
      prefetchNeighbors(song.id);

      // Uploaded songs play from device storage — already full length
      if (url.startsWith("idb:")) return;

      // Android WebView: YouTube player unsupported — keep reliable preview audio only
      if (isWebView()) return;

      // Catalog song: start resolving the full-length version in the background
      const cached = fullCacheGet(song.id);
      if (cached && cached !== "x") {
        if (autoFullEnabled()) enterFull(cached);
        else setFullAvail(cached);
        return;
      }
      resolveFullTrack(song).then((vid) => {
        if (!alive() || !vid) return;
        if (autoFullEnabled()) enterFull(vid);
        else setFullAvail(vid);
      });
      // Also pre-resolve neighbors so skipping lands on a full track instantly
      const idx = SONGS.findIndex((t: any) => t.id === song.id);
      if (idx >= 0) {
        [SONGS[(idx + 1) % SONGS.length], SONGS[(idx + 2) % SONGS.length]].forEach((t: any) => {
          const c = fullCacheGet(t.id);
          if (!c) resolveFullTrack(t).catch(() => {});
        });
      }
    })();
  }, [currentSong]);

  useEffect(() => {
    if (fullId && ytRef.current?.getPlayerState !== undefined) {
      try { if (isPlaying) ytRef.current.playVideo(); else ytRef.current.pauseVideo(); return; } catch { /* fall through */ }
    }
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {}); else audioRef.current.pause();
  }, [isPlaying, fullId]);

  useEffect(() => {
    try { ytRef.current?.setPlaybackRate?.(playbackSpeed); } catch { /* ignore */ }
    if (audioRef.current && !fullId) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, fullId]);

  // Create / reuse the YouTube player when entering full mode
  useEffect(() => {
    if (!fullId) return;
    let cancelled = false;
    ensureYT().then((YT: any) => {
      if (cancelled || !ytDivRef.current) return;
      const reuse = (() => {
        try {
          const p = ytRef.current;
          if (!p) return false;
          const ifr = p.getIframe?.();
          return !!(ifr && document.contains(ifr));
        } catch { return false; }
      })();
      if (reuse) {
        ytRef.current.loadVideoById(fullId);
        if (isPlaying) try { ytRef.current.playVideo(); } catch { /* ignore */ }
        return;
      }
      try { ytRef.current?.destroy?.(); } catch { /* ignore */ }
      ytRef.current = new YT.Player(ytDivRef.current, {
        videoId: fullId,
        playerVars: { playsinline: 1, controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3 },
        events: {
          onReady: () => {
            try { ytRef.current.setVolume(volume * 100); if (isPlaying) ytRef.current.playVideo(); } catch { /* ignore */ }
          },
          onStateChange: (e: any) => {
            if (e.data === 1) {
              // Playing: hand over from the preview, continuing at the same position
              stopWatchdog();
              const a = audioRef.current;
              if (a && !a.paused && !seekedRef.current) {
                const at = a.currentTime;
                try { if (at > 0.5) ytRef.current.seekTo(at, true); } catch { /* ignore */ }
                seekedRef.current = true;
              }
              if (a) a.pause();
            } else if (e.data === 0) {
              nextSong(); // ended
            } else if (e.data === 2) {
              // paused externally: reflect in UI
            }
          },
          onError: () => { exitFull(true); const a = audioRef.current; if (a && useAppStore.getState().isPlaying) a.play().catch(() => {}); showToast("Full song unavailable — playing preview"); },
        },
      });
      if (isPlaying) try { ytRef.current.playVideo(); } catch { /* ignore */ }
    }).catch(() => {
      exitFull(true);
      const a = audioRef.current;
      if (a && useAppStore.getState().isPlaying) a.play().catch(() => {});
    });
    return () => { cancelled = true; };
  }, [fullId]);

  // Poll YouTube progress while in full mode
  useEffect(() => {
    if (!fullId) return;
    const iv = setInterval(() => {
      try {
        const p = ytRef.current;
        if (!p?.getCurrentTime) return;
        const t = p.getCurrentTime() || 0;
        const d = p.getDuration() || 0;
        if (d) { setProgress((t / d) * 100); setCurrentTime(t); setDuration(d); }
      } catch { /* ignore */ }
    }, 500);
    return () => clearInterval(iv);
  }, [fullId]);

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    if (fullId && ytRef.current?.seekTo && duration) {
      try { ytRef.current.seekTo(frac * duration, true); return; } catch { /* fall through */ }
    }
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = frac * duration;
  }

  function fmt(s: number) {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  }

  if (!currentSong) return null;

  const coverUrl = (currentSong as any).coverUrl || "";

  return (
    <>
      {/* ── Full Screen Player ──────────────────────────────────────────── */}
      {expanded && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#050A14", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Ambient BG */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 30%,${currentSong.color}20,transparent 70%)`, pointerEvents: "none" }} />

          {/* Handle */}
          <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
          </div>

          {/* Top row */}
          <div className="flex items-center justify-between px-5 py-3">
            <button onClick={() => setExpanded(false)} style={{ width: 36, height: 36, borderRadius: 11, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--t2)" }}>↓</button>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: fullId ? "#FF6B6B" : "var(--t2)" }}>{fullId ? "NOW PLAYING · FULL SONG" : "NOW PLAYING"}</div>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--t2)" }}>⋯</button>
          </div>

          {/* Cover — real album art */}
          <div className="flex justify-center px-8" style={{ marginTop: 8, marginBottom: 24 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 262, height: 262, borderRadius: 30, overflow: "hidden", boxShadow: `0 36px 90px ${currentSong.color}50, 0 0 60px ${currentSong.color}30, 0 8px 24px rgba(0,0,0,0.6)`, border: `1px solid rgba(255,255,255,0.12)` }}>
                <CoverArt seed={currentSong.title} color={currentSong.color} size={260} radius={0} imageUrl={coverUrl} />
              </div>
              {isPlaying && (
                <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 2.5, alignItems: "flex-end", background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "6px 8px" }}>
                  {[1, 2, 3, 4].map(i => (
                    <span key={i} className="wave-bar" style={{ height: [10, 16, 8, 13][i - 1], animationDelay: `${(i - 1) * 0.12}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Song info */}
          <div className="px-6 mb-4 flex items-center justify-between">
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize: 23, fontWeight: 700, color: "#EAF2FF", letterSpacing: "-0.02em" }}>{currentSong.title}</div>
              <div style={{ fontSize: 14, color: "var(--t2)", marginTop: 3 }}>{currentSong.artist} · {currentSong.genre}</div>
            </div>
            <button style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--t3)" }}>♡</button>
          </div>

          {/* Progress */}
          <div className="px-6 mb-2">
            <div style={{ height: 5, background: "rgba(255,255,255,0.09)", borderRadius: 100, cursor: "pointer", position: "relative", marginBottom: 8 }} onClick={seek}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,#38BDF8,#2DD4BF)`, borderRadius: 100, transition: "width 0.1s linear" }} />
              <div style={{ position: "absolute", top: "50%", left: `${progress}%`, transform: "translate(-50%,-50%)", width: 15, height: 15, borderRadius: "50%", background: "#fff", boxShadow: "0 0 16px rgba(59, 130, 246,0.8), 0 2px 8px rgba(0,0,0,0.4)", transition: "left 0.1s linear" }} />
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{fmt(currentTime)}</span>
              <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-8 mb-5">
            <button className="pressable" onClick={prevSong} style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--t2)" }}>⏮</button>
            <button className="pressable" onClick={togglePlay} style={{ width: 68, height: 68, borderRadius: "50%", background: "conic-gradient(from 210deg, #06B6D4, #3B82F6, #6366F1, #818CF8, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 34px rgba(6, 182, 212,0.55), inset 0 1px 0 rgba(255,255,255,0.3)" }}>{isPlaying ? "⏸" : "▶"}</button>
            <button className="pressable" onClick={nextSong} style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--t2)" }}>⏭</button>
          </div>

          {/* Speed + Volume */}
          <div className="px-6 flex flex-col gap-5">
            <div>
              <div className="label mb-2">Playback Speed</div>
              <div className="flex gap-2">
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => setPlaybackSpeed(s)} style={{ flex: 1, padding: "9px 4px", borderRadius: 11, fontSize: 12, fontWeight: 800, background: playbackSpeed === s ? "linear-gradient(135deg,#38BDF8,#4F46E5)" : "var(--surf)", border: playbackSpeed === s ? "none" : "1px solid var(--bd)", color: playbackSpeed === s ? "#fff" : "var(--t3)", boxShadow: playbackSpeed === s ? "0 4px 12px rgba(56, 189, 248,0.3)" : "none" }}>{s}x</button>
                ))}
              </div>
            </div>
            <div>
              <div className="label mb-2">🔊 Volume</div>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => { const v = parseFloat(e.target.value); setVolume(v); try { ytRef.current?.setVolume?.(v * 100); } catch { /* ignore */ } if (audioRef.current) audioRef.current.volume = v; }} style={{ width: "100%", accentColor: "#38BDF8" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mini Player Bar ──────────────────────────────────────────────── */}
      <div className="mini-bar" style={{
        position: "fixed", bottom: 88, left: 12, right: 12, zIndex: 90,
        borderRadius: 20, overflow: "hidden",
        background: "rgba(8, 16, 32,0.88)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 18px 50px rgba(2, 8, 18,0.65), 0 0 30px rgba(6, 182, 212,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}>
        {/* Progress line */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", cursor: "pointer" }} onClick={seek}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#38BDF8,#2DD4BF)", transition: "width 0.1s linear" }} />
        </div>

        <div className="flex items-center gap-3" style={{ padding: "10px 12px 12px" }}>
          {/* Cover — real art, or the YouTube player when a full song is playing */}
          <div onClick={() => setExpanded(true)} style={{ cursor: "pointer", flexShrink: 0, width: 44, height: 44, borderRadius: 12, overflow: "hidden", position: "relative" }}>
            <div ref={ytDivRef} style={{ position: "absolute", inset: 0, width: 44, height: 44, display: fullId ? "block" : "none" }} />
            {!fullId && (coverUrl ? (
              <img src={coverUrl} alt={currentSong.title} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", boxShadow: `0 4px 12px ${currentSong.color}40` }} />
            ) : (
              <CoverArt seed={currentSong.title} color={currentSong.color} size={44} radius={12} />
            ))}
          </div>

          {/* Info */}
          <div onClick={() => setExpanded(true)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#EDF4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentSong.title}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentSong.artist}</span>
              {fullId && <span style={{ flexShrink: 0, fontSize: 8.5, fontWeight: 900, letterSpacing: "0.06em", padding: "2px 5px", borderRadius: 5, background: "#FF000022", color: "#FF6B6B", border: "1px solid #FF000044" }}>FULL SONG</span>}
              {!fullId && fullAvail && (
                <button onClick={(e) => { e.stopPropagation(); enterFull(fullAvail); }} style={{ flexShrink: 0, fontSize: 8.5, fontWeight: 900, letterSpacing: "0.06em", padding: "2px 5px", borderRadius: 5, background: "#FF000022", color: "#FF6B6B", border: "1px solid #FF000044" }}>▶ FULL</button>
              )}
            </div>
          </div>

          {/* Favorite */}
          <button className="pressable" onClick={() => { const id = (currentSong as any).id; toggleFavorite(id); showToast(favorites.includes(id) ? "Removed from favorites" : "Added to favorites ♡"); }} style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: favorites.includes((currentSong as any).id) ? "#2DD4BF" : "var(--t2)" }}>{favorites.includes((currentSong as any).id) ? "♥" : "♡"}</button>

          {/* Speed badge */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowSpeed(!showSpeed)} style={{ fontSize: 10, fontWeight: 800, padding: "5px 8px", borderRadius: 8, background: playbackSpeed !== 1 ? "rgba(56, 189, 248,0.15)" : "var(--surf)", border: playbackSpeed !== 1 ? "1px solid rgba(56, 189, 248,0.3)" : "1px solid var(--bd)", color: playbackSpeed !== 1 ? "#67E8F9" : "var(--t3)" }}>{playbackSpeed}x</button>
            {showSpeed && (
              <div style={{ position: "absolute", bottom: 38, right: 0, background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 8, display: "flex", flexDirection: "column", gap: 3, minWidth: 64, zIndex: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => { setPlaybackSpeed(s); setShowSpeed(false); }} style={{ padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 800, background: playbackSpeed === s ? "linear-gradient(135deg,#38BDF8,#4F46E5)" : "transparent", color: playbackSpeed === s ? "#fff" : "var(--t2)" }}>{s}x</button>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <button className="pressable" onClick={prevSong} style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--t2)" }}>⏮</button>
          <button className="pressable" onClick={togglePlay} style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: "linear-gradient(135deg,#38BDF8,#4F46E5)", boxShadow: "0 4px 16px rgba(56, 189, 248,0.4)" }}>{isPlaying ? "⏸" : "▶"}</button>
          <button className="pressable" onClick={nextSong} style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--t2)" }}>⏭</button>
        </div>
      </div>
    </>
  );
}
