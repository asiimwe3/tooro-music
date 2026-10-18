import { useEffect, useRef, useState } from "react";
import { useAppStore, uploadToSong } from "../../store/appStore";
import { CoverArt } from "../../components/CoverArt";
import { SONGS, ARTISTS } from "../../data/mock";

// ── TikTok-style vertical feed for artists ────────────────────────────────
export function ArtistFeed() {
  const { uploads, playSong, currentSong, isPlaying, openUpload, favorites, toggleFavorite, showToast, setPage } = useAppStore();
  const [tab, setTab] = useState<"foryou" | "following">("foryou");

  // Feed items: artist uploads first (the mission — promote Tooro artists), then the catalog
  const items = [
    ...uploads.map((u) => ({ ...u, kind: "upload" as const })),
    ...SONGS.slice(0, 30).map((s) => ({
      id: s.id, title: s.title, artist: s.artist, artistId: (s as any).artistId,
      genre: s.genre, caption: `${s.genre} from Tooro 🎶 #tooromusic #${(s.genre || "music").toLowerCase().replace(/\s/g, "")}`,
      color: s.color, seed: (s as any).seed || s.title, duration: s.duration,
      plays: parseInt(String(s.plays).replace(/\D/g, "")) * 1000,
      likes: Math.round(parseInt(String(s.plays).replace(/\D/g, "")) * 0.6),
      comments: Math.round(parseInt(String(s.plays).replace(/\D/g, "")) * 0.1),
      createdAt: 0, isVideo: false, kind: "song" as const,
    })),
  ].filter((i) => (tab === "following" ? i.artistId === (ARTISTS[0] as any).id : true));

  return (
    <div>
      {/* TikTok-style top tabs */}
      <div className="flex items-center justify-center gap-7" style={{ padding: "6px 0 10px" }}>
        <button onClick={() => setTab("following")} style={{ background: "none", border: "none", padding: 0, position: "relative", fontSize: 15, fontWeight: tab === "following" ? 900 : 700, color: tab === "following" ? "#fff" : "rgba(255,255,255,0.55)" }}>
          Following
          {tab === "following" && <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -7, width: 24, height: 3, borderRadius: 2, background: "#fff" }} />}
        </button>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
        <button onClick={() => setTab("foryou")} style={{ background: "none", border: "none", padding: 0, position: "relative", fontSize: 15, fontWeight: tab === "foryou" ? 900 : 700, color: tab === "foryou" ? "#fff" : "rgba(255,255,255,0.55)" }}>
          For You
          {tab === "foryou" && <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -7, width: 24, height: 3, borderRadius: 2, background: "#fff" }} />}
        </button>
      </div>

      {/* Vertical snap feed */}
      <div style={{ height: "min(78vh, 720px)", overflowY: "auto", scrollSnapType: "y mandatory", borderRadius: 22, border: "1px solid rgba(255,255,255,0.06)" }} className="tt-feed">
        {items.length === 0 && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ fontSize: 34 }}>🎬</div>
            <div style={{ fontSize: 13, color: "var(--t3)" }}>No posts here yet — post your first track!</div>
            <button onClick={() => openUpload("song")} className="pressable" style={{ background: "linear-gradient(135deg,#FE2C55,#38BDF8)", border: "none", borderRadius: 100, padding: "10px 20px", fontSize: 12.5, fontWeight: 900, color: "#fff" }}>＋ Post</button>
          </div>
        )}
        {items.map((it) => (
          <FeedCard key={it.id} item={it} playSong={playSong} currentSong={currentSong} isPlaying={isPlaying} favorites={favorites} toggleFavorite={toggleFavorite} showToast={showToast} openUpload={openUpload} setPage={setPage} uploads={uploads} />
        ))}
      </div>
    </div>
  );
}

