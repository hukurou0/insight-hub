import React, { useState } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Select,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Book } from '../types/book';

interface BookSearchProps {
  books: Book[];
  onFilteredBooksChange: (filteredBooks: Book[]) => void;
}

export const BookSearch: React.FC<BookSearchProps> = ({ books, onFilteredBooksChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // すべての本から分類を抽出
  const allCategories = Array.from(new Set(books.map(book => book.category).filter(Boolean)));

  // あいまい検索の実装
  const fuzzySearch = (text: string, query: string): boolean => {
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // クエリの各文字が順番に出現するか確認
    let textIndex = 0;
    for (let queryIndex = 0; queryIndex < normalizedQuery.length; queryIndex++) {
      const queryChar = normalizedQuery[queryIndex];
      const foundIndex = normalizedText.indexOf(queryChar, textIndex);
      if (foundIndex === -1) return false;
      textIndex = foundIndex + 1;
    }
    return true;
  };

  const filterBooks = (query: string, category: string) => {
    return books.filter(book => {
      // カテゴリーによるフィルタリング
      const categoryMatches = category === '' || book.category === category;

      // あいまい検索
      if (query === '') return categoryMatches;

      const titleMatches = fuzzySearch(book.title, query);
      const authorMatches = fuzzySearch(book.author, query);
      const notesMatch = book.notes ? fuzzySearch(book.notes, query) : false;
      const categoryTextMatches = book.category ? fuzzySearch(book.category, query) : false;

      return (titleMatches || authorMatches || notesMatch || categoryTextMatches) && categoryMatches;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onFilteredBooksChange(filterBooks(query, selectedCategory));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    onFilteredBooksChange(filterBooks(searchQuery, category));
  };

  return (
    <VStack spacing={4} width="100%" mb={6}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.500" />
        </InputLeftElement>
        <Input
          placeholder="本のタイトル、著者、メモ内容であいまい検索..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </InputGroup>

      <HStack spacing={4} width="100%">
        <Box flex="1">
          <Select
            placeholder="カテゴリーで絞り込み"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {allCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Box>
      </HStack>
    </VStack>
  );
};