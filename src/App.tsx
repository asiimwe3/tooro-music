import { useState } from "react";
import { useAppStore } from "./store/appStore";
import { useIsDesktop } from "./hooks/useIsDesktop";
import { BottomNav } from "./components/BottomNav";
import { MiniPlayer } from "./components/MiniPlayer";
import { Toast } from "./components/Toast";
import { UploadModal } from "./components/UploadModal";
import { PaymentModal } from "./components/PaymentModal";
import { SideMenu } from "./components/SideMenu";
import { AuthModal } from "./components/AuthModal";
import { ShazamModal } from "./components/ShazamModal";
import { HomePage } from "./pages/HomePage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { TrendingPage } from "./pages/TrendingPage";
import { ArtistPage } from "./pages/artist/ArtistPage";
import { PremiumPage } from "./pages/PremiumPage";

export default function App() {
  const { page } = useAppStore();
  const [showShazam, setShowShazam] = useState(false);
  const isDesktop = useIsDesktop();

  const pages = (
    <>
      {page === "home"     && <HomePage />}
      {page === "discover" && <DiscoverPage />}
      {page === "trending" && <TrendingPage />}
      {page === "artist"   && <ArtistPage />}
      {page === "premium"  && <PremiumPage />}
    </>
  );

  const overlays = (
    <>
      <AuthModal />
      <MiniPlayer />
      <UploadModal />
      <PaymentModal />
      <Toast />
      {showShazam && <ShazamModal onClose={() => setShowShazam(false)} />}
    </>
  );

  // ── Desktop: full-screen layout with persistent sidebar ──────────────
  if (isDesktop) {
    return (
      <div className="desktop-shell" style={{ background: "transparent", minHeight: "100vh", color: "#fff" }}>
        <SideMenu persistent onIdentify={() => setShowShazam(true)} />
        <main className="main-col">
          {pages}
          {overlays}
        </main>
      </div>
    );
  }

  // ── Mobile: original app shell ───────────────────────────────────────
  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "#fff", paddingBottom: 172 }}>
      <SideMenu />
      <AuthModal />
      {pages}
      <MiniPlayer />
      <BottomNav onShazam={() => setShowShazam(true)} />
      {overlays}
    </div>
  );
}
