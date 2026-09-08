import { useAppStore } from "../store/appStore";

const TABS = [
  { id: "home",     icon: "⊞",  label: "Home"    },
  { id: "discover", icon: "◎",  label: "Discover" },
  { id: "shazam",   icon: null,  label: "Identify" }, // special center button
  { id: "trending", icon: "▲",  label: "Charts"  },
  { id: "artist",   icon: "🎤", label: "Artist"  },
] as const;

interface Props {
  onShazam: () => void;
}

export function BottomNav({ onShazam }: Props) {
  const { page, setPage } = useAppStore();

  return (
    <nav
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(7,7,15,0.92)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom,0)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      {TABS.map((t) => {
        // ── Special Shazam centre button ──────────────────────────────
        if (t.id === "shazam") {
          return (
            <button
              key="shazam"
              onClick={onShazam}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3,
                padding: "0 4px 6px", position: "relative", marginBottom: 0,
              }}
            >
              {/* Floating circle that lifts above nav */}
              <div style={{
                width: 54, height: 54, borderRadius: "50%",
                background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(155,109,255,0.55), 0 8px 24px rgba(0,0,0,0.5)",
                marginTop: -20, // lifts above the nav bar
                border: "3px solid rgba(7,7,15,0.9)",
                flexShrink: 0,
                transition: "transform 0.15s",
              }}>
                {/* S-wave icon */}
                <svg width="26" height="26" viewBox="0 0 44 44" fill="none">
                  <path d="M28 13C26 11.5 23 11 20.5 12C17 13.5 15.5 17 17 20L20 23C22 25 21.5 28 19 29C17 30 14.5 29 13 27"
                    stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <path d="M16 31C18 32.5 21 33 23.5 32C27 30.5 28.5 27 27 24L24 21C22 19 22.5 16 25 15C27 14 29.5 15 31 17"
                    stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: "#9B6DFF" }}>
                IDENTIFY
              </span>
            </button>
          );
        }

        const active = page === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setPage(t.id as any)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, padding: "10px 4px 8px",
              position: "relative", transition: "all 0.2s",
            }}
          >
            {active && (
              <span style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 3, borderRadius: "0 0 4px 4px",
                background: "linear-gradient(90deg,#9B6DFF,#FF6BA8)",
              }} />
            )}
            <span style={{
              fontSize: 18, transition: "transform 0.2s",
              transform: active ? "scale(1.15)" : "scale(1)",
              filter: active ? "none" : "grayscale(0.4) opacity(0.5)",
            }}>{t.icon}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
              color: active ? "#C4A1FF" : "rgba(255,255,255,0.3)",
              transition: "color 0.2s",
            }}>{(t.label as string).toUpperCase()}</span>
          </button>
        );
      })}
    </nav>
  );
}
