import { supabase } from '../services/supabase';

export async function uploadImage(file: File): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(`${Date.now()}-${Math.random().toString(36).substring(7)}`, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}