import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  useDisclosure,
  Tooltip,
  Image,
  Box,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Book } from '../types/book';

interface BookListProps {
  books: Book[];
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
}

export default function BookList({ books, onUpdateBook, onDeleteBook }: BookListProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleStatusChange = (book: Book, newStatus: Book['status']) => {
    onUpdateBook({
      ...book,
      status: newStatus,
    });
  };

  const openNoteModal = (book: Book) => {
    setSelectedBook(book);
    setNoteText(book.notes || '');
    onOpen();
  };

  const saveNote = () => {
    if (selectedBook) {
      onUpdateBook({
        ...selectedBook,
        notes: noteText,
      });
      onClose();
    }
  };

  return (
    <>
      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {books.map((book) => (
          <GridItem key={book.id} w="100%">
            <Box
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              bg="white"
            >
              <Box position="relative" height="300px">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={`${book.title}の表紙`}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <Box
                    width="100%"
                    height="100%"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="gray.500">No Cover</Text>
                  </Box>
                )}
              </Box>

              <Box p={4}>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  {book.title}
                </Text>
                <Text fontSize="md" color="gray.600" mb={3}>
                  {book.author}
                </Text>

                <HStack spacing={2} mb={3}>
                  <Select
                    size="sm"
                    value={book.status}
                    onChange={(e) => handleStatusChange(book, e.target.value as Book['status'])}
                  >
                    <option value="未読">未読</option>
                    <option value="読書中">読書中</option>
                    <option value="読了">読了</option>
                  </Select>
                </HStack>

                {book.category && (
                  <Text fontSize="sm" color="gray.500" mb={3}>
                    カテゴリー: {book.category}
                  </Text>
                )}

                <HStack spacing={2} justifyContent="flex-end">
                  <Tooltip label="読書メモを編集">
                    <IconButton
                      aria-label="Edit notes"
                      icon={<EditIcon />}
                      onClick={() => openNoteModal(book)}
                      colorScheme="teal"
                      variant="ghost"
                      size="sm"
                    />
                  </Tooltip>
                  <Tooltip label="削除">
                    <IconButton
                      aria-label="Delete book"
                      icon={<DeleteIcon />}
                      onClick={() => onDeleteBook(book.id)}
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                    />
                  </Tooltip>
                </HStack>
              </Box>
            </Box>
          </GridItem>
        ))}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>読書メモ: {selectedBook?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="読んだ感想や気づきを記録しましょう..."
              size="lg"
              minH="300px"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button colorScheme="blue" onClick={saveNote}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}