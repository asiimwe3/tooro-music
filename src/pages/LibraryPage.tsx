import { useAppStore } from "../store/appStore";
import { CoverArt } from "../components/CoverArt";
import { SONGS, PLAYLISTS } from "../data/mock";

function toSec(t: string) { const [m, s] = (t || "0:00").split(":").map(Number); return (m || 0) * 60 + (s || 0); }
function fmtTime(sec: number) { return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`; }

export function LibraryPage() {
  const { setPage, playSong, currentSong, isPlaying, favorites, toggleFavorite, recentIds, downloads } = useAppStore();

  const favSongs = SONGS.filter((s: any) => favorites.includes(s.id));
  const recentSongs = recentIds.map((id) => SONGS.find((s: any) => s.id === id)).filter(Boolean) as typeof SONGS;
  const dlCount = downloads.length;

  return (
    <div className="page">
      {/* Header */}
      <header className="glass-dk sticky top-0 z-40" style={{ borderRadius: 0 }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: 13, background: "linear-gradient(135deg,#F472B6,#D946EF 55%,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>🎧</div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15.5, fontWeight: 700, color: "#F4F1FF" }}>My Library</div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(244,114,182,0.8)" }}>Your Music, Your Way</div>
            </div>
          </div>
          <button onClick={() => setPage("downloads")} className="pressable" style={{ fontSize: 11, fontWeight: 800, padding: "7px 12px", borderRadius: 100, background: "rgba(155,109,255,0.14)", border: "1px solid rgba(155,109,255,0.35)", color: "#C4A1FF" }}>⬇ {dlCount} offline</button>
        </div>
      </header>

      {/* Stats strip */}
      <div className="px-4 grid grid-cols-3 gap-2" style={{ paddingTop: 14 }}>
        {[
          { n: favorites.length, l: "Favorites", c: "#FF6BA8" },
          { n: recentSongs.length, l: "Recently played", c: "#9B6DFF" },
          { n: dlCount, l: "Saved offline", c: "#22D3A5" },
        ].map((s) => (
          <div key={s.l} className="glow-card" style={{ padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: s.c }}>{s.n}</div>
            <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--t3)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Favorites */}
      <div className="px-4" style={{ paddingTop: 18 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span className="sec-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>♡ Favorites</span>
          {favSongs.length > 0 && (
            <button onClick={() => playSong(favSongs[0] as any)} className="pressable btn-grad" style={{ borderRadius: 100, padding: "8px 14px", fontSize: 11, fontWeight: 800 }}>▶ Play all</button>
          )}
        </div>
        {favSongs.length === 0 ? (
          <div className="glow-card" style={{ padding: "22px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>💜</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--t2)", marginTop: 6 }}>No favorites yet</div>
            <div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 4, lineHeight: 1.5 }}>Tap the ♡ on any playing song to save it here.</div>
            <button onClick={() => setPage("discover")} className="pressable btn-grad" style={{ marginTop: 12, borderRadius: 12, padding: "10px 18px", fontSize: 12, fontWeight: 800 }}>Discover music</button>
          </div>
        ) : (
          favSongs.map((s: any) => {
            const active = currentSong?.id === s.id && isPlaying;
            return (
              <div key={s.id} className="card-hover flex items-center" style={{ gap: 12, padding: "10px 12px", borderRadius: 14, marginBottom: 8 }} onClick={() => playSong(s as any)}>
                {s.coverUrl ? (
                  <img src={s.coverUrl} alt={s.title} style={{ width: 46, height: 46, borderRadius: 12, objectFit: "cover", boxShadow: `0 4px 12px ${s.color}40` }} />
                ) : (
                  <CoverArt seed={s.title} color={s.color} size={46} radius={12} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: active ? "#C4A1FF" : "#F0F0FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{s.artist} · {s.genre}</div>
                </div>
                <span style={{ fontSize: 10.5, color: "var(--t3)" }}>{fmtTime(toSec(s.duration))}</span>
                <button className="pressable" onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} style={{ fontSize: 15, color: "#FF6BA8", padding: 4 }}>♥</button>
              </div>
            );
          })
        )}
      </div>

      {/* Recently played */}
      {recentSongs.length > 0 && (
        <div className="px-4" style={{ paddingTop: 18 }}>
          <div className="sec-hd"><span className="sec-title">🕘 Recently played</span></div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none" style={{ paddingBottom: 8 }}>
            {recentSongs.map((s: any) => (
              <div key={s.id} className="card-hover flex-shrink-0" style={{ width: 104 }} onClick={() => playSong(s as any)}>
                {s.coverUrl ? (
                  <img src={s.coverUrl} alt={s.title} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 12, boxShadow: `0 6px 16px ${s.color}35` }} />
                ) : (
                  <CoverArt seed={s.title} color={s.color} size={104} radius={12} />
                )}
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#F0F0FF", marginTop: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{s.artist}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists */}
      <div className="px-4" style={{ paddingTop: 18 }}>
        <div className="sec-hd"><span className="sec-title">☰ My playlists</span></div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none" style={{ paddingBottom: 8 }}>
          {PLAYLISTS.slice(0, 6).map((pl: any) => (
            <div key={pl.id} className="card-hover flex-shrink-0" style={{ width: 150, position: "relative", marginBottom: 14 }}>
              <div style={{ width: 150, height: 172, borderRadius: 20, overflow: "hidden", position: "relative", boxShadow: `0 10px 28px ${pl.color}35` }}>
                <CoverArt seed={pl.seed} color={pl.color} size={150} radius={0} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(6,4,12,0.55) 75%, rgba(6,4,12,0.92) 100%)" }} />
                <div style={{ position: "absolute", left: 12, bottom: 12, right: 12 }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13.5, fontWeight: 700, color: "#fff", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pl.name}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>♫ {pl.count} tracks</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
