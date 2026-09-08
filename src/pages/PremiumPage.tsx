import { useAppStore } from "../store/appStore";
import { PREM_PLANS, ARTIST_PLANS } from "../data/mock";

export function PremiumPage() {
  const { openPayment, user, setAuthModal } = useAppStore();

  return (
    <div className="page">
      <div style={{ padding: "26px 16px 10px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>👑</span>
          <span style={{ fontSize: 10.5, fontWeight: 900, color: "#F59E0B", letterSpacing: "0.1em" }}>TOORO PREMIUM</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#F0F0FF", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Listen like <span className="grad-text">royalty</span>
        </h1>
        <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
          Ad-free music, offline listening, and HD audio. Pay with MTN MoMo or Airtel Money.
        </p>
      </div>

      {/* Listener plans */}
      <div style={{ padding: "20px 16px 6px" }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
          {PREM_PLANS.map((p, i) => (
            <div key={p.id} className="glass-card" style={{ padding: 20, border: i === 0 ? "1.5px solid rgba(155,109,255,0.5)" : undefined, position: "relative" }}>
              {i === 0 && <div style={{ position: "absolute", top: -9, right: 14, background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 100, fontSize: 8.5, fontWeight: 900, color: "#fff", padding: "3px 9px", letterSpacing: "0.05em" }}>BEST VALUE</div>}
              <div style={{ fontSize: 15, fontWeight: 900, color: "#F0F0FF", marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#C4A1FF", marginBottom: 12 }}>
                UGX {p.price.toLocaleString()}
                <span style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 600 }}>/{p.period}</span>
              </div>
              {p.features.map((f) => (
                <div key={f} style={{ fontSize: 11.5, color: "var(--t2)", fontWeight: 600, marginBottom: 6 }}>✓ {f}</div>
              ))}
              <button onClick={() => openPayment(`Premium ${p.name}`, p.price, p.id)} className="pressable" style={{ width: "100%", marginTop: 10, background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 12, padding: "11px 0", fontSize: 12.5, fontWeight: 900, color: "#fff", border: "none", boxShadow: "0 6px 20px rgba(155,109,255,0.35)" }}>
                Get {p.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Why premium */}
      <div style={{ padding: "22px 16px 6px" }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#F0F0FF", marginBottom: 12 }}>Everything you get</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
          {[
            { icon: "🚫", title: "Zero ads", desc: "Nonstop music, nothing between you and the sound." },
            { icon: "⬇", title: "Offline mode", desc: "Download tracks over Wi-Fi, play them anywhere in Tooro." },
            { icon: "🎧", title: "HD audio", desc: "320kbps streams — hear every drum and guitar string." },
            { icon: "⚡", title: "Early access", desc: "New releases from Tooro artists land for you first." },
          ].map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#F0F0FF", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Artist plans */}
      <div style={{ padding: "26px 16px 10px" }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#F0F0FF", marginBottom: 4 }}>🎤 For Artists</div>
        <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 14, lineHeight: 1.5 }}>Upload unlimited music, unlock analytics, and earn from your fans.</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
          {ARTIST_PLANS.map((p) => (
            <div key={p.id} className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#F0F0FF", marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#C4A1FF", marginBottom: 8 }}>UGX {p.price.toLocaleString()}<span style={{ fontSize: 10, color: "var(--t3)" }}>/mo</span></div>
              {p.features.slice(0, 3).map((f) => (
                <div key={f} style={{ fontSize: 10.5, color: "var(--t2)", fontWeight: 600, marginBottom: 4 }}>✓ {f}</div>
              ))}
              <button onClick={() => openPayment(`${p.name} Artist Plan`, p.price, p.id)} className="pressable" style={{ width: "100%", marginTop: 8, background: "rgba(155,109,255,0.15)", border: "1.5px solid rgba(155,109,255,0.35)", borderRadius: 10, padding: "9px 0", fontSize: 11, fontWeight: 800, color: "#C4A1FF" }}>
                Choose {p.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "8px 20px 20px", fontSize: 10.5, color: "var(--t3)", fontWeight: 600, lineHeight: 1.6 }}>
        Payments are processed securely via mobile money. Cancel anytime.
        Questions? Message us on WhatsApp — +256 762 306 675.
      </div>
    </div>
  );
}
