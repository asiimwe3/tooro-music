import { useEffect, useState } from "react";

/**
 * Install prompt — asks the visitor to install Tooro Music as an app.
 * Uses the native beforeinstallprompt flow (Chrome/Android/Desktop) and
 * shows manual instructions on iOS Safari. Re-asks 3 days after dismissal.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return; // already installed

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    const ask = () => {
      const dismissedAt = Number(localStorage.getItem("tm_install_dismissed") || 0);
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;
      setShow(true);
    };
    const t = setTimeout(ask, 2500);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true); // prompt capability just arrived
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", () => setShow(false));
    return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", onBip); };
  }, []);

  const close = () => {
    setShow(false);
    localStorage.setItem("tm_install_dismissed", String(Date.now()));
  };

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome) setShow(false);
      setDeferred(null);
    } else {
      close();
    }
  };

  if (!show) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(3,6,14,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16, animation: "fadeIn 0.25s ease" }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 24, background: "linear-gradient(160deg,#0B1526,#060B14)", border: "1px solid rgba(56,189,248,0.25)", boxShadow: "0 -10px 60px rgba(6,182,212,0.25), 0 20px 60px rgba(0,0,0,0.6)", padding: 20, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 12px", background: "linear-gradient(135deg,#06B6D4,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 8px 28px rgba(6,182,212,0.5)" }}>🎵</div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: "#EAF2FF" }}>Install Tooro Music</div>
        <div style={{ fontSize: 12.5, color: "var(--t2)", marginTop: 6, lineHeight: 1.5 }}>
          {isIOS
            ? "Tap the Share button, then choose “Add to Home Screen” for the full app experience."
            : "Get the full app on your home screen — faster, offline-ready, and no browser bar."}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={close} className="pressable" style={{ flex: 1, padding: "13px 0", borderRadius: 14, fontSize: 13, fontWeight: 800, background: "var(--surf)", border: "1px solid var(--bd)", color: "var(--t2)" }}>Not now</button>
          {!isIOS && (
            <button onClick={install} className="pressable" style={{ flex: 1.6, padding: "13px 0", borderRadius: 14, fontSize: 13, fontWeight: 900, background: "linear-gradient(135deg,#38BDF8,#164E63)", color: "#fff", boxShadow: "0 6px 20px rgba(56,189,248,0.4)" }}>📲 Install App</button>
          )}
        </div>
      </div>
    </div>
  );
}
