import { useEffect, useRef, useState } from "react";
import { useAppStore, uploadToSong } from "../../store/appStore";
import { CoverArt } from "../../components/CoverArt";
import { SONGS, ARTISTS } from "../../data/mock";

// ── TikTok-style vertical feed for artists ────────────────────────────────

// Realistic, locally-flavored comment pool so every post feels alive
// (not empty) the moment a listener opens the feed.
const COMMENT_POOL = [
  "This one goes hard 🔥🔥 no cap",
  "Kampala vibes all day 🇺🇬",
  "On repeat since morning 🎧",
  "Tooro to the world 🏔️❤️",
  "Who else here before 1M views? 👇",
  "The melody though 😭❤️",
  "My weekend anthem 🔊",
  "Bwoy this is pure talent 😳",
  "Playing this at the kwanjula next week 💃",
  "Real music, no autotune 👏",
  "Fort Portal massive, where you at? 🙌",
  "Already on my playlist, can't skip 🚫⏭️",
  "That hook lives rent-free in my head 🧠🎶",
  "Uganda is next up, mark my words 📌",
  "Sent this to the whole group chat 😂",
  "Bass line is talking to me rn 🗣️",
  "Heard it once, knew every word by the second play 🤯",
  "Mum walked in and started dancing 😅",
  "This deserves a Grammy fr 🏆",
  "Western Uganda sound is unmatched 🎯",
  "Late night drive song 🌙🚗",
  "Why is nobody talking about this?? 🤨",
  "Clean vibes only 🧼",
  "My shs kids are going to murder this at speech day 😂",
  "Put this on every matatu radio 🚐",
  "The intro alone gave me chills 🥶",
  "Underrated. criminally underrated. 📈",
  "Came from the Shazam feature, staying for the vibes 🎤",
  "Telling my grandkids this was the song that made it 📖",
  "No skip season 🚫",
];

const USER_POOL = [
  "mukiga_ally", "derrick256", "tooro_lad", "blessed_nyaruki", "mc_kato",
  "kihihi_kev", "queen_ruthy", "kampala_vibes", "rugarasamu", "vibes_only_ug",
  "nyinarwaka", "omukazi_wa_kla", "fortportal_flex", "jovia_m", "kato_banton",
  "sheebah_fan", "ug_music_junkie", "runyoro_pride", "mukama_blessed", "the_real_zee",
];

const CAPTION_TEMPLATES = [
  (g: string) => `${g} that touches the soul 🎶 #tooromusic #${tag(g)} #uganda`,
  () => "Drop everything and vibe to this 🔥 #newmusic #ugandanmusic",
  (g: string) => `Late night studio session birthed this one 🌙 #${tag(g)} #tooro`,
  () => "Tag someone who needs to hear this 👇 #fyp #uganda",
  (g: string) => `Pure ${g} energy ⚡ #tooromusic #${tag(g)}`,
  () => "This one is for the culture 🇺🇬❤️ #ugandanmusic #fyp",
  (g: string) => "From Tooro, with love 🏔️ #tooromusic #" + tag(g),
  () => "Press play and thank me later 🎧 #newdrop #uganda",
];

const TIMES = ["2h", "5h", "1d", "2d", "3d", "4d", "1w", "2w"];

function tag(g: string) { return (g || "music").toLowerCase().replace(/\s/g, ""); }
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

type Comment = { u: string; t: string; l: number; tm: string; mine?: boolean };

function seededComments(id: string): Comment[] {
  const h = hash(id);
  const n = 3 + (h % 5); // 3–7 seeded comments
  const out: Comment[] = [];
  for (let i = 0; i < n; i++) {
    const ci = (h + i * 7) % COMMENT_POOL.length;
    const ui = (h + i * 13) % USER_POOL.length;
    const li = (h + i * 17) % TIMES.length;
    const likes = ((h + i * 19) % 880) + 3;
    out.push({ u: USER_POOL[ui], t: COMMENT_POOL[ci], l: likes, tm: TIMES[li] });
  }
  return out;
}

function loadUserComments(id: string): Comment[] {
  try { return JSON.parse(localStorage.getItem("tm_comments2_" + id) || "[]"); } catch { return []; }
}
function saveUserComments(id: string, c: Comment[]) {
  try { localStorage.setItem("tm_comments2_" + id, JSON.stringify(c)); } catch { /* full */ }
}
function loadLikedComments(id: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem("tm_clikes_" + id) || "{}"); } catch { return {}; }
}

