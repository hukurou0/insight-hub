export type BookStatus = '未読' | '読書中' | '読了(ノート未完成)' | '読了(ノート完成)';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  category?: string;
  coverImage?: string;
  notes?: string;
  lastReadDate?: string;
}