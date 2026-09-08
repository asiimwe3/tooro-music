import { useState } from "react";
import { useAppStore } from "../store/appStore";
import { GENRES } from "../data/mock";

export function UploadModal() {
  const { uploadModal, closeUpload, showToast, user, setAuthModal } = useAppStore();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Afrobeat");
  const [file, setFile] = useState<string>("");

  if (uploadModal === "none") return null;
  const type = uploadModal; // "song" | "video"

  function submit() {
    if (!user) { closeUpload(); setAuthModal("login"); return; }
    if (!title.trim()) { showToast("Please enter a title"); return; }
    closeUpload();
    setTitle("");
    setFile("");
    showToast(`${type === "song" ? "Song" : "Video"} "${title}" received — our team reviews uploads within 48 hours.`);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 350, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={closeUpload}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "linear-gradient(180deg,#141028 0%,#0B0918 100%)", borderRadius: "28px 28px 0 0", padding: "24px 20px 32px", border: "1px solid rgba(155,109,255,0.2)", animation: "sheet-up 0.3s cubic-bezier(0.2,0.8,0.2,1)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 18px" }} />

        <div style={{ fontSize: 20, fontWeight: 900, color: "#F0F0FF", marginBottom: 4 }}>
          {type === "song" ? "🎵 Upload a Song" : "🎬 Upload a Video"}
        </div>
        <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20, lineHeight: 1.5 }}>
          Reach thousands of listeners across Western Uganda. Uploads are reviewed within 48 hours.
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

        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.05em" }}>{type === "song" ? "AUDIO FILE (MP3/WAV)" : "VIDEO FILE (MP4)"}</label>
        <button onClick={() => setFile(type === "song" ? "track-demo.mp3" : "video-demo.mp4")} className="pressable" style={{ width: "100%", background: file ? "rgba(34,211,165,0.1)" : "var(--surf)", border: `1.5px dashed ${file ? "rgba(34,211,165,0.4)" : "var(--bd)"}`, borderRadius: 13, padding: "16px 14px", fontSize: 13, fontWeight: 700, color: file ? "#22D3A5" : "var(--t2)" }}>
          {file ? `✓ ${file} attached` : "＋ Choose file from device"}
        </button>

        <button onClick={submit} className="pressable" style={{ width: "100%", marginTop: 20, background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 14, padding: "14px 0", fontSize: 14, fontWeight: 900, color: "#fff", boxShadow: "0 8px 28px rgba(155,109,255,0.4)" }}>
          Submit for Review
        </button>
      </div>
    </div>
  );
}
