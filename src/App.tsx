import { Spinner, Center, VStack, Heading } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import { Layout } from './components/Layout';
import { SearchPage } from './components/SearchPage';
import { BookNotes } from './components/BookNotes';
import { BookDetails } from './components/BookDetails';
import { NoteTypeSelector } from './components/NoteTypeSelector';
import { SimpleNote } from './components/SimpleNote';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Heading size="md">読み込み中...</Heading>
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
          <Route path="books/:id/write" element={<NoteTypeSelector />} />
          <Route path="books/:id/notes/simple" element={<SimpleNote />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
