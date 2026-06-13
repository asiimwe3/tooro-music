import { CoverArt } from "./CoverArt";
import { useAppStore } from "../store/appStore";
import { SONGS } from "../data/mock";

type Song = (typeof SONGS)[0];

export function SongRow({ song, index }: { song: Song; index: number }) {
  const { playSong, currentSong, isPlaying } = useAppStore();
  const active = currentSong?.id === song.id;
  return (
    <div
      onClick={() => playSong(song)}
      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer relative"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: active ? "rgba(124,58,237,0.12)" : "transparent" }}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r" style={{ background: "#7C3AED" }} />}
      <span className="w-4 text-center text-[9px] font-semibold" style={{ color: active ? "#9D4EDD" : "#55556A" }}>
        {active && isPlaying ? "♫" : index}
      </span>
      <CoverArt seed={song.title} color={song.color} size={44} radius={10} imageUrl={(song as any).coverUrl} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold truncate" style={{ color: active ? "#9D4EDD" : "#fff" }}>{song.title}</div>
        <div className="text-[10px] truncate mt-0.5" style={{ color: "#55556A" }}>{song.artist} · {song.genre}</div>
      </div>
      <span className="text-[9px] flex-shrink-0" style={{ color: "#55556A" }}>{song.duration}</span>
    </div>
  );
}
