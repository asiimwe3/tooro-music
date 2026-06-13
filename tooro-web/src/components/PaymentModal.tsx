import { useState } from "react";
import { useAppStore } from "../store/appStore";
import { upgradePlan } from "../api/firebase";

// Base44 backend function URL
const PAYMENT_URL = "https://base44.app/api/apps/69ff30768e50f82540c24b7a/functions/pesapalPayment";

const PLAN_LABELS: Record<string, { name: string; color: string; icon: string }> = {
  basic: { name: "Basic Artist", color: "#8B5CF6", icon: "🎵" },
  pro: { name: "Pro Artist", color: "#8B5CF6", icon: "⭐" },
  label: { name: "Label Pro Max", color: "#F59E0B", icon: "👑" },
};

export function PaymentModal() {
  const { pesapalModal, closePayment, payTarget, user, showToast, setUser, setAuthModal } = useAppStore();
  const [step, setStep] = useState<"details" | "processing" | "redirect" | "success">("details");
  const [phone, setPhone] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!pesapalModal || !payTarget) return null;

  const plan = PLAN_LABELS[payTarget.planId || ""] || { name: payTarget.name, color: "#8B5CF6", icon: "💳" };

  async function initiatePayment() {
    if (!user) { setAuthModal("login"); closePayment(); return; }
    setError("");
    setLoading(true);
    try {
      const ref = `TM-${user.uid.slice(-8).toUpperCase()}-${Date.now()}`;
      const res = await fetch(PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payTarget.amount,
          email: user.email,
          description: `Tooro Music ${plan.name} Subscription`,
          reference: ref,
          phone: phone,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "User",
          planId: payTarget.planId,
          callbackUrl: `${window.location.origin}/?payment=success&plan=${payTarget.planId}&uid=${user.uid}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Payment initiation failed");
      setIframeUrl(data.redirect_url);
      setStep("redirect");
    } catch (err: any) {
      setError(err.message || "Failed to connect to payment gateway");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentDone() {
    // Mark plan as upgraded in Firebase
    if (user && payTarget.planId) {
      await upgradePlan(user.uid, payTarget.planId as any);
      setUser({ ...user, plan: payTarget.planId as any, isArtist: true });
    }
    setStep("success");
    setTimeout(() => { closePayment(); setStep("details"); }, 3000);
    showToast(`🎉 ${plan.name} activated!`);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 400, display: "flex", alignItems: "flex-end" }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== "redirect") { closePayment(); setStep("details"); } }}
    >
      <div style={{ width: "100%", background: "#0F0F1A", borderRadius: "24px 24px 0 0", border: "1px solid #1F1F30", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Handle */}
        <div style={{ padding: "12px 24px 0" }}>
          <div style={{ width: 36, height: 4, background: "#1F1F30", borderRadius: 2, margin: "0 auto" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1F1F30" }}>
          <div className="flex items-center gap-3">
            <div style={{ fontSize: 24 }}>{plan.icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: "#4A4A6A" }}>
                UGX {payTarget.amount.toLocaleString()} / year
              </div>
            </div>
          </div>
          {step !== "redirect" && (
            <button onClick={() => { closePayment(); setStep("details"); }} style={{ fontSize: 20, color: "#4A4A6A", padding: 4 }}>✕</button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>

          {/* STEP: Details */}
          {step === "details" && (
            <div>
              {/* Plan summary */}
              <div style={{ background: `${plan.color}0F`, border: `1px solid ${plan.color}30`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 10 }}>✓ What you get:</div>
                {payTarget.planId === "basic" && ["20 songs upload limit", "Full analytics", "Promotion tools", "Payout enabled"].map(f => (
                  <div key={f} style={{ fontSize: 13, color: "#8B8BA8", marginBottom: 5 }}>✓ {f}</div>
                ))}
                {payTarget.planId === "pro" && ["Unlimited uploads", "Advanced analytics", "Priority 24hr review", "All promotion tools", "Featured slot/month", "Video uploads", "Verified badge"].map(f => (
                  <div key={f} style={{ fontSize: 13, color: "#8B8BA8", marginBottom: 5 }}>✓ {f}</div>
                ))}
                {payTarget.planId === "label" && ["Everything in Pro", "Multiple artist profiles", "Account manager", "Custom payout schedule", "Brand partnerships", "Revenue share boost"].map(f => (
                  <div key={f} style={{ fontSize: 13, color: "#8B8BA8", marginBottom: 5 }}>✓ {f}</div>
                ))}
              </div>

              {/* User info */}
              {user && (
                <div style={{ background: "#14141F", border: "1px solid #1F1F30", borderRadius: 14, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#4A4A6A", fontWeight: 700, marginBottom: 6 }}>BILLING ACCOUNT</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{user.displayName}</div>
                  <div style={{ fontSize: 12, color: "#4A4A6A" }}>{user.email}</div>
                </div>
              )}

              {/* Phone (optional for MoMo) */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#4A4A6A", display: "block", marginBottom: 8 }}>📱 MOBILE MONEY NUMBER (optional)</label>
                <input
                  className="inp"
                  type="tel"
                  placeholder="+256 7XX XXX XXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <div style={{ fontSize: 11, color: "#3A3A55", marginTop: 6 }}>For MTN MoMo / Airtel Money direct payment</div>
              </div>

              {error && (
                <div style={{ fontSize: 12, color: "#F43F5E", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "10px 12px", marginBottom: 16 }}>⚠ {error}</div>
              )}

              {/* Payment methods badge */}
              <div className="flex gap-2 mb-20 flex-wrap">
                {["MTN MoMo", "Airtel Money", "Visa", "Mastercard", "Bank"].map(m => (
                  <span key={m} style={{ fontSize: 10, fontWeight: 700, color: "#4A4A6A", background: "#14141F", border: "1px solid #1F1F30", borderRadius: 8, padding: "4px 8px" }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* STEP: PesaPal iframe redirect */}
          {step === "redirect" && (
            <div>
              <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>Secured by PesaPal</div>
                  <div style={{ fontSize: 11, color: "#4A4A6A" }}>Your payment is encrypted & safe</div>
                </div>
              </div>

              {/* PesaPal iframe */}
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #1F1F30", marginBottom: 16, background: "#fff" }}>
                <iframe
                  src={iframeUrl}
                  style={{ width: "100%", height: 480, border: "none", display: "block" }}
                  title="PesaPal Payment"
                  allow="payment"
                />
              </div>

              <button
                onClick={handlePaymentDone}
                style={{ width: "100%", padding: "13px", borderRadius: 14, background: "linear-gradient(135deg,#10B981,#059669)", fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8 }}
              >✅ I've Completed Payment</button>
              <button
                onClick={() => { closePayment(); setStep("details"); }}
                style={{ width: "100%", padding: "11px", borderRadius: 14, background: "#14141F", border: "1px solid #1F1F30", fontSize: 13, fontWeight: 600, color: "#4A4A6A" }}
              >Cancel</button>
            </div>
          )}

          {/* STEP: Success */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>You're all set!</div>
              <div style={{ fontSize: 14, color: "#4A4A6A", marginBottom: 20 }}>{plan.name} is now active on your account.</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#10B981" }}>
                ● Plan Active
              </div>
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        {step === "details" && (
          <div style={{ padding: "0 24px 32px", borderTop: "1px solid #1F1F30", paddingTop: 16 }}>
            {!user ? (
              <button
                onClick={() => { setAuthModal("login"); closePayment(); }}
                style={{ width: "100%", padding: "14px", borderRadius: 14, background: "linear-gradient(135deg,#8B5CF6,#5B21B6)", fontSize: 15, fontWeight: 800, color: "#fff", boxShadow: "0 4px 16px rgba(139,92,246,0.4)" }}
              >Sign In to Subscribe</button>
            ) : (
              <button
                onClick={initiatePayment}
                disabled={loading}
                style={{ width: "100%", padding: "14px", borderRadius: 14, fontSize: 15, fontWeight: 800, color: "#fff", background: loading ? "#3A3A55" : `linear-gradient(135deg,${plan.color},${plan.color}BB)`, boxShadow: loading ? "none" : `0 4px 16px ${plan.color}40`, transition: "all 0.2s" }}
              >
                {loading ? "⏳ Connecting to PesaPal..." : `Pay UGX ${payTarget.amount.toLocaleString()} / year →`}
              </button>
            )}
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#3A3A55" }}>
              🔒 Secured by PesaPal · MTN MoMo · Airtel Money · Cards accepted
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
