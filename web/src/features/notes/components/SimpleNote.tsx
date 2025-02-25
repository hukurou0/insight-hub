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
import { api } from '../../../shared/services/api';
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
      const data = await api.fetchBook(id!, user!.id);
      setBook(data);
      setNotes(data.notes || '');
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

  const saveAndReturn = async () => {
    if (!book) return;
    try {
      await api.updateBook(user!.id, { ...book, notes });
      toast({
        title: '保存完了',
        description: '読書ノートを保存しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/notes');
    } catch (error) {
      handleError(error);
    }
  };

  const completeNote = async () => {
    if (!book) return;
    try {
      await api.updateBook(user!.id, {
        ...book,
        notes,
        status: '読了(ノート完成)',
      });
      toast({
        title: 'ノート完成',
        description: 'ノートを完成しました！',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/notes');
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    console.error('Error saving notes:', error);
    toast({
      title: 'エラー',
      description: '読書ノートの保存に失敗しました。',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
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
              onClick={saveAndReturn}
              isDisabled={!notes.trim()}
              w={{ base: "100%", sm: "180px" }}
              h="44px"
            >
              保存して戻る
            </Button>
            <Button
              colorScheme="blue"
              onClick={completeNote}
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