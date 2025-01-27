import { Spinner, Center, VStack, Heading } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth, useAuth } from './features/auth';
import { Layout } from './features/layout';
import {
  SearchPage,
  BookNotes,
  BookDetails,
} from './features/books';
import {
  NoteTypeSelector,
  SimpleNote,
} from './features/notes';

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

          {/* ノートタイプ選択ページ */}  
          <Route path="books/:id/write" element={<NoteTypeSelector />} />

          {/* シンプルノートページ */}
          <Route path="books/:id/notes/simple" element={<SimpleNote />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
