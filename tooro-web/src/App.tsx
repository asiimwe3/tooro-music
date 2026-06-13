import { useAppStore } from "./store/appStore";
import { BottomNav } from "./components/BottomNav";
import { MiniPlayer } from "./components/MiniPlayer";
import { Toast } from "./components/Toast";
import { UploadModal } from "./components/UploadModal";
import { PaymentModal } from "./components/PaymentModal";
import { SideMenu } from "./components/SideMenu";
import { AuthModal } from "./components/AuthModal";
import { HomePage } from "./pages/HomePage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { TrendingPage } from "./pages/TrendingPage";
import { ArtistPage } from "./pages/artist/ArtistPage";
import { PremiumPage } from "./pages/PremiumPage";

export default function App() {
  const { page } = useAppStore();

  return (
    <div style={{ background: "#080811", minHeight: "100vh", color: "#fff", paddingBottom: 150 }}>
      <SideMenu />
      <AuthModal />
      {page === "home" && <HomePage />}
      {page === "discover" && <DiscoverPage />}
      {page === "trending" && <TrendingPage />}
      {page === "artist" && <ArtistPage />}
      {page === "premium" && <PremiumPage />}
      <MiniPlayer />
      <BottomNav />
      <UploadModal />
      <PaymentModal />
      <Toast />
    </div>
  );
}
