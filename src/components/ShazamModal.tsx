import { useState, useRef, useCallback } from "react";

type RecognitionState = "idle" | "listening" | "processing" | "found" | "not_found" | "error";

interface ShazamResult {
  artist: string;
  title: string;
  album: string;
  release_date: string;
  label?: string;
  song_link?: string;
  timecode?: string;
  cover?: string;
  preview?: string;
  deezer_id?: number;
}

interface Props {
  onClose: () => void;
}

export function ShazamModal({ onClose }: Props) {
  const [state, setState] = useState<RecognitionState>("idle");
  const [result, setResult] = useState<ShazamResult | null>(null);
  const [error, setError] = useState("");
  const [dots, setDots] = useState(0);
  const [ripple, setRipple] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const dotsTimerRef = useRef<number | null>(null);
  const rippleTimerRef = useRef<number | null>(null);

  const stopAll = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (dotsTimerRef.current) clearInterval(dotsTimerRef.current);
    if (rippleTimerRef.current) clearInterval(rippleTimerRef.current);
  }, []);

  const recognize = useCallback(async () => {
    setState("listening");
    setResult(null);
    setError("");
    setRipple(true);
    chunksRef.current = [];

    // Animate dots
    dotsTimerRef.current = window.setInterval(() => setDots(d => (d + 1) % 4), 500);
    rippleTimerRef.current = window.setInterval(() => setRipple(r => !r), 800);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      mr.onstop = async () => {
        stopAll();
        setState("processing");
        setRipple(false);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        try {
          const formData = new FormData();
          formData.append("file", blob, "shazam.webm");
          formData.append("api_token", "43ff42e49e94658053bb77084cbe49bd");
          formData.append("return", "deezer");

          const res = await fetch("https://api.audd.io/", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          if (data.status === "success" && data.result) {
            const r = data.result;
            const deezer = r.deezer;
            setResult({
              artist: r.artist,
              title: r.title,
              album: r.album,
              release_date: r.release_date,
              label: r.label,
              song_link: r.song_link,
              timecode: r.timecode,
              cover: deezer?.album?.cover_xl || deezer?.album?.cover_big || "",
              preview: deezer?.preview || "",
              deezer_id: deezer?.id,
            });
            setState("found");
          } else {
            setState("not_found");
          }
        } catch {
          setState("error");
          setError("Recognition failed. Check your connection.");
        }
      };

      mr.start();

      // Record for 8 seconds then stop
      setTimeout(() => {
        if (mr.state !== "inactive") mr.stop();
      }, 8000);

    } catch (e: any) {
      stopAll();
      setState("error");
      setError(
        e.name === "NotAllowedError"
          ? "Microphone access denied. Please allow mic access and try again."
          : "Could not access microphone."
      );
    }
  }, [stopAll]);

  const reset = () => {
    stopAll();
    setState("idle");
    setResult(null);
    setError("");
    setDots(0);
    setRipple(false);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(4,4,12,0.97)",
        backdropFilter: "blur(24px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Close */}
      <button
        onClick={() => { stopAll(); onClose(); }}
        style={{
          position: "absolute", top: 20, right: 20,
          width: 40, height: 40, borderRadius: 12,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#aaa", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >✕</button>

      {/* Header */}
      <div style={{ marginBottom: 8, textAlign: "center" }}>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: "0.14em",
          color: "#9B6DFF", textTransform: "uppercase", marginBottom: 4,
        }}>Tooro Shazam</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#F0F0FF" }}>
          {state === "idle" && "Identify Any Song"}
          {state === "listening" && `Listening${".".repeat(dots)}`}
          {state === "processing" && "Recognizing..."}
          {state === "found" && "Song Found! 🎉"}
          {state === "not_found" && "No Match Found"}
          {state === "error" && "Oops!"}
        </div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
          {state === "idle" && "Tap the button & hold your phone near the music"}
          {state === "listening" && "Hold your phone near the music playing..."}
          {state === "processing" && "Matching against 10M+ songs..."}
          {state === "found" && "We identified the track!"}
          {state === "not_found" && "Try again with more of the song playing"}
          {state === "error" && error}
        </div>
      </div>

      {/* Main button / result */}
      {(state === "idle" || state === "listening" || state === "processing") && (
        <div style={{ margin: "40px 0", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Ripple rings */}
          {(state === "listening") && (
            <>
              <div className="shazam-ring" style={{ width: 180, height: 180, animationDelay: "0s" }} />
              <div className="shazam-ring" style={{ width: 220, height: 220, animationDelay: "0.4s" }} />
              <div className="shazam-ring" style={{ width: 260, height: 260, animationDelay: "0.8s" }} />
            </>
          )}

          {/* Main circle */}
          <button
            onClick={state === "idle" ? recognize : undefined}
            disabled={state !== "idle"}
            style={{
              width: 140, height: 140, borderRadius: "50%",
              background: state === "listening"
                ? "linear-gradient(135deg,#9B6DFF,#FF6BA8)"
                : state === "processing"
                ? "linear-gradient(135deg,#1E1E3F,#2D1B69)"
                : "linear-gradient(135deg,#9B6DFF,#5B21B6)",
              border: "none",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 4,
              cursor: state === "idle" ? "pointer" : "default",
              boxShadow: state === "listening"
                ? "0 0 60px rgba(155,109,255,0.6), 0 0 120px rgba(255,107,168,0.3)"
                : "0 12px 40px rgba(155,109,255,0.4)",
              transition: "all 0.3s ease",
              position: "relative", zIndex: 2,
              transform: state === "listening" ? "scale(1.05)" : "scale(1)",
            }}
          >
            {state === "processing" ? (
              <div style={{ width: 36, height: 36, border: "3px solid rgba(155,109,255,0.2)", borderTopColor: "#9B6DFF", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <>
                {/* Shazam-style S icon */}
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <circle cx="22" cy="22" r="21" fill="white" fillOpacity="0.15" />
                  <path d="M28 13C26 11.5 23 11 20.5 12C17 13.5 15.5 17 17 20L20 23C22 25 21.5 28 19 29C17 30 14.5 29 13 27" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 31C18 32.5 21 33 23.5 32C27 30.5 28.5 27 27 24L24 21C22 19 22.5 16 25 15C27 14 29.5 15 31 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  {state === "idle" ? "TAP TO LISTEN" : "LISTENING"}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Result card */}
      {state === "found" && result && (
        <div style={{
          width: "100%", maxWidth: 360,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(155,109,255,0.2)",
          borderRadius: 24,
          padding: 20,
          marginTop: 16,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          {/* Cover art */}
          <div style={{ position: "relative" }}>
            {result.cover ? (
              <img src={result.cover} alt={result.title}
                style={{ width: 140, height: 140, borderRadius: 20, objectFit: "cover", boxShadow: "0 16px 48px rgba(155,109,255,0.35)" }} />
            ) : (
              <div style={{ width: 140, height: 140, borderRadius: 20, background: "linear-gradient(135deg,#9B6DFF,#FF6BA8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🎵</div>
            )}
            {/* Verified badge */}
            <div style={{
              position: "absolute", bottom: -8, right: -8,
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#9B6DFF,#5B21B6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: "0 4px 12px rgba(155,109,255,0.5)",
            }}>✓</div>
          </div>

          {/* Song info */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#F0F0FF", letterSpacing: "-0.02em" }}>{result.title}</div>
            <div style={{ fontSize: 15, color: "#9B6DFF", fontWeight: 700, marginTop: 4 }}>{result.artist}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{result.album} · {result.release_date?.slice(0, 4)}</div>
            {result.label && <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{result.label}</div>}
          </div>

          {/* Preview audio if available */}
          {result.preview && (
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: 11, color: "#555", textAlign: "center", marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em" }}>30-SECOND PREVIEW</div>
              <audio
                controls
                src={result.preview}
                style={{ width: "100%", borderRadius: 12, height: 36, accentColor: "#9B6DFF" }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            {result.song_link && (
              <a
                href={result.song_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: "12px 8px", borderRadius: 14, textAlign: "center",
                  background: "linear-gradient(135deg,#9B6DFF,#5B21B6)",
                  color: "#fff", fontSize: 13, fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(155,109,255,0.35)",
                }}
              >🔗 Open Link</a>
            )}
            <button
              onClick={reset}
              style={{
                flex: 1, padding: "12px 8px", borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#aaa", fontSize: 13, fontWeight: 700,
              }}
            >🔄 Try Again</button>
          </div>
        </div>
      )}

      {/* Not found / error actions */}
      {(state === "not_found" || state === "error") && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 64 }}>{state === "not_found" ? "🎵" : "😔"}</div>
          <button
            onClick={reset}
            style={{
              padding: "14px 40px", borderRadius: 16,
              background: "linear-gradient(135deg,#9B6DFF,#5B21B6)",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 800,
              boxShadow: "0 8px 24px rgba(155,109,255,0.4)",
            }}
          >Try Again</button>
        </div>
      )}

      {/* Tips */}
      {state === "idle" && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 }}>
          {[
            { icon: "🎧", text: "Works with any music playing around you" },
            { icon: "📡", text: "10M+ songs in the database" },
            { icon: "🇺🇬", text: "Finds Ugandan music too!" },
          ].map(t => (
            <div key={t.text} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.03)", borderRadius: 12,
              padding: "10px 14px", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ fontSize: 13, color: "#666" }}>{t.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* CSS for rings and spinner */}
      <style>{`
        .shazam-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(155, 109, 255, 0.25);
          animation: shazam-pulse 1.8s ease-out infinite;
        }
        @keyframes shazam-pulse {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1);   opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
