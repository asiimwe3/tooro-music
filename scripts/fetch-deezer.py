#!/usr/bin/env python3
"""Refresh Tooro Music catalog from Deezer public API (30s previews).
Run monthly so preview URLs stay valid. Full roster: Uganda + East Africa + Pan-Africa."""
import json, re, time, urllib.request

# (deezer search name, display name, genre, location)
ARTIST_SEEDS = [
    # Uganda
    # — Tooro Music own artists: anything released under these names on Deezer
    #   flows into the app automatically at every monthly catalog refresh —
    ("Derick Fan","Derick Fan","Afrobeat","Uganda"),
    ("Fik Fameica","Fik Fameica","Afrobeat","Uganda"),("Winnie Nwagi","Winnie Nwagi","Afropop","Uganda"),
    ("Azawi","Azawi","Afrofusion","Uganda"),("King Saha","King Saha","Ragga","Uganda"),
    ("Ziza Bafana","Ziza Bafana","Dancehall","Uganda"),("Jose Chameleone","Jose Chameleone","Afrobeat","Uganda"),
    ("Bebe Cool","Bebe Cool","Afropop","Uganda"),("Eddy Kenzo","Eddy Kenzo","Afrobeat","Uganda"),
    ("Spice Diana","Spice Diana","Afropop","Uganda"),("Vinka","Vinka","Afropop","Uganda"),
    ("David Lutalo","David Lutalo","Afrobeat","Uganda"),("Rema Namakula","Rema Namakula","Afropop","Uganda"),
    ("John Blaq","John Blaq","Afrobeat","Uganda"),("Irene Ntale","Irene Ntale","Afropop","Uganda"),
    ("Juliana Kanyomozi","Juliana Kanyomozi","Afropop","Uganda"),("Bobi Wine","Bobi Wine","Afrobeat","Uganda"),
    ("Geosteady","Geosteady","Afrofusion","Uganda"),("Lydia Jazmine","Lydia Jazmine","Afropop","Uganda"),
    ("Mudra D Viral","Mudra","Afrobeat","Uganda"),("Martha Mukisa","Martha Mukisa","Afropop","Uganda"),
    ("Crysto Panda","Crysto Panda","Dancehall","Uganda"),("Kent & Flosso","Kent & Flosso","Dancehall","Uganda"),
    ("Fille","Fille","Afropop","Uganda"),("A Pass","A Pass","Afrobeat","Uganda"),
    ("Ykee Benda","Ykee Benda","Afropop","Uganda"),("Navio","Navio","Afrobeat","Uganda"),
    ("Gravity Omutujju","Gravity Omutujju","Ragga","Uganda"),("Rabadaba","Rabadaba","Dancehall","Uganda"),
    ("Ruyonga","Ruyonga","Afrofusion","Uganda"),("Levixone","Levixone","Afrofusion","Uganda"),
    ("Papa Cidy","Papa Cidy","Afropop","Uganda"),("Sheebah","Sheebah","Afropop","Uganda"),
    ("Rachael Magoola","Rachael Magoola","Afrofusion","Uganda"),("Ander Luya","Ander Luya","Afrobeat","Uganda"),
    ("Joshua Barz","Joshua Barz","Afrobeat","Uganda"),("Vyrooto","Vyrooto","Dancehall","Uganda"),
    ("Aggie the Dons","Aggie the Dons","Afrobeat","Uganda"),("Draco","Draco","Afrofusion","Uganda"),
    ("Binyanka Manix","Binyanka Manix","Afrobeat","Uganda"),("Fresh Kid UG","Fresh Kid","Afrobeat","Uganda"),
    ("Trecia Iman","Trecia","Afropop","Uganda"),("Vyrooto","Vyrooto","Afrobeat","Uganda"),
    ("Banilcol","Banilcol","Afrobeat","Uganda"),("Nince Henry","Nince Henry","Afropop","Uganda"),
    # East Africa
    ("Diamond Platnumz","Diamond Platnumz","Afrobeat","Tanzania"),("Harmonize","Harmonize","Afrobeat","Tanzania"),
    ("Rayvanny","Rayvanny","Afrobeat","Tanzania"),("Zuchu","Zuchu","Afropop","Tanzania"),
    ("Alikiba","Alikiba","Afrobeat","Tanzania"),("Marioo","Marioo","Afropop","Tanzania"),
    ("Sauti Sol","Sauti Sol","Afrofusion","Kenya"),("Nyashinski","Nyashinski","Afrobeat","Kenya"),
    ("Khaligraph Jones","Khaligraph Jones","Dancehall","Kenya"),("Otile Brown","Otile Brown","Afropop","Kenya"),
    ("Nviiri the Storyteller","Nviiri","Afrofusion","Kenya"),("Bensoul","Bensoul","Afrofusion","Kenya"),
    ("Nandy","Nandy","Afropop","Tanzania"),("Mbosso","Mbosso","Afrofusion","Tanzania"),
    ("Lava Lava","Lava Lava","Afropop","Tanzania"),("Jay Melody","Jay Melody","Afrobeat","Tanzania"),
    ("Bruce Melodie","Bruce Melodie","Afrobeat","Rwanda"),("Meddy","Meddy","Afropop","Rwanda"),
    ("The Ben","The Ben","Afropop","Rwanda"),("Charly na Nina","Charly & Nina","Afropop","Rwanda"),
    # Pan-Africa
    ("Burna Boy","Burna Boy","Afrobeat","Nigeria"),("Wizkid","Wizkid","Afrobeat","Nigeria"),
    ("Davido","Davido","Afrobeat","Nigeria"),("Tiwa Savage","Tiwa Savage","Afropop","Nigeria"),
    ("Yemi Alade","Yemi Alade","Afropop","Nigeria"),("Mr Eazi","Mr Eazi","Afrofusion","Nigeria"),
    ("Tekno","Tekno","Afrobeat","Nigeria"),("Kizz Daniel","Kizz Daniel","Afrobeat","Nigeria"),
    ("Fireboy DML","Fireboy DML","Afrofusion","Nigeria"),("Ayra Starr","Ayra Starr","Afropop","Nigeria"),
    ("Tems","Tems","Afrofusion","Nigeria"),("Rema","Rema","Afrobeat","Nigeria"),
    ("Asake","Asake","Afrobeat","Nigeria"),("Omah Lay","Omah Lay","Afrofusion","Nigeria"),
    ("2Baba","2Baba","Afrobeat","Nigeria"),("Olamide","Olamide","Afrobeat","Nigeria"),
    ("Wande Coal","Wande Coal","Afrobeat","Nigeria"),("P-Square","P-Square","Afrobeat","Nigeria"),
    ("Sarkodie","Sarkodie","Afrobeat","Ghana"),("Shatta Wale","Shatta Wale","Dancehall","Ghana"),
    ("Stonebwoy","Stonebwoy","Dancehall","Ghana"),("King Promise","King Promise","Afropop","Ghana"),
    ("MzVee","MzVee","Afropop","Ghana"),("R2Bees","R2Bees","Afrofusion","Ghana"),
    ("Fally Ipupa","Fally Ipupa","Afrofusion","DR Congo"),("Innoss'B","Innoss'B","Afrobeat","DR Congo"),
    ("Locko","Locko","Afrofusion","Cameroon"),("Tenor","Tenor","Afrobeat","Cameroon"),
    ("Toofan","Toofan","Afrobeat","Togo"),("Dadju","Dadju","Afropop","France"),
    ("Aya Nakamura","Aya Nakamura","Afropop","France"),("Naza","Naza","Afrofusion","France"),
]
PER_ARTIST = 15  # up to this many tracks per artist (where Deezer previews exist)
GENRE_COLORS = {"Afrobeat":"#8B5CF6","Afropop":"#EC4899","Afrofusion":"#8B5CF6","Ragga":"#FBBF24","Dancehall":"#F59E0B"}

