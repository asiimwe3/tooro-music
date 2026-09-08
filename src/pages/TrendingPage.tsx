import { useAppStore } from "../store/appStore";
import { CoverArt } from "../components/CoverArt";
import { SONGS, GENRES } from "../data/mock";
import { useState } from "react";

export function TrendingPage() {
  const { playSong, currentSong, isPlaying, selectedGenre, setSelectedGenre } = useAppStore();
  const [range, setRange] = useState<"today" | "week" | "month">("week");

  // Rank songs by plays for the chart
  const ranked = [...SONGS]
    .sort((a, b) => parseInt(b.plays.replace(/\D/g, "")) - parseInt(a.plays.replace(/\D/g, "")))
    .filter((s) => !selectedGenre || s.genre === selectedGenre)
    .slice(0, 25);

  return (
    <div className="page">
      <div className="glass-dk sticky top-0 z-40" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", borderRadius: 0 }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div style={{ fontSize: 16, fontWeight: 900, color: "#F0F0FF" }}>🔥 Charts</div>
          <div style={{ display: "inline-flex", background: "var(--surf)", border: "1px solid var(--bd)", borderRadius: 100, padding: 3 }}>
            {(["today", "week", "month"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className="pressable" style={{ padding: "5px 13px", borderRadius: 100, fontSize: 10.5, fontWeight: 800, background: range === r ? "linear-gradient(135deg,#9B6DFF,#FF6BA8)" : "transparent", color: range === r ? "#fff" : "var(--t2)", border: "none", textTransform: "capitalize" }}>
                {r === "today" ? "Today" : r === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genre filter */}
      <div style={{ padding: "12px 16px 4px" }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ paddingBottom: 4 }}>
          {GENRES.map((g) => {
            const active = selectedGenre === (g.name === "All" ? null : g.name);
            return (
              <button key={g.name} onClick={() => setSelectedGenre(g.name === "All" ? null : g.name)} className="pill pressable" style={{ background: active ? `${g.color}30` : `${g.color}14`, borderColor: active ? `${g.color}70` : `${g.color}35`, color: g.color, fontWeight: active ? 900 : 700 }}>
                <span style={{ fontSize: 14 }}>{g.icon}</span><span>{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart list */}
      <section style={{ padding: "14px 16px 8px" }}>
        <div className="glass-card" style={{ overflow: "hidden" }}>
          {ranked.map((s, i) => {
            const active = currentSong?.id === s.id && isPlaying;
            const move = i < 3 ? "up" : i % 4 === 0 ? "down" : "same";
            return (
              <div key={s.id} className="track-row" onClick={() => playSong(s as any)} style={{ borderBottom: i < ranked.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ width: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: active ? "#9B6DFF" : i < 3 ? s.color : "var(--t3)", fontStyle: active ? "italic" : "normal" }}>{i + 1}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: move === "up" ? "#22D3A5" : move === "down" ? "#FB7185" : "var(--t3)" }}>
                    {move === "up" ? "▲" : move === "down" ? "▼" : "—"}
                  </span>
                </div>
                <CoverArt seed={s.seed} color={s.color} size={46} radius={12} imageUrl={s.coverUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: active ? "#C4A1FF" : "#F0F0FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>{s.artist} · {s.genre}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: s.color, fontWeight: 700 }}>▶ {s.plays}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)" }}>{s.duration}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--t3)", padding: "14px 0 6px", fontWeight: 600 }}>
          Chart positions update every {range === "today" ? "hour" : range === "week" ? "day" : "week"} · The Sound of Western Uganda
        </div>
      </section>
    </div>
  );
}
