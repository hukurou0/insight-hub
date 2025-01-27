import { VStack, Heading, Text, SimpleGrid, Box, Badge, Button, useDisclosure, useBreakpointValue, useToast, Flex, Collapse, HStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AddIcon, EditIcon, ChevronDownIcon, ChevronUpIcon, TimeIcon } from '@chakra-ui/icons';
import { Book } from '../types/book';
import { supabase } from '../../../shared/services/supabase';
import { useAuth } from '../../auth';
import { generateCoverImage } from '../../../shared/utils/generateCoverImage';
import AddBookForm  from './AddBookForm';

export default function BookNotes() {
  const [books, setBooks] = useState<Book[]>([]);
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
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user?.id)
        .neq('status', '読了(ノート完成)')
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

  const handleUpdateStatus = async (bookId: string, newStatus: Book['status']) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookId)
        .eq('user_id', user?.id);

      if (error) throw error;

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
          <Button
            width="100%"
            onClick={toggleSection}
            bg="gray.50"
            borderWidth="1px"
            borderRadius="md"
            shadow="sm"
            mb={2}
            py={3}
            px={4}
            _hover={{
              bg: "gray.100",
              transform: "translateY(-1px)",
              shadow: "md",
            }}
            _active={{
              bg: "gray.200",
            }}
            transition="all 0.2s"
          >
            <Flex width="100%" align="center" justify="space-between">
              <Text fontWeight="bold" color="gray.700">{title}</Text>
              <Flex align="center">
                <Text color="gray.600" fontSize="sm" mr={2}>
                  {books.length}冊
                </Text>
                {isExpanded ? 
                  <ChevronUpIcon boxSize={6} color="blue.500" /> : 
                  <ChevronDownIcon boxSize={6} color="blue.500" />
                }
              </Flex>
            </Flex>
          </Button>
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
        <Flex justify="space-between" align="center" mb={{ base: 0, md: 2 }}>
          <Heading size="lg">読書ノートを書く</Heading>
          {!isMobile && books.length > 0 && <AddBookButton />}
        </Flex>
        
        {books.length === 0 ? (
          <VStack spacing={{ base: 2, md: 4 }} align="center" py={{ base: 0, md: 4 }}>
            <Text fontSize="lg" textAlign="center">
              {isMobile ? (
                <>
                  まだ本が登録されていません。<br />
                  本を登録してみましょう！
                </>
              ) : (
                "まだ本が登録されていません。「本を追加」ボタンから本を登録してみましょう！"
              )}
            </Text>
            <AddBookButton />
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