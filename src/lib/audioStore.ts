// IndexedDB blob store for compressed uploads (survives reloads, no size limits like localStorage)

const DB_NAME = "tooro-audio";
const STORE = "tracks";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAudio(id: string, blob: Blob): Promise<void> {
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* storage unavailable — playback falls back to silence */ }
}

export async function getAudio(id: string): Promise<Blob | undefined> {
  try {
    const db = await open();
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch { return undefined; }
}

export async function deleteAudio(id: string): Promise<void> {
  try {
    const db = await open();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch { /* ignore */ }
}

// ─── Compression ────────────────────────────────────────────────────────────

// @ts-ignore - vendored UMD build of lamejs
import lame from "./lame.min.js";

const MP3_QUALITY_KBPS = 96;

/**
 * Decode any audio file, downmix to mono and re-encode as a small MP3.
 * A typical 320kbps stereo upload shrinks ~4x — instant to play, light on storage.
 */
export async function compressAudio(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; duration: number }> {
  const buf = await file.arrayBuffer();
  const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new AC();
  const decoded: AudioBuffer = await ctx.decodeAudioData(buf.slice(0));
  await ctx.close();

  // Downmix to mono
  const mono = new Float32Array(decoded.length);
  const chans = decoded.numberOfChannels;
  for (let c = 0; c < chans; c++) {
    const d = decoded.getChannelData(c);
    for (let i = 0; i < d.length; i++) mono[i] += d[i] / chans;
  }

  // 16-bit PCM samples for lame
  const samples = new Int16Array(mono.length);
  for (let i = 0; i < mono.length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const encoder = new lame.Mp3Encoder(1, 44100, MP3_QUALITY_KBPS);
  const blockSize = 1152;
  const chunks: Uint8Array[] = [];
  const total = samples.length;

  let i = 0;
  while (i < total) {
    // encode ~1 second of audio per pass, then yield so the UI stays live
    const passEnd = Math.min(total, i + blockSize * 40);
    for (; i < passEnd; i += blockSize) {
      const slice = samples.subarray(i, Math.min(i + blockSize, passEnd));
      const mp3 = encoder.encodeBuffer(slice);
      if (mp3.length > 0) chunks.push(new Uint8Array(mp3));
    }
    onProgress?.(Math.min(100, Math.round((i / total) * 100)));
    await new Promise(r => setTimeout(r, 0));
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(new Uint8Array(end));
  onProgress?.(100);

  const blob = new Blob(chunks as BlobPart[], { type: "audio/mp3" });
  return { blob, duration: decoded.duration };
}
