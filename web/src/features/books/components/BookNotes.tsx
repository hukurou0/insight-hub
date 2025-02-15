import { VStack, Heading, Text, SimpleGrid, Box, Badge, Button, useDisclosure, useBreakpointValue, useToast, Flex, Collapse, HStack, Spinner, Center } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AddIcon, EditIcon, ChevronDownIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import { Book } from '../types/book';
import { api } from '../../../shared/services/api';
import { useAuth } from '../../auth';
import { generateCoverImage } from '../../../shared/utils/generateCoverImage';
import AddBookForm  from './AddBookForm';
import { fetchWithMinDuration } from '../../../shared/utils/fetchWithMinDuration';

export default function BookNotes() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBooksWithNotes();
    }
  }, [user]);

  const fetchBooksWithNotes = async () => {
    setIsLoading(true);

    const fetchBooks = async () => {
      const data = await api.fetchBooksWithNotes(user!.id);
      return data.filter(book => book.status !== '読了(ノート完成)');
    };

    try {
      const data = await fetchWithMinDuration(fetchBooks);
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books with notes:', error);
      toast({
        title: 'エラー',
        description: '本の読み込みに失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookId: string, newStatus: Book['status']) => {
    try {
      await api.updateBookStatus(bookId, user!.id, newStatus);
      await fetchBooksWithNotes();

      toast({
        title: '更新完了',
        description: 'ステータスを更新しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ステータスの更新に失敗しました。',
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

      await api.addBook(user!.id, bookWithCover);
      await fetchBooksWithNotes();

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
      width="auto"
    >
      本を追加
    </Button>
  );

  const renderBookSection = (title: string, books: Book[], sectionId: string) => {
    if (books.length === 0) return null;

    const isExpanded = expandedSection === sectionId;
    const toggleSection = () => {
      setExpandedSection(isExpanded ? null : sectionId);
    };

    return (
      <Box>
        {isMobile ? (
          <Box
            as="button"
            width="100%"
            onClick={toggleSection}
            bg={isExpanded ? "blue.50" : "white"}
            borderWidth="1px"
            borderColor={isExpanded ? "blue.200" : "gray.200"}
            borderRadius="xl"
            shadow="sm"
            mb={3}
            py={4}
            px={5}
            _hover={{
              bg: isExpanded ? "blue.100" : "gray.50",
              borderColor: isExpanded ? "blue.300" : "gray.300",
              transform: "translateY(-1px)",
              shadow: "md",
            }}
            _active={{
              transform: "translateY(0)",
              shadow: "sm",
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <Flex width="100%" align="center" justify="space-between">
              <HStack spacing={3}>
                <Text
                  fontWeight="bold"
                  color={isExpanded ? "blue.700" : "gray.700"}
                  fontSize="md"
                  transition="color 0.3s ease"
                >
                  {title}
                </Text>
                <Badge
                  colorScheme={isExpanded ? "blue" : "gray"}
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {books.length}冊
                </Badge>
              </HStack>
              <Box
                transform={isExpanded ? "rotate(180deg)" : "rotate(0deg)"}
                transition="transform 0.3s ease"
              >
                <ChevronDownIcon
                  boxSize={5}
                  color={isExpanded ? "blue.500" : "gray.400"}
                />
              </Box>
            </Flex>
          </Box>
        ) : (
          <Heading size="md" mb={4}>{title}</Heading>
        )}

        <Collapse in={!isMobile || isExpanded}>
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3 }} 
            spacing={{ base: 3, md: 6 }} 
            mb={{ base: 3, md: 6 }}
          >
            {books.map((book) => (
              <Box
                key={book.id}
                p={{ base: 3, md: 5 }}
                borderWidth="1px"
                borderRadius="lg"
                transition="all 0.2s"
              >
                <VStack align="start" spacing={{ base: 2, md: 3 }}>
                  <Box
                    as={RouterLink}
                    to={`/books/${book.id}`}
                    width="100%"
                    _hover={{
                      textDecoration: 'none',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <VStack align="start" spacing={2}>
                      <Heading size="md" noOfLines={2}>
                        {book.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.600">
                        {book.author}
                      </Text>
                      <HStack spacing={2}>
                        {book.category && (
                          <Badge colorScheme="purple">
                            {book.category}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                  <VStack width="100%" spacing={2}>
                    {book.status === '未読' && (
                      <Button
                        leftIcon={<TimeIcon />}
                        colorScheme="blue"
                        variant="outline"
                        size="sm"
                        width="100%"
                        onClick={() => handleUpdateStatus(book.id, '読書中')}
                      >
                        読書中にする
                      </Button>
                    )}
                    {book.status === '読書中' && (
                      <Button
                        leftIcon={<TimeIcon />}
                        colorScheme="orange"
                        variant="outline"
                        size="sm"
                        width="100%"
                        onClick={() => handleUpdateStatus(book.id, '読了(ノート未完成)')}
                      >
                        読了にする
                      </Button>
                    )}
                    <Button
                      as={RouterLink}
                      to={`/books/${book.id}/write`}
                      leftIcon={<EditIcon />}
                      colorScheme={book.status === '読了(ノート未完成)' ? 'orange' : 'blue'}
                      variant="solid"
                      size="sm"
                      width="100%"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.2s"
                    >
                      ノートを書く
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Collapse>
      </Box>
    );
  };

  const readyToWriteBooks = books.filter(book => book.status === '読了(ノート未完成)');
  const readingBooks = books.filter(book => book.status === '読書中');
  const unreadBooks = books.filter(book => book.status === '未読');

  return (
    <Box position="relative" minH="calc(100vh - 200px)">
      <VStack spacing={8} align="stretch">
        {!isMobile ? (
          <Flex justify="space-between" align="center" mb={{ base: 0, md: 2 }}>
            <Heading size="lg">本を読んでInsightを貯めましょう</Heading>
            {books.length > 0 && <AddBookButton />}
          </Flex>
        ):(
          <Flex justify="space-between" align="center" mb={{ base: 0, md: 0 }}>
            <Heading size="lg">Insightを貯めましょう</Heading>
          </Flex>
        )}
        
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
              <Text color="gray.600">読書ノートを読み込み中...</Text>
            </VStack>
          </Center>
        ) : books.length === 0 ? (
          <VStack spacing={4} py={12} px={4} align="center">
            <StarIcon
              w={12}
              h={12}
              color="yellow.400"
              animation="bounce 1s infinite"
            />
            <VStack spacing={2}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="yellow.500"
                textAlign="center"
              >
                新しい本を読んでInsightを貯めましょう！
              </Text>
              <Text
                fontSize="md"
                color="gray.600"
                textAlign="center"
              >
                読書を通じて得た気づきや学びを<br />
                ノートとして残していきましょう
              </Text>
            </VStack>
            <Box pt={4}>
              <AddBookButton />
            </Box>
          </VStack>
        ) : (
          <VStack spacing={{ base: 4, md: 8 }} align="stretch">
            {renderBookSection(
              isMobile ? '読了した本（ノート未記入）' : '読了した本（ノートを書きましょう！）',
              readyToWriteBooks,
              'ready'
            )}
            {renderBookSection('読書中の本', readingBooks, 'reading')}
            {renderBookSection('未読の本', unreadBooks, 'unread')}
          </VStack>
        )}

        {isMobile && books.length > 0 && (
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
}