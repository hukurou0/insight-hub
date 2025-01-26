export interface Book {
  id: string;
  title: string;
  author: string;
  status: '未読' | '読書中' | '読了(ノート未完成)' | '読了(ノート完成)';
  category?: string;
  coverImage?: string | null;  // nullを許可するように変更
  notes?: string;
  lastReadDate: string;
}