function FeedCard({ item: it, playSong, currentSong, isPlaying, favorites, toggleFavorite, showToast, openUpload, setPage, uploads }: any) {
  const liked = favorites.includes(it.id);
  const active = currentSong?.id === it.id && isPlaying;
  const [commentSheet, setCommentSheet] = useState(false);
  const [comments, setComments] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("tm_comments_" + it.id) || "[]"); } catch { return []; }
  });
  const [draft, setDraft] = useState("");
  const isNew = it.kind === "upload";
  const song = it.kind === "upload" ? uploadToSong(uploads.find((u: any) => u.id === it.id)) : { ...it, plays: String(it.plays), audioUrl: undefined, coverUrl: undefined };

  function addComment() {
    if (!draft.trim()) return;
    const next = [draft.trim(), ...comments].slice(0, 30);
    setComments(next);
    try { localStorage.setItem("tm_comments_" + it.id, JSON.stringify(next)); } catch { /* full */ }
    setDraft("");
  }

  function share() {
    const url = "https://tooro-music-ten.vercel.app";
    if (navigator.share) navigator.share({ title: `${it.title} — ${it.artist}`, text: `Listen to ${it.title} by ${it.artist} on Tooro Music`, url }).catch(() => {});
    else { navigator.clipboard?.writeText(url); showToast("Link copied — share your sound 🎧"); }
  }

  return (
    <div style={{ height: "100%", scrollSnapAlign: "start", position: "relative", overflow: "hidden" }}>
      {/* Full-bleed backdrop */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 80% at 20% 15%, ${it.color}38 0%, transparent 55%), radial-gradient(100% 90% at 85% 85%, ${it.color}22 0%, transparent 60%), linear-gradient(180deg,#0C1730 0%,#070E1C 100%)` }} />

      {/* Center art */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 74 }}>
        <div onClick={() => playSong(song)} style={{ cursor: "pointer", position: "relative", animation: active ? "none" : undefined }}>
          <CoverArt seed={it.seed} color={it.color} size={200} radius={26} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "linear-gradient(180deg,transparent 50%,rgba(4,12,26,0.55))" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 62, height: 62, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, backdropFilter: "blur(4px)", boxShadow: active ? "0 0 34px rgba(56,189,248,0.55)" : "none" }}>
            {active ? "❚❚" : "▶"}
          </div>
        </div>
      </div>

      {/* NEW badge for artist uploads */}
      {isNew && (
        <div style={{ position: "absolute", top: 14, left: 14, background: "linear-gradient(135deg,#FE2C55,#FF6BA8)", borderRadius: 8, fontSize: 9.5, fontWeight: 900, color: "#fff", padding: "4px 10px", letterSpacing: "0.08em", boxShadow: "0 4px 14px rgba(254,44,85,0.45)" }}>NEW UPLOAD</div>
      )}

      {/* TikTok action rail */}
      <div style={{ position: "absolute", right: 12, bottom: 110, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {/* Avatar + follow */}
        <div style={{ position: "relative", marginBottom: 4 }} onClick={() => setPage("artist")}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", border: "2px solid #fff", overflow: "hidden", background: `${it.color}30` }}>
            <CoverArt seed={it.artist} color={it.color} size={46} radius={0} />
          </div>
          <div style={{ position: "absolute", bottom: -9, left: "50%", transform: "translateX(-50%)", width: 19, height: 19, borderRadius: "50%", background: "#FE2C55", color: "#fff", fontSize: 14, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(254,44,85,0.5)" }}>＋</div>
        </div>

        <RailButton icon={liked ? "❤" : "♡"} label={fmt(it.likes + (liked ? 1 : 0))} color={liked ? "#FE2C55" : "#fff"} onClick={() => toggleFavorite(it.id)} />
        <RailButton icon="💬" label={fmt(it.comments + comments.length)} onClick={() => setCommentSheet(true)} />
        <RailButton icon="⤴" label="Share" onClick={share} />
        {/* Spinning disc */}
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: `conic-gradient(from 20deg,${it.color},#070E1C,${it.color})`, display: "flex", alignItems: "center", justifyContent: "center", animation: active ? "tt-spin 3.5s linear infinite" : "none", boxShadow: "0 4px 14px rgba(0,0,0,0.5)" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: `radial-gradient(circle,#fff 20%,${it.color} 21%)` }} />
        </div>
      </div>

      {/* Bottom info */}
      <div style={{ position: "absolute", left: 14, right: 70, bottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 5 }}>@{it.artist.replace(/\s+/g, "").toLowerCase()}</div>
        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.92)", fontWeight: 600, lineHeight: 1.45, marginBottom: 5 }}>
          {it.title}{it.isVideo ? " 🎬" : " 🎵"} — {it.caption}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          ♫ {it.genre} · {it.duration} · {fmt(it.plays)} plays
        </div>
      </div>

      {/* Comment sheet */}
      {commentSheet && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }} onClick={() => setCommentSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxHeight: "60%", overflowY: "auto", background: "linear-gradient(180deg,#0C1730,#070E1C)", borderTop: "1px solid rgba(56,189,248,0.25)", borderRadius: "22px 22px 0 0", padding: "16px 16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#EDF4FF", marginBottom: 12 }}>{comments.length} comment{comments.length === 1 ? "" : "s"}</div>
            {comments.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>👤</div>
                <div style={{ fontSize: 12.5, color: "#EDF4FF", lineHeight: 1.5 }}>{c}</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} placeholder="Add a comment…" style={{ flex: 1, background: "var(--surf)", border: "1px solid var(--bd)", borderRadius: 100, padding: "10px 14px", fontSize: 12.5, color: "#fff", outline: "none" }} />
              <button onClick={addComment} className="pressable" style={{ background: "linear-gradient(135deg,#FE2C55,#38BDF8)", border: "none", borderRadius: 100, padding: "0 16px", fontSize: 12, fontWeight: 900, color: "#fff" }}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RailButton({ icon, label, color = "#fff", onClick }: any) {
  return (
    <div className="pressable" onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, color, backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.1)" }}>{icon}</div>
      <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>{label}</span>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
