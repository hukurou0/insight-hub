import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Text,
  Image,
  Button,
  Textarea,
  useToast,
  HStack,
  Badge,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon } from '@chakra-ui/icons';
import { Book } from '../types/book';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchBook();
    }
  }, [id, user]);

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        const formattedBook: Book = {
          id: data.id,
          title: data.title,
          author: data.author,
          status: data.status,
          category: data.category,
          coverImage: data.cover_image,
          notes: data.notes,
          lastReadDate: data.last_read_date,
        };
        setBook(formattedBook);
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      toast({
        title: 'エラー',
        description: '本の情報の取得に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!book) return;

    try {
      const { error } = await supabase
        .from('books')
        .update({
          notes: notes,
          last_read_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', book.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: '保存完了',
        description: '読書ノートを保存しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update local state
      setBook({ ...book, notes, lastReadDate: new Date().toISOString() });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'エラー',
        description: '読書ノートの保存に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!book) return;

    if (window.confirm('この本を削除してもよろしいですか？')) {
      try {
        const { error } = await supabase
          .from('books')
          .delete()
          .eq('id', book.id)
          .eq('user_id', user?.id);

        if (error) throw error;

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

  if (!book) {
    return null;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          戻る
        </Button>
        <IconButton
          aria-label="本を削除"
          icon={<DeleteIcon />}
          colorScheme="red"
          variant="ghost"
          onClick={handleDelete}
        />
      </Flex>

      <VStack spacing={6} align="stretch">
        <HStack spacing={8}>
          {book.coverImage && (
            <Image
              src={book.coverImage}
              alt={book.title}
              maxW="200px"
              objectFit="cover"
              borderRadius="md"
            />
          )}
          
          <VStack align="start" spacing={3}>
            <Heading size="lg">{book.title}</Heading>
            <Text fontSize="lg" color="gray.600">
              {book.author}
            </Text>
            {book.category && (
              <Badge colorScheme="blue" fontSize="sm">
                {book.category}
              </Badge>
            )}
            {book.lastReadDate && (
              <Text fontSize="sm" color="gray.500">
                最終更新: {new Date(book.lastReadDate).toLocaleDateString()}
              </Text>
            )}
          </VStack>
        </HStack>

        <Box>
          <Heading size="md" mb={4}>
            読書ノート
          </Heading>
          {isEditing ? (
            <VStack spacing={4} align="stretch">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minH="200px"
                placeholder="読書の気づきや学びを記録しましょう..."
              />
              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={handleSaveNotes}
                >
                  保存
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setNotes(book.notes || '');
                    setIsEditing(false);
                  }}
                >
                  キャンセル
                </Button>
              </HStack>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={4}>
              <Text whiteSpace="pre-wrap">
                {book.notes || 'まだノートがありません。'}
              </Text>
              <Button
                onClick={() => setIsEditing(true)}
                colorScheme="blue"
                variant="outline"
              >
                ノートを編集
              </Button>
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};