import { VStack, Button, useDisclosure, Text, Badge, Box, useBreakpointValue, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { BookSearch } from './BookSearch';
import { AddIcon } from '@chakra-ui/icons';
import AddBookForm from './AddBookForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateCoverImage } from '../utils/generateCoverImage';

export const SearchPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
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
      toast({
        title: 'エラー',
        description: 'データの読み込みに失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddBook = async (newBook: Book) => {
    try {
      const bookWithCover = {
        ...newBook,
        coverImage: newBook.coverImage || generateCoverImage(newBook.title, newBook.author)
      };

      const { error } = await supabase
        .from('books')
        .insert({
          id: bookWithCover.id,
          title: bookWithCover.title,
          author: bookWithCover.author,
          status: bookWithCover.status,
          category: bookWithCover.category,
          cover_image: bookWithCover.coverImage,
          notes: bookWithCover.notes,
          last_read_date: bookWithCover.lastReadDate,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      await fetchBooks();

      toast({
        title: '追加完了',
        description: '本を追加しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'エラー',
        description: '本の追加に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  const AddBookButton = () => (
    <Button
      leftIcon={<AddIcon />}
      colorScheme="blue"
      size="lg"
      onClick={onOpen}
      borderRadius={isMobile ? "full" : "md"}
      px={6}
      boxShadow={isMobile ? "lg" : "none"}
      _hover={{
        transform: isMobile ? 'translateY(-2px)' : 'none',
        boxShadow: isMobile ? 'xl' : 'md',
      }}
      transition="all 0.2s"
      width={isMobile ? "auto" : "100%"}
    >
      本を追加
    </Button>
  );

  return (
    <Box position="relative" minH="calc(100vh - 200px)">
      <VStack spacing={{ base: 2, md: 6 }} align="stretch">
        <BookSearch
          books={books}
          onFilteredBooksChange={setFilteredBooks}
        />

        {!isMobile && (
          <Box mb={{ base: 0, md: 2 }}>
            <AddBookButton />
          </Box>
        )}

        <VStack spacing={{ base: 2, md: 4 }} align="stretch">
          {filteredBooks.map((book) => (
            <Button
              key={book.id}
              onClick={() => handleBookClick(book.id)}
              variant="outline"
              height="auto"
              p={4}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              textAlign="left"
              whiteSpace="normal"
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
            </Button>
          ))}
        </VStack>

        {isMobile && (
          <Box
            position="fixed"
            bottom={8}
            right={8}
            zIndex={2}
          >
            <AddBookButton />
          </Box>
        )}

        <AddBookForm
          isOpen={isOpen}
          onClose={onClose}
          onAddBook={handleAddBook}
        />
      </VStack>
    </Box>
  );
};