function loadFollowing(): string[] {
  try {
    const raw = localStorage.getItem("tm_following");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // Seed a few follows so the "Following" tab is never empty on first open
  const seed = ARTISTS.slice(0, 3).map((a) => (a as any).id).filter(Boolean);
  try { localStorage.setItem("tm_following", JSON.stringify(seed)); } catch { /* ignore */ }
  return seed;
}

export function ArtistFeed() {
  const { uploads, playSong, currentSong, isPlaying, openUpload, favorites, toggleFavorite, showToast, setPage, user } = useAppStore();
  const [tab, setTab] = useState<"foryou" | "following">("foryou");
  const [following, setFollowing] = useState<string[]>(loadFollowing);

  function toggleFollow(artistId: string, artistName: string) {
    setFollowing((prev) => {
      const has = prev.includes(artistId);
      const next = has ? prev.filter((x) => x !== artistId) : [...prev, artistId];
      try { localStorage.setItem("tm_following", JSON.stringify(next)); } catch { /* ignore */ }
      showToast(has ? `Unfollowed @${artistName}` : `Following @${artistName} ✓`);
      return next;
    });
  }

  const base = [
    ...uploads.map((u) => ({ ...u, kind: "upload" as const })),
    ...SONGS.slice(0, 30).map((s) => ({
      id: s.id, title: s.title, artist: s.artist, artistId: (s as any).artistId,
      genre: s.genre,
      caption: CAPTION_TEMPLATES[hash(s.title) % CAPTION_TEMPLATES.length](s.genre || "Afrobeat"),
      color: s.color, seed: (s as any).seed || s.title, duration: s.duration,
      plays: parseInt(String(s.plays).replace(/\D/g, "")) * 1000,
      likes: Math.round(parseInt(String(s.plays).replace(/\D/g, "")) * 0.6),
      comments: Math.round(parseInt(String(s.plays).replace(/\D/g, "")) * 0.1),
      createdAt: 0, isVideo: false, kind: "song" as const,
    })),
  ];

  const items = tab === "following"
    ? base.filter((i) => (i as any).artistId && following.includes((i as any).artistId))
    : base;

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
            <div style={{ fontSize: 13, color: "var(--t3)", textAlign: "center", maxWidth: 240 }}>No posts here yet. Follow artists on the <b>For You</b> tab to fill this up.</div>
            <button onClick={() => setTab("foryou")} className="pressable" style={{ background: "linear-gradient(135deg,#FE2C55,#38BDF8)", border: "none", borderRadius: 100, padding: "10px 20px", fontSize: 12.5, fontWeight: 900, color: "#fff" }}>Go to For You</button>
          </div>
        )}
        {items.map((it) => (
          <FeedCard
            key={it.id}
            item={it}
            playSong={playSong}
            currentSong={currentSong}
            isPlaying={isPlaying}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            showToast={showToast}
            openUpload={openUpload}
            setPage={setPage}
            uploads={uploads}
            following={following}
            toggleFollow={toggleFollow}
            me={user?.displayName || "you"}
          />
        ))}
      </div>
    </div>
  );
}

