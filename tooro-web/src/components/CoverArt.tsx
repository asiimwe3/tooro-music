// Smart cover art — uses real album image if available, falls back to generative art
interface Props { seed: string; color: string; size?: number; radius?: number; imageUrl?: string; }

const PATTERNS = [
  (c: string, c2: string) => `<rect width="100" height="100" fill="${c}22"/><circle cx="50" cy="35" r="28" fill="${c}55" opacity="0.8"/><circle cx="70" cy="65" r="18" fill="${c2}66"/><circle cx="28" cy="68" r="14" fill="${c}44"/><path d="M20,80 Q50,45 80,80" stroke="${c2}" stroke-width="2" fill="none" opacity="0.6"/>`,
  (c: string, c2: string) => `<rect width="100" height="100" fill="${c}18"/><polygon points="50,15 85,75 15,75" fill="${c}44"/><circle cx="50" cy="58" r="14" fill="${c2}88"/><rect x="35" y="20" width="30" height="3" rx="2" fill="${c2}66" transform="rotate(-30 50 50)"/>`,
  (c: string, c2: string) => `<rect width="100" height="100" fill="${c}14"/><rect x="10" y="10" width="35" height="35" rx="10" fill="${c}50"/><rect x="55" y="10" width="35" height="35" rx="10" fill="${c2}40"/><rect x="10" y="55" width="35" height="35" rx="10" fill="${c2}35"/><rect x="55" y="55" width="35" height="35" rx="10" fill="${c}45"/>`,
  (c: string, c2: string) => `<rect width="100" height="100" fill="${c}10"/><circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="2" opacity="0.5"/><circle cx="50" cy="50" r="26" fill="none" stroke="${c2}" stroke-width="2" opacity="0.5"/><circle cx="50" cy="50" r="14" fill="${c}66"/><circle cx="50" cy="50" r="5" fill="${c2}"/>`,
  (c: string, c2: string) => `<rect width="100" height="100" fill="${c}12"/><path d="M0,50 Q25,20 50,50 Q75,80 100,50" stroke="${c}" stroke-width="3" fill="none" opacity="0.7"/><path d="M0,65 Q25,35 50,65 Q75,95 100,65" stroke="${c2}" stroke-width="2" fill="none" opacity="0.5"/><circle cx="50" cy="50" r="10" fill="${c}88"/>`,
  (c: string, c2: string) => `<rect width="100" height="100" fill="${c}15"/><path d="M50,10 L90,90 L10,90 Z" fill="${c}30"/><path d="M50,25 L78,78 L22,78 Z" fill="${c2}40"/><circle cx="50" cy="62" r="12" fill="${c}70"/>`,
];

const ACCENT: Record<string, string> = {
  "#9B6DFF":"#FF6BA8","#7C3AED":"#EC4899","#EC4899":"#F59E0B","#10B981":"#9B6DFF",
  "#F59E0B":"#FF6BA8","#6366F1":"#22D3A5","#A855F7":"#F59E0B","#F97316":"#9B6DFF",
  "#06B6D4":"#A855F7","#F43F5E":"#6366F1","#84CC16":"#A855F7","#FF6B35":"#9B6DFF",
  "#8B5CF6":"#FF6BA8","#EC4899":"#F59E0B","#3B82F6":"#22D3A5","#A78BFA":"#FB7185",
};

function hash(s: string) { let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))>>>0; return h; }

export function CoverArt({ seed, color, size = 56, radius = 14, imageUrl }: Props) {
  if (imageUrl) {
    return (
      <div style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", flexShrink: 0, boxShadow: `0 6px 20px ${color}30` }}>
        <img
          src={imageUrl}
          alt={seed}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>
    );
  }

  const h = hash(seed || "default");
  const pat = PATTERNS[h % PATTERNS.length];
  const c2 = ACCENT[color] || "#FF6BA8";
  const gId = `g${h}`;
  const inner = pat(color, c2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
    <defs>
      <linearGradient id="${gId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}CC"/>
        <stop offset="100%" stop-color="${c2}99"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#${gId})"/>
    ${inner}
    <rect width="100" height="100" fill="rgba(0,0,0,0.15)"/>
  </svg>`;

  return (
    <div
      style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", flexShrink: 0, boxShadow: `0 6px 20px ${color}30` }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
