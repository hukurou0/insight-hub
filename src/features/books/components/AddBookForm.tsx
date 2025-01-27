import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  Image,
  Box,
  ModalFooter,
  useToast,
  Text,
  UnorderedList,
  ListItem,
  Stack,
} from '@chakra-ui/react';
import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { Book } from '../types/book';
import BookCamera from './BookCamera.js';
import { uploadImage } from '../../../shared/utils/image';

interface AddBookFormProps {
  onAddBook: (book: Book) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  title: string;
  author: string;
  category: string;
  coverImage: string | null;
  showCamera: boolean;
  showHelpModal: boolean;
}

const predefinedCategories = [
  'ビジネス',
  '技術書',
  '小説',
  '自己啓発',
  '歴史',
  '科学',
  'その他'
];

const initialState: FormState = {
  title: '',
  author: '',
  category: '',
  coverImage: null,
  showCamera: false,
  showHelpModal: true,
};

export default function AddBookForm({ onAddBook, isOpen, onClose }: AddBookFormProps) {
  const [state, setState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setState(prev => ({ ...prev, showHelpModal: true }));
    }
  }, [isOpen]);

  const handleStartCamera = () => {
    setState(prev => ({
      ...prev,
      showHelpModal: false,
      showCamera: true
    }));
  };

  const handleClose = () => {
    setState(initialState);
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!state.title || !state.author) return;

    setIsSubmitting(true);
    try {
      // 画像がある場合はSupabaseストレージにアップロード
      let coverImageUrl = null;
      if (state.coverImage) {
        const file = await fetch(state.coverImage).then(r => r.blob());
        coverImageUrl = await uploadImage(new File([file], 'cover.jpg', { type: 'image/jpeg' }));
      }

      const book: Book = {
        id: uuidv4(),
        title: state.title,
        author: state.author,
        status: '未読' as const,
        category: state.category,
        coverImage: coverImageUrl,
        lastReadDate: new Date().toISOString(),
      };

      await onAddBook(book);
      setState(initialState);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '本の追加中にエラーが発生しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookInfoDetected = async (
    detectedTitle: string, 
    detectedAuthor: string, 
    detectedCategory: string,
    imageSrc?: string
  ) => {
    setState({
      ...state,
      title: detectedTitle,
      author: detectedAuthor,
      category: detectedCategory,
      coverImage: imageSrc || null,
      showCamera: false,
    });
  };

  const handleSwitchToManual = () => {
    setState({
      ...state,
      showCamera: false
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>本を追加</ModalHeader>
        <ModalCloseButton />
        <ModalBody pt={0} mt={-4}>
          {state.showHelpModal ? (
            <VStack spacing={2} p={{ base: 2, md: 5 }}>
              <Box bg="blue.50" p={{ base: 3, md: 5 }} borderRadius="lg" w="100%">
                <Text fontSize="lg" fontWeight="bold" mb={2} color="blue.700">
                  カメラで本を追加
                </Text>
                <Text fontSize="md" color="gray.700">
                  本の表紙を撮影するだけで、タイトルや著者名を自動で読み取ることができます。
                </Text>
              </Box>
              <Box bg="gray.50" p={{ base: 3, md: 5 }} borderRadius="lg" w="100%">
                <Text fontSize="lg" fontWeight="bold" mb={1} color="gray.700">
                  使い方
                </Text>
                <UnorderedList spacing={{ base: 1.5, md: 3 }} pl={4} color="gray.700">
                  <ListItem>本の表紙全体が画面に収まるように調整してください</ListItem>
                  <ListItem>できるだけ明るい場所で撮影してください</ListItem>
                  <ListItem>表紙の文字が読みやすい角度で撮影してください</ListItem>
                  <ListItem>読み取った情報は後から編集できます</ListItem>
                </UnorderedList>
              </Box>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={{ base: 3, sm: 4 }}
                w="100%"
                mt={2}
              >
                <Button
                  onClick={() => setState(prev => ({
                    ...prev,
                    showHelpModal: false,
                    showCamera: false
                  }))}
                  variant="outline"
                  size={{ base: 'md', sm: 'lg' }}
                  width="full"
                  leftIcon={<EditIcon />}
                >
                  手動で入力
                </Button>
                <Button
                  onClick={handleStartCamera}
                  colorScheme="blue"
                  size={{ base: 'md', sm: 'lg' }}
                  width="full"
                  leftIcon={<ViewIcon />}
                >
                  カメラを起動
                </Button>
              </Stack>
            </VStack>
          ) : state.showCamera ? (
            <BookCamera 
              onBookInfoDetected={handleBookInfoDetected}
              onSwitchToManual={handleSwitchToManual}
            />
          ) : (
            <form id="add-book-form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {state.coverImage && (
                  <Box width="200px" height="300px">
                    <Image
                      src={state.coverImage}
                      alt="Book cover"
                      objectFit="cover"
                      width="100%"
                      height="100%"
                      borderRadius="md"
                    />
                  </Box>
                )}

                <FormControl isRequired>
                  <FormLabel>タイトル</FormLabel>
                  <Input
                    value={state.title}
                    onChange={(e) => setState({
                      ...state,
                      title: e.target.value
                    })}
                    placeholder="本のタイトルを入力"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>著者</FormLabel>
                  <Input
                    value={state.author}
                    onChange={(e) => setState({
                      ...state,
                      author: e.target.value
                    })}
                    placeholder="著者名を入力"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>カテゴリー</FormLabel>
                  <Select
                    value={state.category}
                    onChange={(e) => setState({
                      ...state,
                      category: e.target.value
                    })}
                    placeholder="カテゴリーを選択"
                  >
                    {predefinedCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  leftIcon={<EditIcon />}
                  onClick={() => setState({
                    ...state,
                    showCamera: true
                  })}
                  colorScheme="teal"
                  variant="outline"
                  width="100%"
                >
                  写真を撮り直す
                </Button>
              </VStack>
            </form>
          )}
        </ModalBody>
        {!state.showCamera && !state.showHelpModal && (
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              キャンセル
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleSubmit()}
              isLoading={isSubmitting}
              loadingText="追加中..."
              isDisabled={!state.title || !state.author}
            >
              追加
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}