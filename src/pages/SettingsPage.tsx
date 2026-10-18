import { useState } from "react";
import { useAppStore } from "../store/appStore";
import { signOut } from "../api/firebase";
import { autoFullEnabled } from "../lib/fullTrack";

const SPEEDS = [0.75, 1, 1.25, 1.5];

export function SettingsPage() {
  const { user, setAuthModal, playbackSpeed, setPlaybackSpeed, showToast, downloads, clearDownloads, favorites, setPage } = useAppStore();
  const [autoFull, setAutoFull] = useState(autoFullEnabled());

  return (
    <div className="page">
      {/* Header */}
      <header className="glass-dk sticky top-0 z-40" style={{ borderRadius: 0 }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: 13, background: "linear-gradient(135deg,#64748B,#334155 55%,#0F172A)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>⚙</div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15.5, fontWeight: 700, color: "#EAF2FF" }}>Settings</div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(148,163,184,0.9)" }}>Your Preferences</div>
            </div>
          </div>
        </div>
      </header>

      {/* Account */}
      <div className="px-4" style={{ paddingTop: 14 }}>
        <div className="glow-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#38BDF8,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, flexShrink: 0 }}>
            {user?.displayName?.charAt(0)?.toUpperCase() || "👤"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "#EDF4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.displayName || "Guest listener"}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || "Not signed in"}</div>
          </div>
          {user ? (
            <span style={{ fontSize: 9, fontWeight: 800, color: user.plan && user.plan !== "free" ? "#FFC53D" : "#22D3A5", background: user.plan && user.plan !== "free" ? "rgba(255,197,61,0.12)" : "rgba(34,211,165,0.12)", border: `1px solid ${user.plan && user.plan !== "free" ? "rgba(255,197,61,0.3)" : "rgba(34,211,165,0.3)"}`, borderRadius: 100, padding: "4px 9px", flexShrink: 0 }}>{(user.plan || "free").toUpperCase()}</span>
          ) : (
            <button onClick={() => setAuthModal("login")} className="pressable btn-grad" style={{ borderRadius: 100, padding: "8px 14px", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>Sign in</button>
          )}
        </div>
      </div>

      {/* Playback */}
      <div className="px-4" style={{ paddingTop: 18 }}>
        <div className="sec-hd"><span className="sec-title">▶ Playback</span></div>
        <div className="glow-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#FF0000,#8B0000)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>▶</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--t2)" }}>Play full songs</div>
              <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>When a full-length version is available, the app switches from the 30s preview to the complete track.</div>
            </div>
            <button onClick={() => { const v = !autoFull; setAutoFull(v); localStorage.setItem("tm_autofull", v ? "1" : "0"); showToast(v ? "Full songs on — plays complete tracks when available" : "Full songs off — previews only"); }} className="pressable" style={{ width: 46, height: 26, borderRadius: 100, background: autoFull ? "linear-gradient(135deg,#38BDF8,#4F46E5)" : "var(--surf)", border: "1px solid var(--bd)", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 3, left: autoFull ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.18s ease" }} />
            </button>
          </div>
          <div style={{ height: 10 }} />
          <div className="glow-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--t2)" }}>Playback speed</div>
          <div className="flex gap-2" style={{ marginTop: 10 }}>
            {SPEEDS.map((s) => (
              <button key={s} onClick={() => { setPlaybackSpeed(s); showToast(`Speed set to ${s}x`); }} className="pressable" style={{ flex: 1, padding: "9px 0", borderRadius: 11, fontSize: 12, fontWeight: 800, background: playbackSpeed === s ? "linear-gradient(135deg,#38BDF8,#4F46E5)" : "var(--surf)", border: playbackSpeed === s ? "none" : "1px solid var(--bd)", color: playbackSpeed === s ? "#fff" : "var(--t2)" }}>{s}x</button>
            ))}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "14px 0" }} />
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--t2)" }}>Audio quality</div>
              <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>Standard (128kbps) · Premium gets 320kbps HD</div>
            </div>
            <button onClick={() => setPage("premium")} className="pressable" style={{ fontSize: 10.5, fontWeight: 800, padding: "7px 12px", borderRadius: 100, background: "rgba(255,197,61,0.12)", border: "1px solid rgba(255,197,61,0.3)", color: "#FFC53D" }}>Upgrade</button>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="px-4" style={{ paddingTop: 18 }}>
        <div className="sec-hd"><span className="sec-title">⬇ Offline storage</span></div>
        <div className="glow-card" style={{ padding: 16 }}>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--t2)" }}>{downloads.length} track{downloads.length === 1 ? "" : "s"} saved offline</div>
              <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>{favorites.length} favorites on this device</div>
            </div>
            {downloads.length > 0 && (
              <button onClick={() => { clearDownloads(); showToast("Offline library cleared"); }} className="pressable" style={{ fontSize: 10.5, fontWeight: 800, padding: "7px 12px", borderRadius: 100, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#FB7185" }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Support & about */}
      <div className="px-4" style={{ paddingTop: 18 }}>
        <div className="sec-hd"><span className="sec-title">💬 Support</span></div>
        <div className="glow-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--t2)" }}>WhatsApp support</div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Message us anytime: <span style={{ color: "#67E8F9", fontWeight: 700 }}>+256 762 306 675</span></div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "14px 0" }} />
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--t2)" }}>Tooro Music</div>
              <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>The Sound of Western Uganda · v1.0</div>
            </div>
            <span style={{ fontSize: 18 }}>🎵</span>
          </div>
        </div>
      </div>

      {/* Sign out */}
      {user && (
        <div className="px-4" style={{ paddingTop: 18 }}>
          <button onClick={async () => { await signOut(); showToast("Signed out"); }} className="pressable" style={{ width: "100%", padding: "12px 0", borderRadius: 14, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", fontSize: 13, fontWeight: 800, color: "#FB7185" }}>Sign Out</button>
        </div>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}
