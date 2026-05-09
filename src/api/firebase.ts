// ============================================================
// TOORO MUSIC - Firebase Client
// ============================================================

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Re-export Firebase services for use across the app
export { auth, firestore, storage };

// Firestore collection references
export const db = {
  profiles: () => firestore().collection('profiles'),
  artists: () => firestore().collection('artists'),
  songs: () => firestore().collection('songs'),
  albums: () => firestore().collection('albums'),
  playlists: () => firestore().collection('playlists'),
  genres: () => firestore().collection('genres'),
  songLikes: () => firestore().collection('songLikes'),
  artistFollows: () => firestore().collection('artistFollows'),
  playHistory: () => firestore().collection('playHistory'),
};

// Firebase Storage paths
export const storagePaths = {
  song: (artistId: string, filename: string) => `songs/${artistId}/${filename}`,
  cover: (artistId: string, filename: string) => `covers/${artistId}/${filename}`,
  avatar: (userId: string, filename: string) => `avatars/${userId}/${filename}`,
};

export default { auth, firestore, storage, db, storagePaths };
