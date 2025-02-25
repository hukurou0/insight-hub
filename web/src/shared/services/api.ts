import { Book } from '../../features/books/types/book';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Missing API environment variables');
}

export const api = {
  async fetchBook(id: string, userId: string): Promise<Book> {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      headers: {
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }

    const data = await response.json();
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      status: data.status,
      category: data.category,
      coverImage: data.cover_image,
      notes: data.notes,
      lastReadDate: data.last_read_date,
    };
  },

  async fetchBooksWithNotes(userId: string): Promise<Book[]> {
    const response = await fetch(`${API_URL}/api/books`, {
      headers: {
        'user-id': userId,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch books');
    }

    const data = await response.json();
    return data.map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      category: book.category,
      coverImage: book.cover_image,
      notes: book.notes,
      lastReadDate: book.last_read_date,
    }));
  },

  async deleteBook(id: string, userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'DELETE',
      headers: {
        'user-id': userId,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete book');
    }
  },

  async addBook(userId: string, book: Omit<Book, 'id'>): Promise<void> {
    const response = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        status: book.status,
        category: book.category,
        cover_image: book.coverImage,
        notes: book.notes,
        last_read_date: book.lastReadDate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add book');
    }
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/books/img-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  },

  async updateBook(userId: string, book: Book): Promise<Book> {
    const response = await fetch(`${API_URL}/api/books/${book.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        status: book.status,
        category: book.category,
        notes: book.notes,
        coverImage: book.coverImage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '本の更新に失敗しました');
    }

    return response.json();
  },

  async analyzeBookImage(imageSrc: string): Promise<{
    title: string;
    author: string;
    category?: string;
  }> {
    const response = await fetch(`${API_URL}/api/book-analysis/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageSrc }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '本の解析に失敗しました');
    }

    return response.json();
  },
};