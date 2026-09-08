import { useState } from "react";
import { useAppStore } from "../store/appStore";
import { CoverArt } from "../components/CoverArt";
import { SONGS, ARTISTS, GENRES } from "../data/mock";

export function DiscoverPage() {
  const { searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, playSong, currentSong, isPlaying, setPage, openUpload } = useAppStore();
  const [tab, setTab] = useState<"songs" | "artists">("songs");

  const q = searchQuery.trim().toLowerCase();
  let songs = SONGS;
  if (q) songs = songs.filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q));
  if (selectedGenre) songs = songs.filter((s) => s.genre === selectedGenre);

  let artists = ARTISTS;
  if (q) artists = artists.filter((a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q));
  if (selectedGenre) artists = artists.filter((a) => a.genre === selectedGenre);

  return (
    <div className="page">
      <div className="glass-dk sticky top-0 z-40" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", borderRadius: 0 }}>
        <div className="px-4 py-3">
          <div style={{ fontSize: 16, fontWeight: 900, color: "#F0F0FF", marginBottom: 10 }}>Discover</div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, genres…"
            style={{ width: "100%", boxSizing: "border-box", background: "var(--surf)", border: "1.5px solid var(--bd)", borderRadius: 13, padding: "11px 14px", fontSize: 13.5, color: "#fff", outline: "none" }}
          />
        </div>
      </div>

      {/* Genre pills */}
      <div style={{ padding: "14px 16px 6px" }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ paddingBottom: 4 }}>
          {GENRES.map((g) => {
            const active = selectedGenre === (g.name === "All" ? null : g.name);
            return (
              <button key={g.name} onClick={() => setSelectedGenre(g.name === "All" ? null : g.name)} className="pill pressable" style={{ background: active ? `${g.color}30` : `${g.color}14`, borderColor: active ? `${g.color}70` : `${g.color}35`, color: g.color, fontWeight: active ? 900 : 700 }}>
                <span style={{ fontSize: 14 }}>{g.icon}</span><span>{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4" style={{ paddingTop: 8 }}>
        <div style={{ display: "inline-flex", background: "var(--surf)", border: "1px solid var(--bd)", borderRadius: 100, padding: 3 }}>
          {(["songs", "artists"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="pressable" style={{ padding: "7px 18px", borderRadius: 100, fontSize: 12, fontWeight: 800, background: tab === t ? "linear-gradient(135deg,#9B6DFF,#FF6BA8)" : "transparent", color: tab === t ? "#fff" : "var(--t2)", border: "none" }}>
              {t === "songs" ? "Songs" : "Artists"}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {tab === "songs" ? (
        <section style={{ padding: "16px 16px 8px" }}>
          {songs.length === 0 ? (
            <EmptyState text="No songs match your search." actionLabel="Upload your music" action={() => openUpload("song")} />
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
              {songs.map((s) => {
                const active = currentSong?.id === s.id && isPlaying;
                return (
                  <div key={s.id} className="card-hover" onClick={() => playSong(s as any)}>
                    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 10, boxShadow: `0 8px 24px ${s.color}28` }}>
                      <CoverArt seed={s.seed} color={s.color} size={160} radius={0} imageUrl={s.coverUrl} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 8 }}>
                        <div className="play-btn" style={{ background: active ? "rgba(155,109,255,0.85)" : "rgba(0,0,0,0.55)" }}>{active ? "❚❚" : "▶"}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: active ? "#C4A1FF" : "#F0F0FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 10.5, color: "var(--t2)", marginTop: 2 }}>{s.artist}</div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section style={{ padding: "16px 16px 8px" }}>
          {artists.length === 0 ? (
            <EmptyState text="No artists match your search." actionLabel="Become an artist" action={() => setPage("artist")} />
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
              {artists.map((a) => (
                <div key={a.id} className="card-hover" onClick={() => setPage("artist")}>
                  <div style={{ width: "100%", aspectRatio: "1", borderRadius: 20, overflow: "hidden", marginBottom: 10, boxShadow: `0 8px 24px ${a.color}28`, border: `2px solid ${a.color}25` }}>
                    <CoverArt seed={a.name} color={a.color} size={220} radius={0} imageUrl={a.imageUrl} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#F0F0FF", textAlign: "center" }}>{a.name}</div>
                  <div style={{ fontSize: 10.5, color: a.color, textAlign: "center", fontWeight: 700, marginTop: 2 }}>{a.genre} · {a.followers} fans</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function EmptyState({ text, actionLabel, action }: { text: string; actionLabel: string; action: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t2)", marginBottom: 16 }}>{text}</div>
      <button onClick={action} className="pressable" style={{ background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 100, padding: "10px 22px", fontSize: 12.5, fontWeight: 900, color: "#fff", border: "none" }}>{actionLabel}</button>
    </div>
  );
}
