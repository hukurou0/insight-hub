import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Text,
  Image,
  Button,
  useToast,
  HStack,
  Badge,
  Flex,
  useBreakpointValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Book } from '../types/book';
import { useAuth } from '../../auth';
import { useBooks } from '../hooks/useBooks';
import { api } from '../../../shared/services/api';

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { deleteBook } = useBooks();

  useEffect(() => {
    if (id && user) {
      fetchBook();
    }
  }, [id, user]);

  const fetchBook = async () => {
    setIsLoading(true);
    setIsImageLoading(true);
    try {
      const data = await api.fetchBook(id!, user!.id);
      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
      toast({
        title: 'エラー',
        description: '本の情報の取得に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!book) return;

    if (window.confirm('この本を削除してもよろしいですか？')) {
      try {
        await deleteBook.mutateAsync(book.id);

        toast({
          title: '削除完了',
          description: '本を削除しました。',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        navigate('/notes');
      } catch (error) {
        console.error('Error deleting book:', error);
        toast({
          title: 'エラー',
          description: '本の削除に失敗しました。',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Box>
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Box position="relative">
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 3, md: 8 }}
              align={{ base: 'center', md: 'start' }}
            >
              <Skeleton height={{ base: '150px', md: '200px' }} width={{ base: '150px', md: '200px' }} />
              
              <VStack align="stretch" spacing={3} w="full">
                <Flex w="full" justify="space-between" align="center">
                  <Box flex="1">
                    <SkeletonText noOfLines={1} skeletonHeight="8" width="80%" />
                  </Box>
                </Flex>
                <SkeletonText noOfLines={1} skeletonHeight="6" width="60%" />
                <HStack spacing={2}>
                  <Skeleton height="20px" width="60px" />
                  <Skeleton height="20px" width="60px" />
                </HStack>
                <SkeletonText noOfLines={1} skeletonHeight="4" width="40%" />
              </VStack>
            </Flex>
          </Box>

          <Box mt={{ base: 3, md: 8 }}>
            <SkeletonText noOfLines={1} skeletonHeight="6" width="120px" mb={4} />
            <SkeletonText noOfLines={4} spacing="4" />
          </Box>
        </VStack>
      </Box>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <Box>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Box position="relative">
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 3, md: 8 }}
            align={{ base: 'center', md: 'start' }}
          >
            <Box width={{ base: '150px', md: '200px' }}>
              {book.coverImage ? (
                <Skeleton
                  isLoaded={!isImageLoading}
                  height={{ base: '150px', md: '200px' }}
                  borderRadius="md"
                >
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    width="100%"
                    height={{ base: '150px', md: '200px' }}
                    objectFit="cover"
                    borderRadius="md"
                    onLoad={() => setIsImageLoading(false)}
                  />
                </Skeleton>
              ) : (
                <Box
                  width="100%"
                  height={{ base: '150px', md: '200px' }}
                  bg="gray.100"
                  borderRadius="md"
                />
              )}
            </Box>
            
            <VStack align="stretch" spacing={3} w="full">
              <Flex
                w="full"
                justify="space-between"
                align="center"
              >
                <Box flex="1">
                  <Heading 
                    size={{ base: 'md', md: 'lg' }}
                    textAlign={{ base: 'center', md: 'left' }}
                  >
                    {book.title}
                  </Heading>
                </Box>
                {!isMobile && (
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    variant="ghost"
                    onClick={() => navigate(-1)}
                  >
                    戻る
                  </Button>
                )}
              </Flex>

              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.600"
                textAlign={{ base: 'center', md: 'left' }}
              >
                {book.author}
              </Text>
              <HStack spacing={2} justify={{ base: 'center', md: 'start' }} wrap="wrap">
                <Badge colorScheme="blue" fontSize="sm">
                  {book.status}
                </Badge>
                {book.category && (
                  <Badge colorScheme="green" fontSize="sm">
                    {book.category}
                  </Badge>
                )}
              </HStack>
              {book.lastReadDate && (
                <Text
                  fontSize="sm"
                  color="gray.500"
                  textAlign={{ base: 'center', md: 'left' }}
                >
                  最終更新: {new Date(book.lastReadDate).toLocaleDateString()}
                </Text>
              )}
            </VStack>
          </Flex>
          {isMobile && (
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(-1)}
              size="sm"
              position="absolute"
              top={0}
              right={0}
            >
              戻る
            </Button>
          )}
        </Box>

        <Box id="notes-section" mt={{ base: 3, md: 8 }}>
          <Heading size="md" mb={{ base: 2, md: 4 }}>
            読書ノート
          </Heading>
          <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
            <Text
              whiteSpace="pre-wrap"
              fontSize={{ base: "sm", md: "md" }}
            >
              {book.notes || 'まだノートがありません。'}
            </Text>
            <Flex direction="column" gap={{ base: 2, md: 4 }} width="100%">
              <Button
                onClick={() => navigate(`/books/${book.id}/write`)}
                colorScheme="blue"
                variant="outline"
                width={{ base: "100%", sm: "auto" }}
                leftIcon={<EditIcon />}
              >
                ノートを書く
              </Button>
              <Button
                leftIcon={<DeleteIcon />}
                onClick={handleDelete}
                colorScheme="red"
                variant="outline"
                width={{ base: "100%", sm: "auto" }}
              >
                本を削除
              </Button>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}