import { useAppStore } from "../store/appStore";
import { CoverArt } from "../components/CoverArt";
import { SONGS } from "../data/mock";

export function DownloadsPage() {
  const { setPage, playSong, currentSong, isPlaying, downloads, toggleDownload, clearDownloads, showToast } = useAppStore();

  const dlSongs = downloads.map((id) => SONGS.find((s: any) => s.id === id)).filter(Boolean) as typeof SONGS;

  return (
    <div className="page">
      {/* Header */}
      <header className="glass-dk sticky top-0 z-40" style={{ borderRadius: 0 }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: 13, background: "linear-gradient(135deg,#22D3A5,#0EA5E9 55%,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>⬇</div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15.5, fontWeight: 700, color: "#EAF2FF" }}>Downloads</div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(34,211,165,0.85)" }}>Play Offline, Anywhere</div>
            </div>
          </div>
          {dlSongs.length > 0 && (
            <button onClick={() => { clearDownloads(); showToast("Offline library cleared"); }} className="pressable" style={{ fontSize: 11, fontWeight: 800, padding: "7px 12px", borderRadius: 100, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#FB7185" }}>Clear all</button>
          )}
        </div>
      </header>

      {/* Info banner */}
      <div className="px-4" style={{ paddingTop: 14 }}>
        <div className="glow-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(34,211,165,0.12)", border: "1px solid rgba(34,211,165,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📶</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#EDF4FF" }}>{dlSongs.length} track{dlSongs.length === 1 ? "" : "s"} saved offline</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>Saved tracks stay available even with no network.</div>
          </div>
        </div>
      </div>

      {/* Downloads list */}
      <div className="px-4" style={{ paddingTop: 18 }}>
        <div className="sec-hd"><span className="sec-title">⬇ Saved offline</span></div>
        {dlSongs.length === 0 ? (
          <div className="glow-card" style={{ padding: "26px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 30 }}>📥</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--t2)", marginTop: 8 }}>No offline tracks yet</div>
            <div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 4, lineHeight: 1.5 }}>Save songs from Discover and they'll appear here for offline play.</div>
            <button onClick={() => setPage("discover")} className="pressable btn-grad" style={{ marginTop: 14, borderRadius: 12, padding: "10px 18px", fontSize: 12, fontWeight: 800 }}>Browse Discover</button>
          </div>
        ) : (
          <>
            {dlSongs.map((s: any) => {
              const active = currentSong?.id === s.id && isPlaying;
              return (
                <div key={s.id} className="card-hover flex items-center" style={{ gap: 12, padding: "10px 12px", borderRadius: 14, marginBottom: 8 }} onClick={() => playSong(s as any)}>
                  {s.coverUrl ? (
                    <img src={s.coverUrl} alt={s.title} style={{ width: 46, height: 46, borderRadius: 12, objectFit: "cover", boxShadow: `0 4px 12px ${s.color}40` }} />
                  ) : (
                    <CoverArt seed={s.title} color={s.color} size={46} radius={12} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: active ? "#22D3A5" : "#EDF4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{s.artist} · {s.duration}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#22D3A5", background: "rgba(34,211,165,0.12)", border: "1px solid rgba(34,211,165,0.3)", borderRadius: 100, padding: "3px 8px", flexShrink: 0 }}>OFFLINE</span>
                  <button className="pressable" onClick={(e) => { e.stopPropagation(); toggleDownload(s.id); }} style={{ fontSize: 14, color: "var(--t3)", padding: 4 }}>✕</button>
                </div>
              );
            })}
            <button onClick={() => playSong(dlSongs[0] as any)} className="pressable btn-grad" style={{ width: "100%", borderRadius: 14, padding: "12px 0", fontSize: 12.5, fontWeight: 800, marginTop: 6 }}>▶ Play all offline</button>
          </>
        )}
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
