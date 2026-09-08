import { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import { CoverArt } from "../components/CoverArt";
import { SONGS as MOCK_SONGS, ARTISTS as MOCK_ARTISTS, GENRES, PLAYLISTS } from "../data/mock";
import { fetchAll, RealArtist, RealSong } from "../api/musicApi";

// Merge real data with mock shape
function mergeArtist(r: RealArtist) {
  return { id: r.artistId || r.id, name: r.name, genre: r.genre, followers: r.followers, verified: r.verified, seed: r.name.replace(/\s/g,""), color: r.color, songs: r.songs, monthlyListeners: r.monthlyListeners, imageUrl: r.imageUrl, bio: r.bio, location: r.location };
}
function mergeSong(r: RealSong) {
  return { id: r.songId || r.id, title: r.title, artist: r.artist, artistId: r.artistId, genre: r.genre, duration: r.duration, plays: r.plays, audioUrl: r.audioUrl, seed: r.songId || r.id, color: r.color };
}

// "1:16" -> 76 seconds
function toSec(t: string) { const [m,s] = (t||"0:00").split(":").map(Number); return (m||0)*60 + (s||0); }
function fmtSec(s: number) { s = Math.max(0, Math.floor(s)); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }

const QUICK_ACTIONS = [
  { key: "discover",  label: "Discover",  sub: "New Music",  icon: "🎵", grad: "linear-gradient(135deg,#8B5CF6,#6D28D9)" },
  { key: "trending",  label: "Trending",  sub: "Hot Now",    icon: "🔥", grad: "linear-gradient(135deg,#34D399,#059669)" },
  { key: "favorites", label: "Favorites", sub: "Your Library", icon: "♡", grad: "linear-gradient(135deg,#FBBF24,#EA580C)" },
  { key: "offline",   label: "Offline",   sub: "Save Music", icon: "⬇", grad: "linear-gradient(135deg,#38BDF8,#2563EB)" },
  { key: "playlists", label: "Playlists", sub: "Your Mixes", icon: "☰", grad: "linear-gradient(135deg,#F472B6,#C026D3)" },
] as const;

export function HomePage() {
  const {
    playSong, currentSong, isPlaying, progress, setPage, setSelectedGenre,
    openUpload, setSideMenuOpen, user, setAuthModal, showToast,
  } = useAppStore();

  const [artists, setArtists] = useState(MOCK_ARTISTS.map(a => ({ ...a, imageUrl: "", bio: "", location: "" })));
  const [songs, setSongs] = useState(MOCK_SONGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchAll().then(({ artists: ra, songs: rs }) => {
      if (ra.length > 0) setArtists(ra.map(mergeArtist) as any);
      if (rs.length > 0) setSongs(rs.map(mergeSong) as any);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const heroSong: any = currentSong || songs[0];
  const heroActive = !!currentSong && isPlaying;
  const heroDurSec = toSec(heroSong?.duration || "0:00");
  const heroElapsed = heroActive ? (progress / 100) * heroDurSec : 0;
  const recentlyPlayed = songs.slice().reverse().slice(0, 4);

  function handleQuickAction(key: string) {
    if (key === "discover") setPage("discover");
    else if (key === "trending") setPage("trending");
    else if (key === "playlists") { const el = document.getElementById("top-playlists"); el?.scrollIntoView({ behavior: "smooth", block: "start" }); }
    else if (key === "favorites") showToast("Favorites — coming soon 💜");
    else if (key === "offline") showToast("Offline downloads — coming soon ⬇");
  }

  return (
    <div className="hero-bg">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="glass-dk sticky top-0 z-40" style={{ borderRadius:0 }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div style={{ width:38, height:38, borderRadius:13, background:"linear-gradient(135deg,#8B5CF6,#D946EF 55%,#F472B6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 6px 18px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.3)", flexShrink:0, border:"1px solid rgba(255,255,255,0.15)" }}>🎵</div>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15.5, fontWeight:700, letterSpacing:"-0.01em", color:"#F4F1FF" }}>Tooro <span style={{ color:"#C4B5FD" }}>Music</span></div>
              <div style={{ fontSize:8, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(167,139,250,0.7)" }}>Western Uganda</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage("discover")} className="pressable" style={{ width:36, height:36, borderRadius:"50%", background:"var(--surf)", border:"1.5px solid var(--bd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"var(--t2)" }}>◎</button>
            <button onClick={() => showToast("You're all caught up 🔔")} className="pressable" style={{ width:36, height:36, borderRadius:"50%", background:"var(--surf)", border:"1.5px solid var(--bd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"var(--t2)", position:"relative" }}>
              🔔
              <span style={{ position:"absolute", top:7, right:8, width:7, height:7, borderRadius:"50%", background:"#F43F5E", border:"1.5px solid #0A0814" }} />
            </button>
            {user ? (
              <button onClick={() => setSideMenuOpen(true)} className="pressable" style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#F472B6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff", boxShadow:"0 4px 12px rgba(139,92,246,0.4)", border:"2px solid rgba(196,181,253,0.5)" }}>
                {user.displayName?.charAt(0)?.toUpperCase() || "U"}
              </button>
            ) : (
              <button onClick={() => setAuthModal("login")} className="pressable" style={{ width:36, height:36, borderRadius:"50%", background:"var(--surf)", border:"2px solid rgba(196,181,253,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"var(--t2)" }}>👤</button>
            )}
          </div>
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.4),rgba(244,114,182,0.4),transparent)" }} />
      </header>

      {/* ── Now Playing Hero Card ────────────────────────────────────────── */}
      {heroSong && (
        <div className="px-4 pt-5 pb-2">
          <div className="glow-card" style={{ padding:16, display:"flex", gap:14 }}>
            <div onClick={() => playSong(heroSong)} className="pressable" style={{ position:"relative", flexShrink:0, cursor:"pointer" }}>
              <div style={{ borderRadius:16, overflow:"hidden", boxShadow:`0 10px 26px ${heroSong.color}45` }}>
                <CoverArt seed={heroSong.seed} color={heroSong.color} size={92} radius={0} imageUrl={heroSong.imageUrl} />
              </div>
              <div style={{ position:"absolute", inset:0, borderRadius:16, background:"rgba(8,6,16,0.28)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.16)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", backdropFilter:"blur(4px)" }}>
                  {heroActive ? "⏸" : "▶"}
                </div>
              </div>
            </div>
            <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <div className="flex items-center justify-between" style={{ marginBottom:8 }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"linear-gradient(100deg,rgba(139,92,246,0.35),rgba(217,70,239,0.25))", border:"1px solid rgba(196,181,253,0.35)", borderRadius:100, padding:"3px 10px", fontSize:9.5, fontWeight:800, color:"#E9D5FF", letterSpacing:"0.04em" }}>
                  {heroActive && <span style={{ display:"flex", gap:1.5, alignItems:"flex-end", height:8 }}>{[1,2,3].map(i=><span key={i} className="wave-bar" style={{ height:[5,8,4][i-1], animationDelay:`${(i-1)*0.15}s` }} />)}</span>}
                  {heroActive ? "NOW PLAYING" : "PLAY NOW"}
                </span>
                <div className="flex items-center gap-2" style={{ color:"var(--t3)", fontSize:10.5, fontWeight:700 }}>
                  <span>🎧 {heroSong.plays}</span>
                  <span style={{ fontSize:14, cursor:"pointer" }}>⋮</span>
                </div>
              </div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:"#F4F1FF", letterSpacing:"-0.01em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{heroSong.title}</div>
              <div style={{ fontSize:11.5, color:"var(--t2)", marginTop:2, marginBottom:9, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{heroSong.artist} · {heroSong.genre}</div>
              <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:100, position:"relative", marginBottom:5 }}>
                <div style={{ height:"100%", width:`${heroActive ? progress : 0}%`, background:"linear-gradient(90deg,#8B5CF6,#F472B6)", borderRadius:100 }} />
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize:9.5, color:"var(--t3)", fontWeight:700 }}>{fmtSec(heroElapsed)}</span>
                <span style={{ fontSize:9.5, color:"var(--t3)", fontWeight:700 }}>{heroSong.duration}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions Grid ───────────────────────────────────────────── */}
      <div className="px-4" style={{ paddingTop:18, paddingBottom:6 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.key} onClick={() => handleQuickAction(a.key)} className="pressable" style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:0 }}>
              <div style={{ width:48, height:48, borderRadius:16, background:a.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#fff", boxShadow:"0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)" }}>{a.icon}</div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:10.5, fontWeight:800, color:"#F0F0FF" }}>{a.label}</div>
                <div style={{ fontSize:8, color:"var(--t3)", fontWeight:600, marginTop:1 }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Playlists ────────────────────────────────────────────────── */}
      <section id="top-playlists" style={{ padding:"26px 0 4px" }}>
        <div className="sec-hd px-4">
          <span className="sec-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:3, height:15, borderRadius:2, background:"linear-gradient(180deg,#8B5CF6,#F472B6)", display:"inline-block" }} />
            Top Playlists
          </span>
          <button className="sec-link pressable">See All →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none" style={{ paddingLeft:16, paddingRight:16, paddingBottom:10 }}>
          {PLAYLISTS.map((pl) => (
            <div key={pl.id} className="card-hover flex-shrink-0" style={{ width:150, position:"relative", marginBottom:14 }}>
              <div style={{ width:150, height:172, borderRadius:20, overflow:"hidden", position:"relative", boxShadow:`0 10px 28px ${pl.color}35` }}>
                <CoverArt seed={pl.seed} color={pl.color} size={150} radius={0} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 40%, rgba(6,4,12,0.55) 75%, rgba(6,4,12,0.92) 100%)" }} />
                <div style={{ position:"absolute", top:10, right:10, width:26, height:26, borderRadius:"50%", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
                  <span style={{ display:"flex", gap:1.5, alignItems:"center", height:10 }}>{[1,2,3].map(i=><span key={i} style={{ width:2, borderRadius:1, background:"#fff", height:[5,9,6][i-1], display:"block" }} />)}</span>
                </div>
                <div style={{ position:"absolute", left:12, bottom:12, right:12 }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13.5, fontWeight:700, color:"#fff", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pl.name}</div>
                  <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.65)", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>♫ {pl.count} tracks</div>
                </div>
              </div>
              <button onClick={() => setPage("discover")} className="pressable" style={{ position:"absolute", bottom:-14, right:12, width:36, height:36, borderRadius:"50%", background:"conic-gradient(from 210deg,#8B5CF6,#D946EF,#F472B6,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", boxShadow:"0 6px 16px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.3)", border:"2.5px solid #0A0814" }}>▶</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Go Premium Banner ────────────────────────────────────────────── */}
      <div className="px-4" style={{ paddingTop:10, paddingBottom:4 }}>
        <div className="glow-card pressable" onClick={() => setPage("premium")} style={{ padding:"18px 18px", display:"flex", alignItems:"center", gap:14, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", top:"-60%", left:"-10%", width:"70%", height:"200%", background:"radial-gradient(circle, rgba(251,191,36,0.14), transparent 70%)", pointerEvents:"none" }} />
          <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#FBBF24,#EA580C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, boxShadow:"0 8px 20px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.35)" }}>👑</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:8.5, fontWeight:800, letterSpacing:"0.14em", color:"#FBBF24", marginBottom:3 }}>UPGRADE TO</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:700, color:"#F4F1FF", marginBottom:4, letterSpacing:"-0.01em" }}>Go Premium</div>
            <div style={{ fontSize:10, color:"var(--t2)", fontWeight:600, lineHeight:1.4 }}>Ad-free · Offline · 320kbps quality<br/>+ Exclusive content</div>
          </div>
          <button className="pressable btn-grad" style={{ borderRadius:100, padding:"9px 15px", fontSize:11.5, fontWeight:800, flexShrink:0, display:"flex", alignItems:"center", gap:4 }}>Go Premium <span>›</span></button>
        </div>
      </div>

      {/* ── Recently Played ──────────────────────────────────────────────── */}
      <section style={{ padding:"22px 0 4px" }}>
        <div className="sec-hd px-4">
          <span className="sec-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:3, height:15, borderRadius:2, background:"linear-gradient(180deg,#8B5CF6,#F472B6)", display:"inline-block" }} />
            Recently Played
          </span>
          <button className="sec-link pressable" onClick={() => setPage("trending")}>See All →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none" style={{ paddingLeft:16, paddingRight:16, paddingBottom:8 }}>
          {recentlyPlayed.map((s: any) => {
            const active = currentSong?.id===s.id && isPlaying;
            return (
              <div key={s.id} className="card-hover flex-shrink-0" style={{ width:104 }} onClick={() => playSong(s)}>
                <div style={{ position:"relative", marginBottom:8 }}>
                  <div style={{ borderRadius:16, overflow:"hidden", boxShadow:`0 8px 20px ${s.color}30` }}>
                    <CoverArt seed={s.seed} color={s.color} size={104} radius={0} />
                  </div>
                  <div style={{ position:"absolute", top:6, right:6, width:20, height:20, borderRadius:"50%", background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", backdropFilter:"blur(4px)" }}>⋮</div>
                  {active && (
                    <div style={{ position:"absolute", inset:0, borderRadius:16, background:"rgba(139,92,246,0.28)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ display:"flex", gap:2, alignItems:"center", height:14 }}>{[1,2,3,4].map(i=><span key={i} className="wave-bar" style={{ height:[10,14,8,12][i-1], animationDelay:`${(i-1)*0.12}s` }} />)}</div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize:11.5, fontWeight:800, color:"#F0F0FF", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                <div style={{ fontSize:9.5, color:"var(--t3)", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.artist}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Genre Pills ─────────────────────────────────────────────────── */}
      <div style={{ padding:"18px 0 4px" }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ paddingLeft:16, paddingRight:16, paddingBottom:4 }}>
          {GENRES.map((g) => (
            <button key={g.name} onClick={() => { setSelectedGenre(g.name==="All"?null:g.name); setPage("discover"); }} className="pill pressable" style={{ background:`linear-gradient(100deg,${g.color}22,${g.color}10)`, borderColor:`${g.color}45`, color:g.color }}>
              <span style={{ fontSize:14 }}>{g.icon}</span><span>{g.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured Artists ─────────────────────────────────────────────── */}
      <section style={{ padding:"24px 0 4px" }}>
        <div className="sec-hd px-4">
          <span className="sec-title">Featured Artists</span>
          <button className="sec-link pressable" onClick={() => setPage("discover")}>See all →</button>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-none" style={{ paddingLeft:16, paddingRight:16, paddingBottom:8 }}>
          {artists.map((a: any) => (
            <div key={a.id} className="card-hover flex-shrink-0" style={{ width:108 }} onClick={() => setPage("artist")}>
              <div style={{ position:"relative", marginBottom:10 }}>
                <div style={{ width:108, height:108, borderRadius:24, overflow:"hidden", boxShadow:`0 12px 30px ${a.color}45`, border:`2px solid ${a.color}40` }}>
                  <CoverArt seed={a.seed || a.name} color={a.color} size={108} radius={0} imageUrl={a.imageUrl} />
                </div>
                {a.verified && (
                  <div style={{ position:"absolute", bottom:4, right:4, width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${a.color},${a.color}BB)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, border:"2px solid var(--bg)", boxShadow:`0 2px 8px ${a.color}50` }}>✓</div>
                )}
              </div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:"#F4F1FF", textAlign:"center", marginBottom:2 }}>{a.name}</div>
              <div style={{ fontSize:10, color:"var(--t3)", textAlign:"center", fontWeight:600 }}>{a.genre}</div>
              <div style={{ fontSize:10, color:a.color, textAlign:"center", fontWeight:800, marginTop:4 }}>{a.followers}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hot Right Now ────────────────────────────────────────────────── */}
      <section style={{ padding:"24px 0 4px" }}>
        <div className="sec-hd px-4">
          <span className="sec-title">🔥 Hot Right Now</span>
          <button className="sec-link pressable" onClick={() => setPage("trending")}>Charts →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none" style={{ paddingLeft:16, paddingRight:16, paddingBottom:8 }}>
          {songs.slice(0,7).map((s: any) => {
            const active = currentSong?.id===s.id && isPlaying;
            return (
              <div key={s.id} className="card-hover flex-shrink-0" style={{ width:148 }} onClick={() => playSong(s)}>
                <div style={{ position:"relative", marginBottom:10 }}>
                  <div style={{ borderRadius:20, overflow:"hidden", boxShadow:`0 8px 24px ${s.color}30` }}>
                    <CoverArt seed={s.seed} color={s.color} size={148} radius={0} />
                  </div>
                  <div style={{ position:"absolute", inset:0, borderRadius:20, background:active?"rgba(155,109,255,0.25)":"transparent", display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:10, transition:"all 0.2s" }}>
                    <div className="play-btn" style={{ background:active?"rgba(155,109,255,0.8)":"rgba(0,0,0,0.55)" }}>
                      {active ? (
                        <div style={{ display:"flex", gap:2, alignItems:"center", height:14 }}>
                          {[1,2,3,4].map(i => <span key={i} className="wave-bar" style={{ height:[10,14,8,12][i-1], animationDelay:`${(i-1)*0.12}s` }} />)}
                        </div>
                      ) : "▶"}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:"#F0F0FF", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                <div style={{ fontSize:11, color:"var(--t2)", marginBottom:3 }}>{s.artist}</div>
                <div style={{ fontSize:10, color:s.color, fontWeight:700 }}>▶ {s.plays}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Top Tracks List ──────────────────────────────────────────────── */}
      <section style={{ padding:"24px 16px 8px" }}>
        <div className="sec-hd">
          <span className="sec-title">🎵 Top Tracks</span>
          <button className="sec-link pressable" onClick={() => setPage("trending")}>See all →</button>
        </div>
        <div className="glass-card" style={{ overflow:"hidden" }}>
          {songs.slice(0,6).map((s: any, i: number) => {
            const active = currentSong?.id===s.id && isPlaying;
            return (
              <div key={s.id} className="track-row" style={{ borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none" }} onClick={() => playSong(s)}>
                <div style={{ width:22, textAlign:"center", fontSize:12, fontWeight:800, color:active?"#9B6DFF":"var(--t3)" }}>
                  {active ? (
                    <div style={{ display:"flex", gap:1.5, justifyContent:"center", alignItems:"flex-end", height:14 }}>
                      {[1,2,3].map(j => <span key={j} className="wave-bar" style={{ height:[10,14,8][j-1], animationDelay:`${(j-1)*0.15}s` }} />)}
                    </div>
                  ) : i+1}
                </div>
                <CoverArt seed={s.seed} color={s.color} size={46} radius={12} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:active?"#C4A1FF":"#F0F0FF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                  <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>{s.artist} · {s.genre}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:10, color:s.color, fontWeight:700, marginBottom:2 }}>{s.plays}</div>
                  <div style={{ fontSize:11, color:"var(--t3)" }}>{s.duration}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
