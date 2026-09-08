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
    <nav className="dock">
      {TABS.map((t) => {
        // ── Special Shazam centre button ──────────────────────────────
        if (t.id === "shazam") {
          return (
            <button
              key="shazam"
              onClick={onShazam}
              className="pressable"
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3,
                padding: "0 4px 6px", position: "relative", marginBottom: 0,
              }}
            >
              {/* Floating circle that lifts above the dock */}
              <div style={{
                width: 58, height: 58, borderRadius: "50%",
                background: "conic-gradient(from 210deg, #8B5CF6, #D946EF, #F472B6, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 26px rgba(217,70,239,0.55), 0 10px 26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
                marginTop: -24, // lifts above the dock
                border: "3px solid rgba(10,8,20,0.95)",
                flexShrink: 0,
                transition: "transform 0.15s",
              }}
              className="glow-pulse"
              >
                {/* S-wave icon */}
                <svg width="26" height="26" viewBox="0 0 44 44" fill="none">
                  <path d="M28 13C26 11.5 23 11 20.5 12C17 13.5 15.5 17 17 20L20 23C22 25 21.5 28 19 29C17 30 14.5 29 13 27"
                    stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <path d="M16 31C18 32.5 21 33 23.5 32C27 30.5 28.5 27 27 24L24 21C22 19 22.5 16 25 15C27 14 29.5 15 31 17"
                    stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.12em", color: "#C4B5FD", marginTop: -2 }}>
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
              position: "relative", transition: "all 0.25s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          >
            {active && (
              <span style={{
                position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
                width: 34, height: 30, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(217,70,239,0.18))",
                border: "1px solid rgba(167,139,250,0.25)",
                boxShadow: "0 0 18px rgba(139,92,246,0.3)",
                transition: "all 0.25s",
              }} />
            )}
            <span style={{
              fontSize: 17, position: "relative",
              transition: "all 0.25s cubic-bezier(0.2,0.8,0.2,1)",
              transform: active ? "translateY(-1px) scale(1.12)" : "scale(1)",
              filter: active ? "drop-shadow(0 0 8px rgba(167,139,250,0.8))" : "grayscale(0.5) opacity(0.45)",
              color: active ? "#C4B5FD" : "rgba(255,255,255,0.4)",
            }}>{t.icon}</span>
            <span style={{
              fontSize: 8.5, fontWeight: 800, letterSpacing: "0.08em", position: "relative",
              color: active ? "#E9D5FF" : "rgba(255,255,255,0.3)",
              transition: "color 0.25s",
            }}>{(t.label as string).toUpperCase()}</span>
          </button>
        );
      })}
    </nav>
  );
}
