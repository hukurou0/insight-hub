import {
  VStack,
  Heading,
  Box,
  Button,
  Text,
  Flex,
} from '@chakra-ui/react';
import { EditIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';

const noteTypes = [
  {
    id: 'simple',
    name: 'シンプルノート',
    description: '自由形式で読書の気づきや学びを記録できます。',
    path: '/books/:id/notes/simple'
  },
  // 将来的に他のノートタイプを追加する場合はここに追加
];

export const NoteTypeSelector = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Box>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Flex justify="space-between" align="center" mb={{ base: 2, md: 4 }}>
          <Heading size={{ base: "md", md: "lg" }}>ノートの種類を選択</Heading>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate(-1)}
            size={{ base: "sm", md: "md" }}
          >
            戻る
          </Button>
        </Flex>
        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
          {noteTypes.map((type) => (
            <Button
              key={type.id}
              onClick={() => navigate(type.path.replace(':id', id || ''))}
              height="auto"
              p={{ base: 4, md: 6 }}
              variant="outline"
              w="100%"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
              transition="all 0.2s"
            >
              <VStack spacing={1} align="center" w="full">
                <EditIcon />
                <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                  {type.name}
                </Text>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color="gray.600"
                  textAlign="center"
                >
                  {type.description}
                </Text>
              </VStack>
            </Button>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};