#!/usr/bin/env python3
"""Refresh Tooro Music catalog from Deezer public API (30s previews).
Run monthly so preview URLs stay valid."""
import json, re, time, urllib.request

ARTIST_SEEDS = [
    ("fik_fameica","Fik Fameica","Afrobeat"),("winnie_nwagi","Winnie Nwagi","Afropop"),
    ("azawi","Azawi","Afrofusion"),("king_saha","King Saha","Ragga"),
    ("ziza_bafana","Ziza Bafana","Dancehall"),("jose_chameleone","Jose Chameleone","Afrobeat"),
    ("bebe_cool","Bebe Cool","Afropop"),("eddy_kenzo","Eddy Kenzo","Afrobeat"),
    ("spice_diana","Spice Diana","Afropop"),("vinka","Vinka","Afropop"),
    ("david_lutalo","David Lutalo","Afrobeat"),("rema_namakula","Rema Namakula","Afropop"),
    ("john_blaq","John Blaq","Afrobeat"),
]
PER_ARTIST = 6
GENRE_COLORS = {"Afrobeat":"#8B5CF6","Afropop":"#EC4899","Afrofusion":"#8B5CF6","Ragga":"#FBBF24","Dancehall":"#F59E0B"}

def dget(url):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    return json.load(urllib.request.urlopen(req, timeout=15))

def fmt_dur(s): return f"{int(s)//60}:{int(s)%60:02d}"
def fmt_plays(rank):
    m = rank/1000000
    if m >= 1: return f"{round(m,1)}M"
    return f"{max(1,round(rank/1000))}K"

songs, artists = [], []
for aid, name, genre in ARTIST_SEEDS:
    try:
        res = dget(f"https://api.deezer.com/search?q={urllib.request.quote(name)}&limit=25")
        tracks = [t for t in res.get("data",[]) if t.get("preview") and t.get("artist",{}).get("name","").lower()==name.lower()][:PER_ARTIST]
        if len(tracks) < PER_ARTIST:
            tracks += [t for t in res.get("data",[]) if t.get("preview") and t not in tracks][:PER_ARTIST-len(tracks)]
    except Exception as e:
        print("WARN", name, e); continue
    img = tracks[0]["artist"]["picture_xl"] if tracks else ""
    ar = dget(f"https://api.deezer.com/search/artist?q={urllib.request.quote(name)}&limit=1)")
    followers = ar.get("data",[{}])[0].get("nb_fan",3000) if ar.get("data") else 3000
    artists.append({
        "id": aid, "name": name, "genre": genre, "imageUrl": img,
        "color": GENRE_COLORS.get(genre,"#8B5CF6"), "songs": len(tracks),
        "followers": f"{max(1,round(followers/1000))}K",
        "monthlyListeners": f"{max(10,round(sum(t['rank'] for t in tracks)/1000))}K",
        "verified": True, "bio": f"{name} — {genre} artist from Uganda, streaming on Tooro Music.",
        "location": "Uganda"})
    for i, t in enumerate(tracks, 1):
        songs.append({
            "id": str(len(songs)+1), "title": t["title"], "artist": t["artist"]["name"],
            "artistId": aid, "genre": genre, "duration": fmt_dur(t["duration"]),
            "plays": fmt_plays(t["rank"]), "audioUrl": t["preview"],
            "coverUrl": t["album"]["cover_big"],
            "color": GENRE_COLORS.get(genre,"#8B5CF6"),
            "album": t["album"]["title"], "seed": f"{aid}-{i}"})
    time.sleep(0.4)

GENRES = []; PLAYLISTS = []
src_old = open("src/data/mock.ts").read()
for g in re.findall(r'\{[^{]*?"name":\s*"([^"]+)"[^{]*?"genre"\s*:\s*"([^"]*)"[^}]*?\}', src_old):
    pass  # genres rebuilt below

# keep GENRES + PLAYLISTS blocks from old file if present
m1 = re.search(r'export const GENRES[\s\S]*?(?=\nexport const)', src_old)
m2 = re.search(r'export const PLAYLISTS[\s\S]*?(?=\nexport const ARTISTS)', src_old)
out = "// Auto-generated from Deezer public API — real Ugandan music, 30s previews\n// Regenerate by running scripts/fetch-deezer.py\n\nexport const SONGS = "
out += json.dumps(songs, indent=2, ensure_ascii=False).replace('": ', '": ') + " as any;\n\n"
if m1: out += m1.group(0) + "\n\n"
if m2: out += m2.group(0) + "\n\n"
out += "export const ARTISTS = " + json.dumps(artists, indent=2, ensure_ascii=False) + " as any;\n"
open("src/data/mock.ts","w").write(out)
print(f"OK songs={len(songs)} artists={len(artists)}")
