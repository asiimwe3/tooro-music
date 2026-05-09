// ============================================================
// TOORO MUSIC - Storage API
// ============================================================

import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { STORAGE } from '../constants';

export const storageApi = {
  // Upload audio file
  uploadAudio: async (
    uri: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const fileExt = fileName.split('.').pop() || 'mp3';
    const filePath = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to ArrayBuffer
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    const { data, error } = await supabase.storage
      .from(STORAGE.AUDIO)
      .upload(filePath, byteArray.buffer, {
        contentType: `audio/${fileExt}`,
        upsert: false,
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(STORAGE.AUDIO)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  },

  // Upload image (cover art, avatar, etc.)
  uploadImage: async (
    uri: string,
    bucket: string = STORAGE.COVERS,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, byteArray.buffer, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        upsert: false,
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
  },
};