def dget(url):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    return json.load(urllib.request.urlopen(req, timeout=15))

def fmt_dur(s): return f"{int(s)//60}:{int(s)%60:02d}"
def fmt_plays(rank):
    m = rank/1000000
    if m >= 1: return f"{round(m,1)}M"
    return f"{max(1,round(rank/1000))}K"

def artist_tracks(query, display, limit):
    """Resolve the artist, then pull their top tracks (richest source)."""
    try:
        res = dget(f"https://api.deezer.com/search/artist?q={urllib.request.quote(query)}&limit=1")
        data = res.get("data") or []
        if data:
            aid = data[0]["id"]
            top = dget(f"https://api.deezer.com/artist/{aid}/top?limit={limit}")
            trs = [t for t in top.get("data",[]) if t.get("preview")]
            if trs: return trs, data[0].get("nb_fan",3000), data[0].get("picture_xl","")
    except Exception as e:
        print("WARN artist-top", query, e)
    # fallback: plain search
    try:
        res = dget(f"https://api.deezer.com/search?q={urllib.request.quote(query)}&limit={limit+15}")
        trs = [t for t in res.get("data",[]) if t.get("preview") and t["artist"]["name"].lower()==display.lower()]
        return trs[:limit], 3000, (trs[0]["artist"]["picture_xl"] if trs else "")
    except Exception as e:
        print("WARN search", query, e); return [], 3000, ""

