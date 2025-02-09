import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Button,
  Textarea,
  useToast,
  Stack,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Book } from '../../books/types/book';
import { supabase } from '../../../shared/services/supabase';
import { useAuth } from '../../auth';

export default function SimpleNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [notes, setNotes] = useState('');

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

  const handleSave = async (complete: boolean) => {
    if (!book) return;

    try {
      const { error } = await supabase
        .from('books')
        .update({
          notes: notes,
          status: complete ? '読了(ノート完成)' : book.status,
          last_read_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', book.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '保存完了',
        description: '読書ノートを保存しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/notes');
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

  if (!book) {
    return null;
  }

  return (
    <Box>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Flex justify="space-between" align="center" mb={{ base: 2, md: 4 }}>
          <Heading size={{ base: "md", md: "lg" }}>シンプルノート</Heading>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate(-1)}
            size={{ base: "sm", md: "md" }}
          >
            戻る
          </Button>
        </Flex>

        <Heading size="md" color="gray.600" mb={{ base: 3, md: 6 }}>{book.title}</Heading>

        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minH={{ base: "250px", md: "400px" }}
            placeholder="読書の気づきや学びを記録しましょう..."
            fontSize={{ base: "sm", md: "md" }}
          />
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={4}
            justify="flex-end"
          >
            <Button
              variant="outline"
              colorScheme="gray"
              onClick={() => handleSave(false)}
              isDisabled={!notes.trim()}
              w={{ base: "100%", sm: "180px" }}
              h="44px"
            >
              保存して戻る
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleSave(true)}
              isDisabled={!notes.trim()}
              w={{ base: "100%", sm: "180px" }}
              h="44px"
            >
              ノートを完成する
            </Button>
          </Stack>
        </VStack>
      </VStack>
    </Box>
  );
}