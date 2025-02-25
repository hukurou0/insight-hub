import { Center, VStack } from '@chakra-ui/react';
import TrueFocus from './shared/components/TrueFocus';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './shared/services/queryClient';
//import { useBooks } from './features/books/hooks/useBooks';

function AppContent() {
  const { user, loading } = useAuth();
  //const { books } = useBooks();
  const [showLoading, setShowLoading] = useState(true);
  const MIN_LOADING_TIME = 1650;

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setShowLoading(false);
      }, MIN_LOADING_TIME);
    }
  }, [loading]);

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
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* ルートにアクセスされた場合、/notes にリダイレクト */}
          <Route index element={<Navigate to="/notes" replace />} />
          <Route path="notes" element={<BookNotes />} />
          {/* 他のルート */}
          <Route path="search" element={<SearchPage />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="books/:id/write" element={<NoteTypeSelector />} />
          <Route path="books/:id/notes/simple" element={<SimpleNote />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