songs, artists, seen_titles = [], [], set()
for query, name, genre, location in ARTIST_SEEDS:
    tracks, fans, img = artist_tracks(query, name, PER_ARTIST)
    if not tracks:
        print("SKIP (no previews):", name); continue
    dedup = []
    for t in tracks:
        key = (t["title"].lower().strip(), name.lower())
        if key in seen_titles: continue
        seen_titles.add(key); dedup.append(t)
    tracks = dedup[:PER_ARTIST]
    if not tracks: continue
    aid = re.sub(r"\s+", "_", name.lower())
    artists.append({
        "id": aid, "name": name, "genre": genre, "imageUrl": img or (tracks[0]["artist"]["picture_xl"] if tracks else ""),
        "color": GENRE_COLORS.get(genre,"#8B5CF6"), "songs": len(tracks),
        "followers": f"{max(1,round(fans/1000))}K",
        "monthlyListeners": f"{max(10,round(sum(t['rank'] for t in tracks)/1000))}K",
        "verified": True, "bio": f"{name} — {genre} artist from {location}, streaming on Tooro Music.",
        "location": location})
    for i, t in enumerate(tracks, 1):
        songs.append({
            "id": str(len(songs)+1), "title": t["title"], "artist": t["artist"]["name"],
            "artistId": aid, "genre": genre, "duration": fmt_dur(t["duration"]),
            "plays": fmt_plays(t["rank"]), "audioUrl": t["preview"], "dzId": t["id"],
            "coverUrl": t["album"]["cover_big"],
            "color": GENRE_COLORS.get(genre,"#8B5CF6"),
            "album": t["album"]["title"], "seed": f"{aid}-{i}"})
    time.sleep(0.25)

# keep everything from GENRES onward (GENRES, PLAYLISTS, MY_TRACKS, ARTIST_PLANS, PREM_PLANS) from old file
src_old = open("src/data/mock.ts").read()
m = re.search(r'export const GENRES[\s\S]*\Z', src_old)
tail = m.group(0) if m else ""
out = "// Auto-generated from Deezer public API — real music, 30s previews\n// Regenerate by running scripts/fetch-deezer.py\n\nexport const SONGS = "
out += json.dumps(songs, indent=2, ensure_ascii=False) + ";\n\n"
out += "export const ARTISTS = " + json.dumps(artists, indent=2, ensure_ascii=False) + ";\n\n"
if tail: out += tail + "\n"
open("src/data/mock.ts","w").write(out)
print(f"OK songs={len(songs)} artists={len(artists)} tail={'yes' if tail else 'NO'}")
