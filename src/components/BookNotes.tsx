import { VStack, Heading, Text, SimpleGrid, Box, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

export const BookNotes = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBooksWithNotes();
    }
  }, [user]);

  const fetchBooksWithNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user?.id)
        .not('notes', 'is', null)
        .not('notes', 'eq', '')
        .order('updated_at', { ascending: false });

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
      }
    } catch (error) {
      console.error('Error fetching books with notes:', error);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg" mb={6}>読書ノート一覧</Heading>
      
      {books.length === 0 ? (
        <Text>読書ノートがまだありません。本を読んで気づきを記録しましょう。</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {books.map((book) => (
            <Box
              key={book.id}
              as={RouterLink}
              to={`/books/${book.id}`}
              p={5}
              borderWidth="1px"
              borderRadius="lg"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
                textDecoration: 'none'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={3}>
                <Heading size="md" noOfLines={2}>
                  {book.title}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {book.author}
                </Text>
                {book.category && (
                  <Badge colorScheme="blue">
                    {book.category}
                  </Badge>
                )}
                <Text noOfLines={3} fontSize="sm" color="gray.600">
                  {book.notes}
                </Text>
                {book.lastReadDate && (
                  <Text fontSize="xs" color="gray.500">
                    最終更新: {new Date(book.lastReadDate).toLocaleDateString()}
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};