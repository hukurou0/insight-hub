import { Container, Heading, VStack, useToast, Button, useDisclosure, Spinner, Center, Box } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Book } from './types/book';
import BookList from './components/BookList';
import AddBookForm from './components/AddBookForm';
import { BookSearch } from './components/BookSearch';
import { generateCoverImage } from './utils/generateCoverImage';
import { AddIcon } from '@chakra-ui/icons';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, signOut } = useAuth();

  // Supabaseからデータを読み込む
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
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (book: Book) => {
    try {
      const bookWithCover = {
        ...book,
        coverImage: book.coverImage || generateCoverImage(book.title, book.author)
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

  const updateBook = async (updatedBook: Book) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: updatedBook.title,
          author: updatedBook.author,
          status: updatedBook.status,
          category: updatedBook.category,
          cover_image: updatedBook.coverImage,
          notes: updatedBook.notes,
          last_read_date: updatedBook.lastReadDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedBook.id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      await fetchBooks();

      toast({
        title: '更新完了',
        description: '本の情報を更新しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: '本の更新に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      await fetchBooks();

      toast({
        title: '削除完了',
        description: '本を削除しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: '本の削除に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return <Auth />;
  }

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Heading size="md">読み込み中...</Heading>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} alignItems="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading>InsightHub</Heading>
          <Button onClick={() => signOut()} colorScheme="gray">
            ログアウト
          </Button>
        </Box>
        
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onOpen}
          size="lg"
        >
          本を追加
        </Button>
        
        <BookSearch 
          books={books} 
          onFilteredBooksChange={setFilteredBooks} 
        />
        
        <BookList 
          books={filteredBooks} 
          onUpdateBook={updateBook}
          onDeleteBook={deleteBook}
        />
        
        <AddBookForm 
          isOpen={isOpen}
          onClose={onClose}
          onAddBook={addBook}
        />
      </VStack>
    </Container>
  );
}

export default App;