function FeedCard({ item: it, playSong, currentSong, isPlaying, favorites, toggleFavorite, showToast, openUpload, setPage, uploads, following, toggleFollow, me }: any) {
  const liked = favorites.includes(it.id);
  const active = currentSong?.id === it.id && isPlaying;
  const isFollowing = !!(it as any).artistId && following.includes((it as any).artistId);
  const [commentSheet, setCommentSheet] = useState(false);
  const [userComments, setUserComments] = useState<Comment[]>(() => loadUserComments(it.id));
  const [likedC, setLikedC] = useState<Record<string, boolean>>(() => loadLikedComments(it.id));
  const [draft, setDraft] = useState("");
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);

  const isNew = it.kind === "upload";
  const seeded = useRef<Comment[]>(seededComments(it.id)).current;
  const allComments: Comment[] = [...userComments, ...seeded];
  const song = it.kind === "upload" ? uploadToSong(uploads.find((u: any) => u.id === it.id)) : { ...it, plays: String(it.plays), audioUrl: undefined, coverUrl: undefined };

  function addComment() {
    if (!draft.trim()) return;
    const next = [{ u: me, t: draft.trim(), l: 0, tm: "now", mine: true }, ...userComments].slice(0, 40);
    setUserComments(next);
    saveUserComments(it.id, next);
    setDraft("");
  }

  function toggleCommentLike(key: string) {
    setLikedC((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("tm_clikes_" + it.id, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function onArtTap() {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      // Double tap = like (TikTok gesture)
      if (!liked) toggleFavorite(it.id);
      setBurst(true);
      window.setTimeout(() => setBurst(false), 700);
    } else {
      playSong(song);
    }
    lastTap.current = now;
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
        <div onClick={onArtTap} style={{ cursor: "pointer", position: "relative" }}>
          <CoverArt seed={it.seed} color={it.color} size={200} radius={26} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "linear-gradient(180deg,transparent 50%,rgba(4,12,26,0.55))" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 62, height: 62, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, backdropFilter: "blur(4px)", boxShadow: active ? "0 0 34px rgba(56,189,248,0.55)" : "none" }}>
            {active ? "❚❚" : "▶"}
          </div>
          {/* Double-tap heart burst */}
          {burst && (
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: 92, color: "#FE2C55", filter: "drop-shadow(0 6px 18px rgba(254,44,85,0.6))", animation: "tt-burst 0.7s ease-out forwards", pointerEvents: "none" }}>❤</div>
          )}
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
          <div
            onClick={(e) => { e.stopPropagation(); if ((it as any).artistId) toggleFollow((it as any).artistId, it.artist); }}
            style={{ position: "absolute", bottom: -9, left: "50%", transform: "translateX(-50%)", width: 19, height: 19, borderRadius: "50%", color: "#fff", fontSize: isFollowing ? 12 : 14, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(254,44,85,0.5)", background: isFollowing ? "#22C55E" : "#FE2C55", border: isFollowing ? "2px solid #fff" : "none" }}
          >
            {isFollowing ? "✓" : "＋"}
          </div>
        </div>

        <RailButton icon={liked ? "❤" : "♡"} label={fmt(it.likes + (liked ? 1 : 0))} color={liked ? "#FE2C55" : "#fff"} onClick={() => toggleFavorite(it.id)} />
        <RailButton icon="💬" label={fmt(allComments.length)} onClick={() => setCommentSheet(true)} />
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
        {/* Sound row */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 13 }}>♫</span> original sound — {it.artist} · {it.genre}
        </div>
        {/* Comment preview — tap to open */}
        {allComments[0] && (
          <div onClick={() => setCommentSheet(true)} className="pressable" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.82)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <span>💬</span><span style={{ opacity: 0.9 }}><b style={{ fontWeight: 800 }}>@{allComments[0].u}</b> {allComments[0].t}</span>
          </div>
        )}
      </div>

      {/* Comment sheet */}
      {commentSheet && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }} onClick={() => setCommentSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxHeight: "62%", overflowY: "auto", background: "linear-gradient(180deg,#0C1730,#070E1C)", borderTop: "1px solid rgba(56,189,248,0.25)", borderRadius: "22px 22px 0 0", padding: "16px 16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#EDF4FF", marginBottom: 14, textAlign: "center" }}>{allComments.length} comment{allComments.length === 1 ? "" : "s"}</div>
            {allComments.map((c, i) => {
              const key = c.mine ? "m" + i : "s" + i;
              const isLiked = !!likedC[key];
              return (
                <div key={key} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", background: `linear-gradient(135deg, ${it.color}, #38BDF8)` }}>
                    {(c.u[0] || "👤").toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(237,244,255,0.6)", marginBottom: 2 }}>{c.u} · {c.tm}</div>
                    <div style={{ fontSize: 12.5, color: "#EDF4FF", lineHeight: 1.5, wordBreak: "break-word" }}>{c.t}</div>
                  </div>
                  <button onClick={() => toggleCommentLike(key)} className="pressable" style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: 0, cursor: "pointer" }}>
                    <span style={{ fontSize: 14, color: isLiked ? "#FE2C55" : "rgba(237,244,255,0.7)" }}>{isLiked ? "❤" : "🤍"}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(237,244,255,0.7)" }}>{fmt(c.l + (isLiked ? 1 : 0))}</span>
                  </button>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#FE2C55,#38BDF8)" }}>{(me[0] || "y").toUpperCase()}</div>
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
