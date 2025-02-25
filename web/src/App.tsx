import { Center, VStack } from '@chakra-ui/react';
import TrueFocus from './shared/components/TrueFocus';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth, useAuth } from './features/auth';
import { Layout } from './features/layout';
import { api } from './shared/services/api';
import {
  SearchPage,
  BookNotes,
  BookDetails,
} from './features/books';
import {
  NoteTypeSelector,
  SimpleNote,
} from './features/notes';
import { useState, useEffect } from 'react';
import { BooksProvider, useBooks } from './features/books/contexts/BooksContext';

function AppContent() {
  const { user, loading } = useAuth();
  const { setBooks, isLoaded } = useBooks();
  const [showLoading, setShowLoading] = useState(true);
  const MIN_LOADING_TIME = 1650;

  useEffect(() => {
    const prefetchData = async () => {
      if (user && !isLoaded) {
        try {
          const books = await api.fetchBooksWithNotes(user.id);
          setBooks(books);
        } catch (error) {
          console.error('Failed to prefetch books:', error);
        }
      }
    };

    if (!loading) {
      Promise.all([
        prefetchData(),
        new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME))
      ]).then(() => {
        setShowLoading(false);
      });
    }
  }, [loading, user, setBooks, isLoaded]);

  if (showLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <TrueFocus 
            sentence="Insight Hub"
            manualMode={false}
            blurAmount={5}
            borderColor="blue"
            animationDuration={0.5}
            pauseBetweenAnimations={0.5}
          />
        </VStack>
      </Center>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* デフォルトで読書ノートページに遷移 */}
          <Route index element={<Navigate to="/notes" replace />} />
          
          {/* 本の検索ページ */}
          <Route path="search" element={<SearchPage />} />
          
          {/* 読書ノートページ */}
          <Route path="notes" element={<BookNotes />} />
          
          {/* 本の詳細ページ */}
          <Route path="books/:id" element={<BookDetails />} />

          {/* ノートタイプ選択ページ */}  
          <Route path="books/:id/write" element={<NoteTypeSelector />} />

          {/* シンプルノートページ */}
          <Route path="books/:id/notes/simple" element={<SimpleNote />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
      <BooksProvider>
        <AppContent />
      </BooksProvider>
  );
}

export default App;
