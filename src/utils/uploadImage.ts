import { supabase } from '../lib/supabase';

export async function uploadBookCover(file: string) {
  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Base64文字列からBlobを作成
    const base64Data = file.split(',')[1];
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());

    // ユニークなファイル名を生成（ユーザーIDごとにフォルダを分ける）
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${user.id}/book-covers/${fileName}`;

    // Supabaseストレージにアップロード
    const { error } = await supabase.storage
      .from('books')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('books')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}