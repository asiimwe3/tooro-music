import { useAppStore, uploadToSong } from "../../store/appStore";
import { CoverArt } from "../../components/CoverArt";
import { ARTIST_PLANS, SONGS, ARTISTS } from "../../data/mock";
import { ArtistFeed } from "./ArtistFeed";

// ── TikTok-style Artist Hub — built for creators who live on TikTok ───────
const TABS = [
  { id: "feed", label: "Feed", icon: "🎬" },
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "promote", label: "Promote", icon: "🚀" },
  { id: "monetize", label: "Balance", icon: "💰" },
  { id: "collab", label: "Collabs", icon: "🤝" },
  { id: "subscribe", label: "Fans", icon: "❤" },
] as const;

export function ArtistPage() {
  const { artistTab, setArtistTab, openUpload, openPayment, user, setAuthModal, playSong, showToast, uploads } = useAppStore();

  const artist = ARTISTS[0]; // Demo artist profile — the signed-in artist's own profile in production
  const topSongs = SONGS.filter((s) => s.artistId === artist.id).slice(0, 4);

  return (
    <div className="page">
      {/* Creator header */}
      <div style={{ padding: "22px 16px 0" }}>
        <div style={{ borderRadius: 26, overflow: "hidden", padding: "18px 20px", background: `linear-gradient(135deg,${artist.color}25 0%,rgba(6, 16, 32,0.9) 60%)`, border: `1px solid ${artist.color}30`, position: "relative" }}>
          <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${artist.color}30,transparent 70%)` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", boxShadow: `0 10px 30px ${artist.color}40`, border: `2px solid ${artist.color}40` }}>
              <CoverArt seed={artist.name} color={artist.color} size={64} radius={0} imageUrl={artist.imageUrl} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#EDF4FF", display: "flex", alignItems: "center", gap: 6 }}>
                {user?.displayName || artist.name} {artist.verified && <span style={{ fontSize: 12, color: artist.color }}>✓</span>}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--t2)", marginTop: 2, fontWeight: 600 }}>Creator Studio · @{artist.name.replace(/\s+/g, "").toLowerCase()}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 7 }}>
                <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700 }}>{artist.followers} <span style={{ color: "var(--t3)", fontWeight: 600 }}>fans</span></span>
                <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700 }}>{artist.songs + uploads.length} <span style={{ color: "var(--t3)", fontWeight: 600 }}>posts</span></span>
              </div>
            </div>
            {/* TikTok-style + post button */}
            <button onClick={() => { if (!user) { setAuthModal("login"); return; } openUpload("song"); }} className="pressable" style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 15, background: "linear-gradient(135deg,#FE2C55,#38BDF8)", border: "none", color: "#fff", fontSize: 24, fontWeight: 900, boxShadow: "0 8px 22px rgba(254,44,85,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>＋</button>
          </div>
        </div>
      </div>

      {/* TikTok-style tabs */}
      <div style={{ padding: "16px 16px 4px" }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ paddingBottom: 4 }}>
          {TABS.map((t) => {
            const active = artistTab === t.id;
            return (
              <button key={t.id} onClick={() => setArtistTab(t.id)} className="pill pressable" style={{ background: active ? "rgba(254,44,85,0.18)" : "var(--surf)", borderColor: active ? "rgba(254,44,85,0.55)" : "var(--bd)", color: active ? "#FF6B8A" : "var(--t2)", fontWeight: active ? 900 : 700, flexShrink: 0 }}>
                <span style={{ fontSize: 13 }}>{t.icon}</span><span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "14px 16px 8px" }}>
        {artistTab === "feed" && <ArtistFeed />}
        {artistTab === "profile" && <CreatorProfile artist={artist} playSong={playSong} openUpload={openUpload} />}
        {artistTab === "analytics" && <Analytics artist={artist} />}
        {artistTab === "promote" && (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
            {[
              { icon: "📻", name: "Radio Feature", desc: "Get rotated on partner community radio across Tooro", price: 20000 },
              { icon: "📱", name: "Social Boost", desc: "Featured placement in the app's Discover page", price: 10000 },
              { icon: "🎉", name: "Event Slot", desc: "Perform at Tooro Music community showcases", price: 35000 },
            ].map((p) => (
              <div key={p.name} className="glass-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#EDF4FF", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5, marginBottom: 10 }}>{p.desc}</div>
                <button onClick={() => openPayment(p.name, p.price)} className="pressable" style={{ width: "100%", background: "rgba(56, 189, 248,0.15)", border: "1.5px solid rgba(56, 189, 248,0.35)", borderRadius: 10, padding: "8px 0", fontSize: 11.5, fontWeight: 800, color: "#67E8F9" }}>
                  UGX {p.price.toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        )}
        {artistTab === "monetize" && (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
            {ARTIST_PLANS.map((p) => (
              <div key={p.id} className="glass-card" style={{ padding: 18, border: p.id === "pro" ? "1.5px solid rgba(56, 189, 248,0.5)" : undefined, position: "relative" }}>
                {p.id === "pro" && <div style={{ position: "absolute", top: -9, right: 14, background: "linear-gradient(135deg,#38BDF8,#3B82F6,#818CF8)", borderRadius: 100, fontSize: 8.5, fontWeight: 900, color: "#fff", padding: "3px 9px", letterSpacing: "0.05em" }}>MOST POPULAR</div>}
                <div style={{ fontSize: 15, fontWeight: 900, color: "#EDF4FF", marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: "#67E8F9", marginBottom: 10 }}>UGX {p.price.toLocaleString()}<span style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600 }}>/mo</span></div>
                {p.features.map((f) => (
                  <div key={f} style={{ fontSize: 11, color: "var(--t2)", fontWeight: 600, marginBottom: 5 }}>✓ {f}</div>
                ))}
                <button onClick={() => openPayment(`${p.name} Artist Plan`, p.price, p.id)} className="pressable" style={{ width: "100%", marginTop: 8, background: "linear-gradient(135deg,#38BDF8,#3B82F6,#818CF8)", borderRadius: 11, padding: "10px 0", fontSize: 12, fontWeight: 900, color: "#fff", border: "none" }}>
                  Choose {p.name}
                </button>
              </div>
            ))}
          </div>
        )}
        {artistTab === "collab" && (
          <EmptyCard icon="🤝" title="No open collaborations yet" body="When other artists invite you to collaborate on a track, requests will appear here. Grow your fan base and collabs will follow." cta="Promote Your Music" onCta={() => setArtistTab("promote")} />
        )}
        {artistTab === "subscribe" && (
          <EmptyCard icon="❤" title="Your fans, your income" body="Fans who subscribe to you pay UGX 2,000/month directly — 70% goes to you, paid out via mobile money every month." cta="Grow Your Fans" onCta={() => showToast("Fan subscriptions activate once your first upload is live.")} />
        )}
      </div>
    </div>
  );
}

// ── TikTok creator profile ───────────────────────────────────────────────
function CreatorProfile({ artist, playSong, openUpload }: any) {
  const { uploads, showToast } = useAppStore();
  const totalLikes = uploads.reduce((n: number, u: any) => n + u.likes, 0);

  return (
    <div>
      {/* Stats bar — TikTok style */}
      <div style={{ display: "flex", justifyContent: "space-around", background: "var(--surf)", border: "1px solid var(--bd)", borderRadius: 16, padding: "12px 0", marginBottom: 14 }}>
        {[
          { n: uploads.length, l: "Posts" },
          { n: artist.followers, l: "Fans" },
          { n: totalLikes, l: "Likes" },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#EDF4FF" }}>{s.n}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t3)", letterSpacing: "0.05em" }}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Bio */}
      <div className="glass-card" style={{ padding: 14, marginBottom: 14, fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
        🎵 Making Tooro music from the heart of Western Uganda.<br />
        📥 DM for collabs · Bookings +256 762 306 675
      </div>

      {/* My uploads grid */}
      <div className="sec-hd" style={{ marginBottom: 10 }}>
        <span className="sec-title">My posts</span>
        <button className="sec-link pressable" onClick={() => openUpload("song")}>＋ Post new</button>
      </div>
      {uploads.length === 0 ? (
        <div className="glass-card" style={{ padding: "30px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🎬</div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--t2)", marginBottom: 5 }}>Share your first track</div>
          <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 14, lineHeight: 1.5 }}>Upload a song — it goes live instantly at the top of the feed, Discover and Charts.</div>
          <button onClick={() => openUpload("song")} className="pressable" style={{ background: "linear-gradient(135deg,#FE2C55,#38BDF8)", border: "none", borderRadius: 100, padding: "11px 26px", fontSize: 12.5, fontWeight: 900, color: "#fff", boxShadow: "0 6px 20px rgba(254,44,85,0.35)" }}>＋ Upload</button>
        </div>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 8 }}>
          {uploads.map((u: any) => (
            <div key={u.id} className="card-hover" style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden" }} onClick={() => playSong(uploadToSong(u))}>
              <CoverArt seed={u.seed} color={u.color} size={130} radius={0} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 55%,rgba(4,12,26,0.85))" }} />
              <div style={{ position: "absolute", left: 8, right: 8, bottom: 7 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.title}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>▶ {u.plays} · ❤ {u.likes}</div>
              </div>
              {u.isVideo && <div style={{ position: "absolute", top: 6, right: 6, fontSize: 12 }}>🎬</div>}
            </div>
          ))}
        </div>
      )}

      {/* Top tracks from catalog */}
      <div className="sec-hd" style={{ marginBottom: 10, marginTop: 16 }}>
        <span className="sec-title">Top tracks</span>
      </div>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {SONGS.filter((s) => s.artistId === artist.id).slice(0, 6).map((s: any, i: number, arr: any[]) => (
          <div key={s.id} className="track-row" onClick={() => playSong(s)} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ width: 18, textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--t3)" }}>{i + 1}</span>
            <CoverArt seed={s.seed} color={s.color} size={40} radius={10} imageUrl={s.coverUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#EDF4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
              <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>▶ {s.plays} plays</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics({ artist }: { artist: any }) {
  const songs = SONGS.filter((s) => s.artistId === artist.id);
  const max = Math.max(...songs.map((s) => parseInt(s.plays.replace(/\D/g, ""))), 1);
  return (
    <div className="glass-card" style={{ padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#EDF4FF", marginBottom: 14 }}>Plays by track</div>
      {songs.map((s) => {
        const v = parseInt(s.plays.replace(/\D/g, ""));
        return (
          <div key={s.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--t2)", maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: s.color }}>{s.plays}</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(v / max) * 100}%`, background: `linear-gradient(90deg,${s.color},#2DD4BF)`, borderRadius: 100 }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 600, marginTop: 8 }}>Full listening analytics unlock with a Pro Artist plan.</div>
    </div>
  );
}

function EmptyCard({ icon, title, body, cta, onCta }: { icon: string; title: string; body: string; cta: string; onCta: () => void }) {
  return (
    <div className="glass-card" style={{ padding: "34px 22px", textAlign: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15.5, fontWeight: 900, color: "#EDF4FF", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 18, maxWidth: 320, margin: "0 auto 18px" }}>{body}</div>
      <button onClick={onCta} className="pressable" style={{ background: "linear-gradient(135deg,#38BDF8,#3B82F6,#818CF8)", borderRadius: 100, padding: "11px 24px", fontSize: 12.5, fontWeight: 900, color: "#fff", border: "none", boxShadow: "0 6px 20px rgba(56, 189, 248,0.35)" }}>{cta}</button>
    </div>
  );
}
