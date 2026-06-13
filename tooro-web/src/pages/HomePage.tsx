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

export function HomePage() {
  const {
    playSong, currentSong, isPlaying, setPage, setSelectedGenre,
    openUpload, setSideMenuOpen, user, setAuthModal,
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

  return (
    <div className="hero-bg">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="glass-dk sticky top-0 z-40" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)", borderRadius:0 }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#9B6DFF,#5B21B6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 4px 14px rgba(155,109,255,0.35)", flexShrink:0 }}>🎵</div>
            <div>
              <div style={{ fontSize:16, fontWeight:900, letterSpacing:"-0.02em", color:"#F0F0FF" }}>Tooro Music</div>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#3E3E58" }}>Western Uganda</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => openUpload("song")} className="pressable" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"rgba(155,109,255,0.15)", border:"1.5px solid rgba(155,109,255,0.3)", borderRadius:100, fontSize:12, fontWeight:800, color:"#C4A1FF" }}>
              <span>+</span> Upload
            </button>
            {user ? (
              <button onClick={() => setSideMenuOpen(true)} className="pressable" style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#9B6DFF,#FF6BA8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff", boxShadow:"0 4px 12px rgba(155,109,255,0.35)" }}>
                {user.displayName?.charAt(0)?.toUpperCase() || "U"}
              </button>
            ) : (
              <button onClick={() => setAuthModal("login")} className="pressable" style={{ padding:"7px 14px", borderRadius:100, background:"var(--surf)", border:"1.5px solid var(--bd)", fontSize:12, fontWeight:700, color:"var(--t2)" }}>Sign In</button>
            )}
            <button onClick={() => setSideMenuOpen(true)} className="pressable" style={{ width:36, height:36, borderRadius:11, background:"var(--surf)", border:"1.5px solid var(--bd)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
              {[14,14,10].map((w,i) => <span key={i} style={{ display:"block", width:w, height:1.5, background:"var(--t2)", borderRadius:2 }} />)}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-2">
        <div className="relative overflow-hidden" style={{ borderRadius:28, minHeight:200, padding:"28px 24px", background:"linear-gradient(135deg,#1A0A3C 0%,#2D1266 45%,#0F0720 100%)", boxShadow:"0 20px 60px rgba(155,109,255,0.18),inset 0 1px 0 rgba(255,255,255,0.08)" }}>
          <div style={{ position:"absolute", top:-50, right:-30, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(155,109,255,0.25),transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-30, left:40, width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,168,0.15),transparent 70%)", pointerEvents:"none" }} />

          {/* Floating song covers */}
          <div style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:7, opacity:0.9 }}>
            {songs.slice(0,3).map((s,i) => (
              <div key={s.id} style={{ transform:`translateX(${i*10}px) rotate(${[-5,0,5][i]}deg)`, boxShadow:`0 6px 20px ${s.color}50` }}>
                <CoverArt seed={s.seed} color={s.color} size={50} radius={11} />
              </div>
            ))}
          </div>

          <div style={{ position:"relative", maxWidth:"60%" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(34,211,165,0.15)", border:"1px solid rgba(34,211,165,0.3)", borderRadius:100, padding:"4px 12px", marginBottom:12 }}>
              <span className="live-dot" />
              <span style={{ fontSize:10, fontWeight:800, color:"#22D3A5", letterSpacing:"0.08em" }}>NOW TRENDING</span>
            </div>
            <h1 className="h1" style={{ color:"#F0F0FF", marginBottom:6 }}>Tooro<br /><span className="grad-text">Kingdom 🎵</span></h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:20, lineHeight:1.5 }}>The Sound of Western Uganda</p>
            <button onClick={() => playSong(songs[0] as any)} className="pressable" style={{ display:"inline-flex", alignItems:"center", gap:10, background:"#fff", borderRadius:100, padding:"11px 22px", fontSize:13, fontWeight:900, color:"#5B21B6", boxShadow:"0 4px 20px rgba(255,255,255,0.25)" }}>
              <span style={{ fontSize:11 }}>▶</span> Play Now
            </button>
          </div>
        </div>
      </div>

      {/* ── Genre Pills ─────────────────────────────────────────────────── */}
      <div style={{ padding:"18px 0 4px" }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ paddingLeft:16, paddingRight:16, paddingBottom:4 }}>
          {GENRES.map((g) => (
            <button key={g.name} onClick={() => { setSelectedGenre(g.name==="All"?null:g.name); setPage("discover"); }} className="pill pressable" style={{ background:`${g.color}14`, borderColor:`${g.color}35`, color:g.color }}>
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
                {/* Real photo if available, else generative art */}
                {a.imageUrl ? (
                  <div style={{ width:108, height:108, borderRadius:22, overflow:"hidden", boxShadow:`0 8px 24px ${a.color}35`, border:`2px solid ${a.color}25` }}>
                    <img src={a.imageUrl} alt={a.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
                  </div>
                ) : (
                  <div style={{ width:108, height:108, borderRadius:22, overflow:"hidden", boxShadow:`0 8px 24px ${a.color}30`, border:`2px solid ${a.color}25` }}>
                    <CoverArt seed={a.seed} color={a.color} size={108} radius={0} />
                  </div>
                )}
                {a.verified && (
                  <div style={{ position:"absolute", bottom:4, right:4, width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${a.color},${a.color}BB)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, border:"2px solid var(--bg)", boxShadow:`0 2px 8px ${a.color}50` }}>✓</div>
                )}
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:"#F0F0FF", textAlign:"center", marginBottom:2 }}>{a.name}</div>
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

      {/* ── Playlists ────────────────────────────────────────────────────── */}
      <section style={{ padding:"24px 0 8px" }}>
        <div className="sec-hd px-4">
          <span className="sec-title">🎧 Playlists</span>
          <button className="sec-link pressable">Browse →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none" style={{ paddingLeft:16, paddingRight:16, paddingBottom:8 }}>
          {PLAYLISTS.map((pl) => (
            <div key={pl.id} className="card-hover flex-shrink-0" style={{ width:130 }}>
              <div style={{ width:130, height:130, borderRadius:20, marginBottom:10, overflow:"hidden", boxShadow:`0 6px 20px ${pl.color}28` }}>
                <CoverArt seed={pl.seed} color={pl.color} size={130} radius={0} />
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:"#F0F0FF", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pl.name}</div>
              <div style={{ fontSize:10, color:"var(--t3)", fontWeight:600 }}>{pl.count} tracks</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Premium CTA ─────────────────────────────────────────────────── */}
      <div style={{ padding:"20px 16px 12px" }}>
        <div className="pressable" onClick={() => setPage("premium")} style={{ borderRadius:24, padding:"22px 20px", background:"linear-gradient(135deg,rgba(155,109,255,0.15) 0%,rgba(255,107,168,0.1) 100%)", border:"1.5px solid rgba(155,109,255,0.2)", display:"flex", alignItems:"center", gap:16, boxShadow:"0 8px 32px rgba(155,109,255,0.1)" }}>
          <div style={{ fontSize:36 }}>👑</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:900, color:"#F0F0FF", marginBottom:4 }}>Go Premium</div>
            <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.5 }}>Ad-free · Offline · 320kbps quality</div>
          </div>
          <div style={{ fontSize:20, color:"var(--pu2)" }}>›</div>
        </div>
      </div>

    </div>
  );
}
