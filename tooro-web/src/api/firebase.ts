import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";

// ── Firebase config ───────────────────────────────────────────────────────
// NOTE: appId uses a valid format — Firestore is NOT used (we use Base44 entities instead)
const firebaseConfig = {
  apiKey: "AIzaSyDzNatC4ONdbInEFD9S5D79slgKzwB9_Ec",
  authDomain: "tooro-music-99462.firebaseapp.com",
  projectId: "tooro-music-99462",
  storageBucket: "tooro-music-99462.firebasestorage.app",
  messagingSenderId: "381921976107",
  appId: "1:381921976107:web:0000000000000000", // Auth-only — no Firestore needed
};

// Initialize once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const fbAuth = getAuth(app);

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isArtist?: boolean;
  plan?: "free" | "basic" | "pro" | "label";
  trialEnds?: string;
};

function toAuthUser(user: User, extra: Partial<AuthUser> = {}): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName || extra.displayName || user.email?.split("@")[0] || "Listener",
    photoURL: user.photoURL ?? "",
    isArtist: false,
    plan: "free",
    trialEnds: new Date(Date.now() + 14 * 86400000).toISOString(),
    ...extra,
  };
}

// ── Auth state listener ───────────────────────────────────────────────────
export function onAuthChange(fn: (user: AuthUser | null) => void) {
  return onAuthStateChanged(fbAuth, (fbUser) => {
    fn(fbUser ? toAuthUser(fbUser) : null);
  });
}

// ── Sign in with Google ───────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<AuthUser> {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  const result = await signInWithPopup(fbAuth, provider);
  return toAuthUser(result.user);
}

// ── Sign in with email/password ───────────────────────────────────────────
export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const result = await signInWithEmailAndPassword(fbAuth, email, password);
  return toAuthUser(result.user);
}

// ── Register with email/password ──────────────────────────────────────────
export async function registerWithEmail(email: string, password: string, name: string): Promise<AuthUser> {
  const result = await createUserWithEmailAndPassword(fbAuth, email, password);
  await updateProfile(result.user, { displayName: name });
  return toAuthUser(result.user, { displayName: name });
}

// ── Sign out ──────────────────────────────────────────────────────────────
export async function signOut() {
  await fbSignOut(fbAuth);
}

// ── Getters ───────────────────────────────────────────────────────────────
export function getCurrentFirebaseUser() {
  return fbAuth.currentUser;
}

// Stubs — kept for import compatibility (no Firestore)
export async function becomeArtist(_uid: string) {}
export async function upgradePlan(_uid: string, _plan: AuthUser["plan"]) {}
