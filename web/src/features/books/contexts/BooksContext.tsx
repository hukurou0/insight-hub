import { createContext, useContext, useState } from 'react';
import { Book } from '../types/book';

interface BooksContextType {
  books: Book[];
  setBooks: (books: Book[]) => void;
  isLoaded: boolean;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const updateBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    setIsLoaded(true);
  };

  return (
    <BooksContext.Provider value={{ books, setBooks: updateBooks, isLoaded }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
} 