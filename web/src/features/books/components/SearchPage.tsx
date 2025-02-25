import { VStack, Text, Box, Spinner, Center } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '../types/book';
import BookSearch from './BookSearch';
import { useBooks } from '../hooks/useBooks';
import AnimatedList from './AnimatedList';

export default function SearchPage() {
  const { books } = useBooks();
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilteredBooks(books);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [books]);

  const handleBookClick = (_: string | JSX.Element, index: number) => {
    navigate(`/books/${filteredBooks[index].id}`);
  };

  const renderBookItem = (book: Book) => {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        width="100%"
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
            <Text fontSize="sm" color="blue.500">
              {book.category}
            </Text>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <Box position="relative" minH="calc(100vh - 200px)">
      <VStack spacing={{ base: 2, md: 6 }} align="stretch">
        <BookSearch 
          existingBooks={books} 
          onFilteredBooksChange={setFilteredBooks} 
        />

        <VStack spacing={{ base: 2, md: 4 }} align="stretch">
          {isLoading ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
                <Text color="gray.600">本を検索中...</Text>
              </VStack>
            </Center>
          ) : filteredBooks.length === 0 ? (
            <VStack spacing={4} py={12} px={4}>
              <SearchIcon
                w={12}
                h={12}
                color="blue.400"
                animation="bounce 1s infinite"
              />
              <Text
                textAlign="center"
                fontSize="xl"
                fontWeight="bold"
                color="blue.500"
                animation="fadeIn 0.5s"
              >
                Insightはどこだ??
              </Text>
              <Text
                textAlign="center"
                color="gray.600"
                fontSize="md"
              >
                もっと読書ノートを増やしてみましょう!
              </Text>
            </VStack>
          ) : (
              <Box display="flex" justifyContent="center" width="100%">
                <AnimatedList
                  items={filteredBooks.map(book => renderBookItem(book))}
                  onItemSelect={handleBookClick}
                  showGradients={true}
                  enableArrowNavigation={true}
                  displayScrollbar={false}
                  className="books-list"
                  itemClassName="book-item"
                />
              </Box>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}