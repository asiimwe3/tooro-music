import { useAppStore } from "../store/appStore";
import { signOut } from "../api/firebase";

export function SideMenu() {
  const { sideMenuOpen, setSideMenuOpen, user, setAuthModal, setPage, showToast } = useAppStore();

  function go(page: "home" | "discover" | "trending" | "artist" | "premium") {
    setPage(page);
    setSideMenuOpen(false);
  }

  const items: { icon: string; label: string; action: () => void }[] = [
    { icon: "🏠", label: "Home", action: () => go("home") },
    { icon: "◎", label: "Discover", action: () => go("discover") },
    { icon: "▲", label: "Charts", action: () => go("trending") },
    { icon: "🎤", label: "Artist Hub", action: () => go("artist") },
    { icon: "👑", label: "Go Premium", action: () => go("premium") },
  ];

  const soonItems: { icon: string; label: string }[] = [
    { icon: "🎧", label: "My Library" },
    { icon: "⬇", label: "Downloads" },
    { icon: "⚙", label: "Settings" },
  ];

  return (
    <>
      {sideMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 340, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSideMenuOpen(false)} />
      )}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 290, zIndex: 345,
        background: "linear-gradient(180deg,#171129 0%,#0A0816 100%)",
        borderRight: "1px solid rgba(155,109,255,0.18)",
        transform: sideMenuOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.2,0.8,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "28px 22px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "conic-gradient(from 210deg, #8B5CF6, #D946EF, #F472B6, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 6px 20px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.3)" }}>🎵</div>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: "#F4F1FF" }}>Tooro Music</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3E3E58" }}>Western Uganda</div>
            </div>
          </div>

          {user ? (
            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, background: "var(--surf)", border: "1px solid var(--bd)", borderRadius: 14, padding: "10px 12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#9B6DFF,#5B21B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>
                {user.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#F0F0FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName || "Listener"}</div>
                <div style={{ fontSize: 10, color: "var(--t3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#22D3A5", background: "rgba(34,211,165,0.12)", border: "1px solid rgba(34,211,165,0.3)", borderRadius: 100, padding: "3px 8px" }}>FREE</div>
            </div>
          ) : (
            <button onClick={() => { setSideMenuOpen(false); setAuthModal("login"); }} className="pressable" style={{ marginTop: 18, width: "100%", background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 900, color: "#fff", boxShadow: "0 6px 20px rgba(155,109,255,0.35)" }}>
              Sign In / Create Account
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          {items.map((it) => (
            <button key={it.label} onClick={it.action} className="pressable side-item" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 13, background: "transparent", border: "none", fontSize: 14, fontWeight: 700, color: "var(--t2)", textAlign: "left" }}>
              <span style={{ fontSize: 17, width: 24, textAlign: "center" }}>{it.icon}</span> {it.label}
            </button>
          ))}

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 8px", borderRadius: 2 }} />

          {soonItems.map((it) => (
            <button key={it.label} onClick={() => { showToast(`${it.label} is coming soon — stay tuned!`); setSideMenuOpen(false); }} className="pressable side-item" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 13, background: "transparent", border: "none", fontSize: 14, fontWeight: 700, color: "var(--t3)", textAlign: "left" }}>
              <span style={{ fontSize: 17, width: 24, textAlign: "center" }}>{it.icon}</span> {it.label}
            </button>
          ))}
        </div>

        {user && (
          <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={async () => { await signOut(); setSideMenuOpen(false); showToast("Signed out"); }} className="pressable" style={{ width: "100%", padding: "11px 0", borderRadius: 12, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", fontSize: 13, fontWeight: 800, color: "#FB7185" }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
