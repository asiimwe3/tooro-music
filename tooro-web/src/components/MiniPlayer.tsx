import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/appStore";
import { CoverArt } from "./CoverArt";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, setProgress, playbackSpeed, setPlaybackSpeed } = useAppStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);

  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    a.volume = volume;
    a.crossOrigin = "anonymous";
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
    // Use real Deezer preview URL directly from song data
    const url = (currentSong as any).audioUrl || "";
    audioRef.current.src = url;
    audioRef.current.load();
    audioRef.current.playbackRate = playbackSpeed;
    if (isPlaying) audioRef.current.play().catch(() => {});
  }, [currentSong]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {}); else audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = playbackSpeed; }, [playbackSpeed]);

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
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
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#07070F", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Ambient BG */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 30%,${currentSong.color}20,transparent 70%)`, pointerEvents: "none" }} />

          {/* Handle */}
          <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
          </div>

          {/* Top row */}
          <div className="flex items-center justify-between px-5 py-3">
            <button onClick={() => setExpanded(false)} style={{ width: 36, height: 36, borderRadius: 11, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--t2)" }}>↓</button>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "var(--t2)" }}>NOW PLAYING</div>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--t2)" }}>⋯</button>
          </div>

          {/* Cover — real album art */}
          <div className="flex justify-center px-8" style={{ marginTop: 8, marginBottom: 24 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 260, height: 260, borderRadius: 28, overflow: "hidden", boxShadow: `0 32px 80px ${currentSong.color}40, 0 8px 24px rgba(0,0,0,0.6)` }}>
                {coverUrl ? (
                  <img src={coverUrl} alt={currentSong.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <CoverArt seed={currentSong.title} color={currentSong.color} size={260} radius={0} />
                )}
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
              <div style={{ fontSize: 22, fontWeight: 900, color: "#F0F0FF", letterSpacing: "-0.02em" }}>{currentSong.title}</div>
              <div style={{ fontSize: 14, color: "var(--t2)", marginTop: 3 }}>{currentSong.artist} · {currentSong.genre}</div>
            </div>
            <button style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--t3)" }}>♡</button>
          </div>

          {/* Progress */}
          <div className="px-6 mb-2">
            <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 100, cursor: "pointer", position: "relative", marginBottom: 8 }} onClick={seek}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,#9B6DFF,#FF6BA8)`, borderRadius: 100, transition: "width 0.1s linear" }} />
              <div style={{ position: "absolute", top: "50%", left: `${progress}%`, transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", transition: "left 0.1s linear" }} />
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{fmt(currentTime)}</span>
              <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-8 mb-5">
            <button className="pressable" onClick={prevSong} style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--t2)" }}>⏮</button>
            <button className="pressable" onClick={togglePlay} style={{ width: 68, height: 68, borderRadius: "50%", background: `linear-gradient(135deg,#9B6DFF,#5B21B6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 28px rgba(155,109,255,0.45)" }}>{isPlaying ? "⏸" : "▶"}</button>
            <button className="pressable" onClick={nextSong} style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--t2)" }}>⏭</button>
          </div>

          {/* Speed + Volume */}
          <div className="px-6 flex flex-col gap-5">
            <div>
              <div className="label mb-2">Playback Speed</div>
              <div className="flex gap-2">
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => setPlaybackSpeed(s)} style={{ flex: 1, padding: "9px 4px", borderRadius: 11, fontSize: 12, fontWeight: 800, background: playbackSpeed === s ? "linear-gradient(135deg,#9B6DFF,#5B21B6)" : "var(--surf)", border: playbackSpeed === s ? "none" : "1px solid var(--bd)", color: playbackSpeed === s ? "#fff" : "var(--t3)", boxShadow: playbackSpeed === s ? "0 4px 12px rgba(155,109,255,0.3)" : "none" }}>{s}x</button>
                ))}
              </div>
            </div>
            <div>
              <div className="label mb-2">🔊 Volume</div>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }} style={{ width: "100%", accentColor: "#9B6DFF" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mini Player Bar ──────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 58, left: 8, right: 8, zIndex: 90,
        borderRadius: 22, overflow: "hidden",
        background: "rgba(13,13,24,0.96)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        {/* Progress line */}
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)", cursor: "pointer" }} onClick={seek}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#9B6DFF,#FF6BA8)", transition: "width 0.1s linear" }} />
        </div>

        <div className="flex items-center gap-3" style={{ padding: "10px 12px 12px" }}>
          {/* Cover — real art */}
          <div onClick={() => setExpanded(true)} style={{ cursor: "pointer", flexShrink: 0 }}>
            {coverUrl ? (
              <img src={coverUrl} alt={currentSong.title} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", boxShadow: `0 4px 12px ${currentSong.color}40` }} />
            ) : (
              <CoverArt seed={currentSong.title} color={currentSong.color} size={44} radius={12} />
            )}
          </div>

          {/* Info */}
          <div onClick={() => setExpanded(true)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#F0F0FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentSong.title}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 1 }}>{currentSong.artist}</div>
          </div>

          {/* Speed badge */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowSpeed(!showSpeed)} style={{ fontSize: 10, fontWeight: 800, padding: "5px 8px", borderRadius: 8, background: playbackSpeed !== 1 ? "rgba(155,109,255,0.15)" : "var(--surf)", border: playbackSpeed !== 1 ? "1px solid rgba(155,109,255,0.3)" : "1px solid var(--bd)", color: playbackSpeed !== 1 ? "#C4A1FF" : "var(--t3)" }}>{playbackSpeed}x</button>
            {showSpeed && (
              <div style={{ position: "absolute", bottom: 38, right: 0, background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 8, display: "flex", flexDirection: "column", gap: 3, minWidth: 64, zIndex: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => { setPlaybackSpeed(s); setShowSpeed(false); }} style={{ padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 800, background: playbackSpeed === s ? "linear-gradient(135deg,#9B6DFF,#5B21B6)" : "transparent", color: playbackSpeed === s ? "#fff" : "var(--t2)" }}>{s}x</button>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <button className="pressable" onClick={prevSong} style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--t2)" }}>⏮</button>
          <button className="pressable" onClick={togglePlay} style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: "linear-gradient(135deg,#9B6DFF,#5B21B6)", boxShadow: "0 4px 16px rgba(155,109,255,0.4)" }}>{isPlaying ? "⏸" : "▶"}</button>
          <button className="pressable" onClick={nextSong} style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surf)", border: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--t2)" }}>⏭</button>
        </div>
      </div>
    </>
  );
}
