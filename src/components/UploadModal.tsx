import { useRef, useState } from "react";
import { useAppStore } from "../store/appStore";
import { GENRES, ARTISTS } from "../data/mock";
import { compressAudio, saveAudio } from "../lib/audioStore";

const CAPTION_CHIPS = ["#tooromusic", "#runyankole", "#afrobeat", "#ugandamusic", "#newmusic", "#fortportal"];

function fmtMB(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export function UploadModal() {
  const { uploadModal, closeUpload, showToast, user, setAuthModal, addUpload, setArtistTab } = useAppStore();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Afrobeat");
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);
  const [compressed, setCompressed] = useState<{ size: number; duration: number } | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [err, setErr] = useState("");

  if (uploadModal === "none") return null;
  const type = uploadModal; // "song" | "video"

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setErr("");
    setCompressed(null);
    setBlob(null);
    if (!f) { setPicked(null); return; }
    setPicked({ name: f.name, size: f.size });
    if (type !== "song") return; // videos keep simple attach for now
    setBusy(true);
    setProgress(0);
    try {
      const out = await compressAudio(f, setProgress);
      setBlob(out.blob);
      setCompressed({ size: out.blob.size, duration: out.duration });
    } catch {
      // Unreadable/unsupported file: fall back to storing the original as-is
      setBlob(f);
      setCompressed({ size: f.size, duration: 0 });
      setErr("Couldn't compress this format — using the original file.");
    }
    setBusy(false);
  }

  async function submit() {
    if (!user) { closeUpload(); setAuthModal("login"); return; }
    if (!title.trim()) { showToast("Please enter a title"); return; }
    if (type === "song" && !picked) { showToast("Please choose an audio file"); return; }
    const g = GENRES.find((x) => x.name === genre);

    let bytes = 0;
    if (type === "song" && blob) {
      const track = addUpload({
        title: title.trim(),
        artist: user.displayName || "You",
        artistId: (ARTISTS[0] as any).id,
        genre,
        caption: caption.trim() || `New ${genre} from Tooro 🎶 #tooromusic #${genre.toLowerCase().replace(/\s/g, "")}`,
        color: (g as any)?.color || "#38BDF8",
        seed: title.trim().replace(/\s+/g, "-").toLowerCase(),
        duration: compressed?.duration ? fmtTime(compressed.duration) : "3:00",
        isVideo: false,
      });
      await saveAudio(track.id, blob);
      bytes = blob.size;
    } else {
      addUpload({
        title: title.trim(),
        artist: user.displayName || "You",
        artistId: (ARTISTS[0] as any).id,
        genre,
        caption: caption.trim() || `New ${genre} from Tooro 🎶 #tooromusic #${genre.toLowerCase().replace(/\s/g, "")}`,
        color: (g as any)?.color || "#38BDF8",
        seed: title.trim().replace(/\s+/g, "-").toLowerCase(),
        duration: "3:00",
        isVideo: type === "video",
      });
    }

    closeUpload();
    setTitle(""); setCaption("");
    setPicked(null); setCompressed(null); setBlob(null); setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
    setArtistTab("feed" as any);
    showToast(
      type === "song" && compressed
        ? `🎉 "${title.trim()}" is LIVE (compressed to ${fmtMB(bytes)}) — now at the top of the Feed, Discover and Charts!`
        : `🎉 "${title.trim()}" is LIVE — it's now at the top of the Feed, Discover and Charts!`
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 350, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={busy ? undefined : closeUpload}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "linear-gradient(180deg,#0C1730 0%,#070E1C 100%)", borderRadius: "28px 28px 0 0", padding: "24px 20px 32px", border: "1px solid rgba(56,189,248,0.2)", animation: "sheet-up 0.3s cubic-bezier(0.2,0.8,0.2,1)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 18px" }} />

        <div style={{ fontSize: 20, fontWeight: 900, color: "#EDF4FF", marginBottom: 4 }}>
          {type === "song" ? "🎵 Upload a Song" : "🎬 Upload a Video"}
        </div>
        <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20, lineHeight: 1.5 }}>
          Post your sound to thousands of listeners across Western Uganda. Your track goes live *instantly* at the top of the Feed, Discover and Charts.
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.05em" }}>TITLE</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "song" ? "e.g. Tooro Anthem" : "e.g. Live at Kabarole"} style={{ width: "100%", boxSizing: "border-box", background: "var(--surf)", border: "1.5px solid var(--bd)", borderRadius: 13, padding: "12px 14px", fontSize: 14, color: "#fff", marginBottom: 14, outline: "none" }} />

        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.05em" }}>GENRE</label>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
          {GENRES.filter((g) => g.name !== "All").map((g) => (
            <button key={g.name} onClick={() => setGenre(g.name)} className="pill pressable" style={{ background: genre === g.name ? `${g.color}30` : "var(--surf)", borderColor: genre === g.name ? `${g.color}70` : "var(--bd)", color: genre === g.name ? g.color : "var(--t2)" }}>
              <span>{g.icon}</span><span>{g.name}</span>
            </button>
          ))}
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.05em" }}>CAPTION & HASHTAGS</label>
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe your track… add #hashtags" style={{ width: "100%", boxSizing: "border-box", background: "var(--surf)", border: "1.5px solid var(--bd)", borderRadius: 13, padding: "12px 14px", fontSize: 13.5, color: "#fff", marginBottom: 8, outline: "none" }} />
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
          {CAPTION_CHIPS.map((c) => (
            <button key={c} onClick={() => setCaption((caption + " " + c).trim().replace(/\s+/g, " "))} className="pill pressable" style={{ background: "var(--surf)", borderColor: "var(--bd)", color: "var(--t2)", fontSize: 11 }}>{c}</button>
          ))}
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.05em" }}>{type === "song" ? "AUDIO FILE (MP3/WAV/M4A)" : "VIDEO FILE (MP4)"}</label>
        <input ref={fileRef} type="file" accept={type === "song" ? "audio/*" : "video/*"} onChange={onPick} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="pressable" style={{ width: "100%", background: picked ? "rgba(34,211,165,0.1)" : "var(--surf)", border: `1.5px dashed ${picked ? "rgba(34,211,165,0.4)" : "var(--bd)"}`, borderRadius: 13, padding: "16px 14px", fontSize: 13, fontWeight: 700, color: picked ? "#22D3A5" : "var(--t2)", opacity: busy ? 0.7 : 1 }}>
          {!picked ? `＋ Choose file from device` : `✓ ${picked.name}`}
        </button>

        {picked && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--t2)", background: "var(--surf)", border: "1px solid var(--bd)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: busy || !compressed ? 6 : 0 }}>
              <span>{busy ? `⏳ Compressing… ${progress}%` : compressed ? `✅ Ready to play — ${fmtMB(compressed.size)}` : "Attached"}</span>
              {picked && !busy && <span style={{ color: "var(--t2)" }}>original {fmtMB(picked.size)}</span>}
            </div>
            {(busy || compressed) && (
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${busy ? progress : 100}%`, height: "100%", background: "linear-gradient(90deg,#38BDF8,#2DD4BF)", transition: "width 0.25s ease" }} />
              </div>
            )}
            {compressed && !busy && (
              <div style={{ marginTop: 6, color: "#22D3A5" }}>
                Compressed ~{Math.max(1, Math.round((1 - compressed.size / Math.max(1, picked.size)) * 100))}% smaller · 96kbps MP3{compressed.duration ? ` · ${fmtTime(compressed.duration)}` : ""}
              </div>
            )}
            {err && <div style={{ marginTop: 6, color: "#F59E0B" }}>{err}</div>}
          </div>
        )}

        <button onClick={submit} disabled={busy} className="pressable" style={{ width: "100%", marginTop: 20, background: "linear-gradient(135deg,#38BDF8,#3B82F6,#818CF8)", borderRadius: 14, padding: "14px 0", fontSize: 14, fontWeight: 900, color: "#fff", boxShadow: "0 8px 28px rgba(56,189,248,0.4)", opacity: busy ? 0.6 : 1 }}>
          {busy ? `Compressing… ${progress}%` : "Post Now 🚀"}
        </button>
      </div>
    </div>
  );
}
