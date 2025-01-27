import { VStack, Text, Badge, Box } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '../types/book';
import BookSearch from './BookSearch';
import { supabase } from '../../../shared/services/supabase';
import { useAuth } from '../../auth';

export default function SearchPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedBooks = data.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          status: book.status,
          category: book.category,
          coverImage: book.cover_image,
          notes: book.notes,
          lastReadDate: book.last_read_date,
        }));

        setBooks(formattedBooks);
        setFilteredBooks(formattedBooks);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <Box position="relative" minH="calc(100vh - 200px)">
      <VStack spacing={{ base: 2, md: 6 }} align="stretch">
        <BookSearch
          books={books}
          onFilteredBooksChange={setFilteredBooks}
        />

        <VStack spacing={{ base: 2, md: 4 }} align="stretch">
          {filteredBooks.map((book) => (
            <Box
              key={book.id}
              onClick={() => handleBookClick(book.id)}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              cursor="pointer"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={1} width="100%">
                <Text fontWeight="bold" fontSize="lg">
                  {book.title}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {book.author}
                </Text>
                {book.category && (
                  <Badge colorScheme="blue" fontSize="sm">
                    {book.category}
                  </Badge>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}