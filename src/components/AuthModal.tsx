import { useState } from "react";
import { useAppStore } from "../store/appStore";
import { signInWithEmail, registerWithEmail, signInWithGoogle } from "../api/firebase";

export function AuthModal() {
  const { authModal, setAuthModal, setUser, showToast } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (authModal === "none") return null;
  const isRegister = authModal === "register";

  async function submit() {
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    if (isRegister && !name.trim()) { setError("Enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      const user = isRegister ? await registerWithEmail(email.trim(), password, name.trim()) : await signInWithEmail(email.trim(), password);
      setUser(user);
      setAuthModal("none");
      showToast(isRegister ? `Welcome to Tooro Music, ${user.displayName}!` : `Welcome back, ${user.displayName}!`);
    } catch (e: any) {
      const code = e?.code || "";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) setError("Incorrect email or password.");
      else if (code.includes("email-already-in-use")) setError("That email is already registered — sign in instead.");
      else setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError("");
    setBusy(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      setAuthModal("none");
      showToast(`Welcome, ${user.displayName}!`);
    } catch {
      setError("Google sign-in was cancelled.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 360, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setAuthModal("none")}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "linear-gradient(180deg,#141028 0%,#0B0918 100%)", borderRadius: "28px 28px 0 0", padding: "26px 22px 34px", border: "1px solid rgba(155,109,255,0.2)", animation: "sheet-up 0.3s cubic-bezier(0.2,0.8,0.2,1)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 20px" }} />

        <div style={{ fontSize: 22, fontWeight: 900, color: "#F0F0FF", marginBottom: 4 }}>
          {isRegister ? "Create your account" : "Welcome back"}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--t2)", marginBottom: 22, lineHeight: 1.5 }}>
          {isRegister ? "Join Tooro Music — upload music, build your audience, and get discovered." : "Sign in to like songs, upload music, and go Premium."}
        </div>

        {isRegister && (
          <>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.05em" }}>NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or stage name" style={inputStyle} />
          </>
        )}

        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.05em" }}>EMAIL</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" style={inputStyle} />

        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--t2)", marginBottom: 6, marginTop: 4, letterSpacing: "0.05em" }}>PASSWORD</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="At least 6 characters" style={{ ...inputStyle, marginBottom: 8 }} onKeyUp={(e) => e.key === "Enter" && submit()} />

        {error && (
          <div style={{ fontSize: 12, fontWeight: 700, color: "#FB7185", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, padding: "9px 12px", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={busy} className="pressable" style={{ width: "100%", background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", borderRadius: 14, padding: "14px 0", fontSize: 14, fontWeight: 900, color: "#fff", boxShadow: "0 8px 28px rgba(155,109,255,0.4)", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
        </button>

        <button onClick={google} disabled={busy} className="pressable" style={{ width: "100%", marginTop: 10, background: "var(--surf)", border: "1.5px solid var(--bd)", borderRadius: 14, padding: "12px 0", fontSize: 13.5, fontWeight: 800, color: "#F0F0FF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.6-.2-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.1-7-5.1L1.2 17.3C3.2 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5 14.2a7.4 7.4 0 0 1 0-4.4L1.2 6.7a12 12 0 0 0 0 10.6L5 14.2z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.2 2.8 1.2 6.7L5 9.8c1-3 3.8-5 7-5z"/></svg>
          Continue with Google
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "var(--t3)", fontWeight: 600 }}>
          {isRegister ? "Already have an account?" : "New to Tooro Music?"}{" "}
          <button onClick={() => setAuthModal(isRegister ? "login" : "register")} style={{ background: "none", border: "none", color: "#C4A1FF", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: "var(--surf)",
  border: "1.5px solid var(--bd)", borderRadius: 13, padding: "12px 14px",
  fontSize: 14, color: "#fff", marginBottom: 14, outline: "none",
};
