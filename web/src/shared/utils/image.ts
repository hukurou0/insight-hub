import { api } from '../services/api';

export async function uploadImage(file: File): Promise<string> {
  try {
    return await api.uploadImage(file);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}