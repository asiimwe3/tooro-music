import { useAppStore } from "../store/appStore";

export function Toast() {
  const { toast } = useAppStore();
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed", bottom: 110, left: "50%", transform: "translateX(-50%)",
        zIndex: 400, maxWidth: "90vw",
        background: "rgba(20,12,40,0.95)", border: "1px solid rgba(155,109,255,0.35)",
        borderRadius: 14, padding: "10px 18px", fontSize: 12.5, fontWeight: 700, color: "#E8DFFF",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)",
        textAlign: "center", animation: "toast-in 0.25s ease-out",
      }}
    >
      {toast}
    </div>
  );
}
