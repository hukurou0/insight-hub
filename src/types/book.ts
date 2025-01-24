export interface Book {
  id: string;
  title: string;
  author: string;
  status: '未読' | '読書中' | '読了';
  notes?: string;
  category?: string;
  coverImage?: string;
  lastReadDate?: string;
}