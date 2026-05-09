// ============================================================
// TOORO MUSIC - Storage API (Firebase Storage)
// ============================================================

import storage from '@react-native-firebase/storage';
import { storagePaths } from './firebase';

export const storageApi = {
  // Upload audio file
  uploadSong: async (
    artistId: string,
    fileUri: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const path = storagePaths.song(artistId, filename);
    const reference = storage().ref(path);
    const task = reference.putFile(fileUri);

    if (onProgress) {
      task.on('state_changed', snapshot => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress(progress);
      });
    }

    await task;
    return await reference.getDownloadURL();
  },

  // Upload cover image
  uploadCover: async (
    artistId: string,
    fileUri: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const path = storagePaths.cover(artistId, filename);
    const reference = storage().ref(path);
    const task = reference.putFile(fileUri);

    if (onProgress) {
      task.on('state_changed', snapshot => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress(progress);
      });
    }

    await task;
    return await reference.getDownloadURL();
  },

  // Upload user avatar
  uploadAvatar: async (
    userId: string,
    fileUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const filename = `avatar_${Date.now()}.jpg`;
    const path = storagePaths.avatar(userId, filename);
    const reference = storage().ref(path);
    const task = reference.putFile(fileUri);

    if (onProgress) {
      task.on('state_changed', snapshot => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress(progress);
      });
    }

    await task;
    return await reference.getDownloadURL();
  },

  // Delete a file by its full storage path
  deleteFile: async (path: string) => {
    await storage().ref(path).delete();
  },

  // Get download URL for a path
  getDownloadUrl: async (path: string): Promise<string> => {
    return await storage().ref(path).getDownloadURL();
  },
};
