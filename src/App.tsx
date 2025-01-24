import { Container, Heading, VStack, useToast, Button, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Book } from './types/book';
import BookList from './components/BookList';
import AddBookForm from './components/AddBookForm';
import { BookSearch } from './components/BookSearch';
import { generateCoverImage } from './utils/generateCoverImage';
import { AddIcon } from '@chakra-ui/icons';

const STORAGE_KEY = 'bookTracker_books';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    const savedBooks = localStorage.getItem(STORAGE_KEY);
    if (savedBooks) {
      try {
        const parsedBooks = JSON.parse(savedBooks);
        setBooks(parsedBooks);
        setFilteredBooks(parsedBooks);
      } catch (error) {
        toast({
          title: 'エラー',
          description: 'データの読み込みに失敗しました。',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, []);

  // データをローカルストレージに保存
  const saveToLocalStorage = (updatedBooks: Book[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'データの保存に失敗しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addBook = (book: Book) => {
    // 表紙画像がない場合、デフォルトの画像を生成
    const bookWithCover = {
      ...book,
      coverImage: book.coverImage || generateCoverImage(book.title, book.author)
    };

    setBooks(prevBooks => {
      const newBooks = [...prevBooks, bookWithCover];
      saveToLocalStorage(newBooks);
      setFilteredBooks(newBooks);
      return newBooks;
    });

    toast({
      title: '追加完了',
      description: '本を追加しました。',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // モーダルを閉じる
    onClose();
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prevBooks => {
      const newBooks = prevBooks.map(book => 
        book.id === updatedBook.id ? updatedBook : book
      );
      saveToLocalStorage(newBooks);
      setFilteredBooks(newBooks);
      return newBooks;
    });

    toast({
      title: '更新完了',
      description: '本の情報を更新しました。',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const deleteBook = (id: string) => {
    setBooks(prevBooks => {
      const newBooks = prevBooks.filter(book => book.id !== id);
      saveToLocalStorage(newBooks);
      setFilteredBooks(newBooks);
      return newBooks;
    });

    toast({
      title: '削除完了',
      description: '本を削除しました。',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} alignItems="stretch">
        <Heading textAlign="center">読書記録</Heading>
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
