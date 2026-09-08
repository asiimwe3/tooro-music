import { useAppStore } from "../../store/appStore";
import { CoverArt } from "../../components/CoverArt";
import { ARTIST_PLANS, SONGS, ARTISTS } from "../../data/mock";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "upload", label: "Upload", icon: "＋" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "promote", label: "Promote", icon: "🚀" },
  { id: "monetize", label: "Monetize", icon: "💰" },
  { id: "collab", label: "Collabs", icon: "🤝" },
  { id: "subscribe", label: "Fans", icon: "❤" },
] as const;

export function ArtistPage() {
  const { artistTab, setArtistTab, openUpload, openPayment, user, setAuthModal, playSong, showToast } = useAppStore();

  const artist = ARTISTS[0]; // Demo artist profile — the signed-in artist's own profile in production
  const topSongs = SONGS.filter((s) => s.artistId === artist.id).slice(0, 4);

  return (
    <div className="page">
      {/* Artist header */}
      <div style={{ padding: "22px 16px 0" }}>
        <div style={{ borderRadius: 26, overflow: "hidden", padding: "22px 20px", background: `linear-gradient(135deg,${artist.color}25 0%,rgba(10,7,20,0.9) 60%)`, border: `1px solid ${artist.color}30`, position: "relative" }}>
          <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${artist.color}30,transparent 70%)` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
            <div style={{ width: 74, height: 74, borderRadius: 22, overflow: "hidden", boxShadow: `0 10px 30px ${artist.color}40`, border: `2px solid ${artist.color}40` }}>
              <CoverArt seed={artist.name} color={artist.color} size={74} radius={0} imageUrl={artist.imageUrl} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: "#F0F0FF", display: "flex", alignItems: "center", gap: 6 }}>
                {artist.name} {artist.verified && <span style={{ fontSize: 12, color: artist.color }}>✓</span>}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--t2)", marginTop: 2, fontWeight: 600 }}>{artist.genre} · Artist Hub</div>
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700 }}>{artist.followers} <span style={{ color: "var(--t3)", fontWeight: 600 }}>fans</span></span>
                <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700 }}>{artist.songs} <span style={{ color: "var(--t3)", fontWeight: 600 }}>songs</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "16px 16px 4px" }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ paddingBottom: 4 }}>
          {TABS.map((t) => {
            const active = artistTab === t.id;
            return (
              <button key={t.id} onClick={() => setArtistTab(t.id)} className="pill pressable" style={{ background: active ? "rgba(155,109,255,0.2)" : "var(--surf)", borderColor: active ? "rgba(155,109,255,0.55)" : "var(--bd)", color: active ? "#C4A1FF" : "var(--t2)", fontWeight: active ? 900 : 700, flexShrink: 0 }}>
                <span style={{ fontSize: 13 }}>{t.icon}</span><span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "14px 16px 8px" }}>
        {artistTab === "dashboard" && <Dashboard artist={artist} topSongs={topSongs} playSong={playSong} openUpload={openUpload} />}
        {artistTab === "upload" && (
          <EmptyCard icon="🎵" title="Share your sound" body="Upload audio or video — our team reviews within 48 hours, then your track goes live across Tooro Music." cta="Upload a Song" onCta={() => openUpload("song")} />
        )}
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
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#F0F0FF", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5, marginBottom: 10 }}>{p.desc}</div>
                <button onClick={() => openPayment(p.name, p.price)} className="pressable" style={{ width: "100%", background: "rgba(155,109,255,0.15)", border: "1.5px solid rgba(155,109,255,0.35)", borderRadius: 10, padding: "8px 0", fontSize: 11.5, fontWeight: 800, color: "#C4A1FF" }}>
                  UGX {p.price.toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        )}
        {artistTab === "monetize" && (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
            {ARTIST_PLANS.map((p) => (
              <div key={p.id} className="glass-card" style={{ padding: 18, border: p.id === "pro" ? "1.5px solid rgba(155,109,255,0.5)" : undefined, position: "relative" }}>
                {p.id === "pro" && <div style={{ position: "absolute", top: -9, right: 14, background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 100, fontSize: 8.5, fontWeight: 900, color: "#fff", padding: "3px 9px", letterSpacing: "0.05em" }}>MOST POPULAR</div>}
                <div style={{ fontSize: 15, fontWeight: 900, color: "#F0F0FF", marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: "#C4A1FF", marginBottom: 10 }}>UGX {p.price.toLocaleString()}<span style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600 }}>/mo</span></div>
                {p.features.map((f) => (
                  <div key={f} style={{ fontSize: 11, color: "var(--t2)", fontWeight: 600, marginBottom: 5 }}>✓ {f}</div>
                ))}
                <button onClick={() => openPayment(`${p.name} Artist Plan`, p.price, p.id)} className="pressable" style={{ width: "100%", marginTop: 8, background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 11, padding: "10px 0", fontSize: 12, fontWeight: 900, color: "#fff", border: "none" }}>
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
          <EmptyCard icon="❤" title="Your fans, your income" body="Fans who subscribe to you pay UGX 2,000/month directly — 70% goes to you, paid out via mobile money every month." cta="Grow Your Fans" onCta={() => showToast("Fan subscriptions activate once your first upload is approved.")} />
        )}
      </div>
    </div>
  );
}

function Dashboard({ artist, topSongs, playSong, openUpload }: any) {
  const totalPlays = topSongs.reduce((n: number, s: any) => n + parseInt(s.plays.replace(/\D/g, "")), 0);
  return (
    <>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", marginBottom: 14 }}>
        {[
          { label: "Total Plays", value: `${Math.round(totalPlays)}K`, color: "#9B6DFF" },
          { label: "Fans", value: artist.followers, color: "#FF6BA8" },
          { label: "Songs Live", value: String(artist.songs), color: "#22D3A5" },
          { label: "This Month", value: "UGX 0", color: "#F59E0B" },
        ].map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: c.color, marginBottom: 2 }}>{c.value}</div>
            <div style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 700 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="sec-hd" style={{ marginBottom: 10 }}>
        <span className="sec-title">Your top tracks</span>
        <button className="sec-link pressable" onClick={() => openUpload("song")}>＋ Upload</button>
      </div>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {topSongs.map((s: any, i: number) => (
          <div key={s.id} className="track-row" onClick={() => playSong(s)} style={{ borderBottom: i < topSongs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ width: 18, textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--t3)" }}>{i + 1}</span>
            <CoverArt seed={s.seed} color={s.color} size={40} radius={10} imageUrl={s.coverUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#F0F0FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
              <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>▶ {s.plays} plays</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Analytics({ artist }: { artist: any }) {
  const songs = SONGS.filter((s) => s.artistId === artist.id);
  const max = Math.max(...songs.map((s) => parseInt(s.plays.replace(/\D/g, ""))), 1);
  return (
    <div className="glass-card" style={{ padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#F0F0FF", marginBottom: 14 }}>Plays by track</div>
      {songs.map((s) => {
        const v = parseInt(s.plays.replace(/\D/g, ""));
        return (
          <div key={s.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--t2)", maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: s.color }}>{s.plays}</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(v / max) * 100}%`, background: `linear-gradient(90deg,${s.color},#FF6BA8)`, borderRadius: 100 }} />
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
      <div style={{ fontSize: 15.5, fontWeight: 900, color: "#F0F0FF", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 18, maxWidth: 320, margin: "0 auto 18px" }}>{body}</div>
      <button onClick={onCta} className="pressable" style={{ background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 100, padding: "11px 24px", fontSize: 12.5, fontWeight: 900, color: "#fff", border: "none", boxShadow: "0 6px 20px rgba(155,109,255,0.35)" }}>{cta}</button>
    </div>
  );
}
