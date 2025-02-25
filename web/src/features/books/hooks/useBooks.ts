import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { Book } from '../types/book';
import { useAuth } from '../../auth';

export function useBooks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: books = [], isLoading, isError } = useQuery({
    queryKey: ['books', user?.id],
    queryFn: () => api.fetchBooksWithNotes(user!.id),
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const addBook = useMutation({
    mutationFn: (newBook: Book) => api.addBook(user!.id, newBook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
    },
  });

  const updateBook = useMutation({
    mutationFn: (book: Book) => api.updateBook(user!.id, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
    },
  });

  const deleteBook = useMutation({
    mutationFn: (bookId: string) => api.deleteBook(bookId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
    },
  });

  return {
    books,
    isLoading,
    isError,
    addBook,
    updateBook,
    deleteBook,
  };
} 