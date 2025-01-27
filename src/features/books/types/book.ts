export interface Book {
  id: string;
  title: string;
  author: string;
  status: '未読' | '読書中' | '読了(ノート未完成)' | '読了(ノート完成)';
  category?: string;
  coverImage?: string | null;
  notes?: string;
  lastReadDate?: string;
}

export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  description?: string;
  publishedDate?: string;
}