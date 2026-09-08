import { useAppStore } from "../store/appStore";

const PLAN_LABELS: Record<string, { name: string; icon: string }> = {
  basic: { name: "Basic Artist", icon: "🎵" },
  pro: { name: "Pro Artist", icon: "⭐" },
  label: { name: "Label Pro Max", icon: "👑" },
  monthly: { name: "Premium Monthly", icon: "👑" },
  annual: { name: "Premium Annual", icon: "👑" },
};

export function PaymentModal() {
  const { pesapalModal, closePayment, payTarget, user, showToast, setAuthModal } = useAppStore();

  if (!pesapalModal || !payTarget) return null;

  const plan = PLAN_LABELS[payTarget.planId || ""] || { name: payTarget.name, icon: "💳" };
  const ref = `TM-${(user?.uid || "GUEST").slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`;

  function payNow() {
    if (!payTarget) return;
    if (!user) { closePayment(); setAuthModal("login"); return; }
    const msg = encodeURIComponent(
      `Tooro Music payment:\n\nPlan: ${plan.name}\nAmount: UGX ${payTarget.amount.toLocaleString()}\nReference: ${ref}\nAccount: ${user.email}\n\nI would like to pay via MTN MoMo / Airtel Money.`
    );
    window.open(`https://wa.me/256762306675?text=${msg}`, "_blank");
    showToast("Continue on WhatsApp to complete your mobile money payment.");
    closePayment();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 370, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={closePayment}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "linear-gradient(180deg,#141028 0%,#0B0918 100%)", borderRadius: "28px 28px 0 0", padding: "26px 22px 34px", border: "1px solid rgba(155,109,255,0.2)", animation: "sheet-up 0.3s cubic-bezier(0.2,0.8,0.2,1)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 20px" }} />

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>{plan.icon}</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: "#F0F0FF" }}>{plan.name}</div>
          <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 4 }}>Reference: {ref}</div>
        </div>

        <div className="glass-card" style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)" }}>Total due</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#C4A1FF" }}>UGX {payTarget.amount.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 600 }}>Billed monthly · Cancel anytime</div>
        </div>

        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 16, textAlign: "center" }}>
          Tap below to continue on WhatsApp. Our team sends a secure MTN MoMo or Airtel Money prompt to complete your subscription.
        </div>

        <button onClick={payNow} className="pressable" style={{ width: "100%", background: "linear-gradient(135deg,#25D366,#128C7E)", borderRadius: 14, padding: "14px 0", fontSize: 14, fontWeight: 900, color: "#fff", boxShadow: "0 8px 28px rgba(37,211,102,0.35)", border: "none" }}>
          💬 Pay via WhatsApp — Mobile Money
        </button>
        <button onClick={closePayment} className="pressable" style={{ width: "100%", marginTop: 10, background: "var(--surf)", border: "1.5px solid var(--bd)", borderRadius: 14, padding: "11px 0", fontSize: 12.5, fontWeight: 800, color: "var(--t2)" }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
