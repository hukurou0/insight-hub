import {
  VStack,
  Heading,
  Box,
  Button,
  Text,
  Flex,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { EditIcon, ArrowBackIcon } from '@chakra-ui/icons';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const noteTypes = [
  {
    id: 'simple',
    name: 'シンプルノート',
    description: '自由形式で読書の気づきや学びを記録できます。',
    path: '/books/:id/notes/simple',
    disabled: false
  },
  {
    id: 'kwl',
    name: 'KWL表',
    description: '「知っていること」「知りたいこと」「学んだこと」の3つの視点で読書を整理します。\n実用書や専門書に最適。',
    path: '/books/:id/notes/kwl',
    disabled: true,
    comingSoon: true
  },
  {
    id: 'negima',
    name: 'ねぎま式',
    description: '印象に残った文章の抜き書きと感想を交互に記録する読書ノートです。\n小説や教養書に最適。',
    path: '/books/:id/notes/negima',
    disabled: true,
    comingSoon: true
  }
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
          {noteTypes.map((type, index) => (
            <React.Fragment key={type.id}>
              {index === 1 && (
                <>
                  <Divider my={4} borderWidth="2px" borderColor="gray.200" />
                  <Flex align="center" gap={2} px={2} pb={2}>
                    <StarIcon color="yellow.400" />
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      プレミアムプラン限定機能（近日公開！）
                    </Text>
                  </Flex>
                </>
              )}
              <Button
                key={type.id}
                onClick={() => !type.disabled && navigate(type.path.replace(':id', id || ''))}
                height="auto"
                p={{ base: 4, md: 6 }}
                variant="outline"
                w="100%"
                _hover={{
                  transform: type.disabled ? 'none' : 'translateY(-2px)',
                  boxShadow: type.disabled ? 'none' : 'md',
                }}
                transition="all 0.2s"
                isDisabled={type.disabled}
                cursor={type.disabled ? 'not-allowed' : 'pointer'}
                bg={type.disabled ? 'purple.50' : 'transparent'}
                borderColor={type.disabled ? 'purple.200' : 'gray.200'}
                _disabled={{
                  opacity: 0.9,
                  bg: 'purple.50',
                  borderColor: 'purple.200'
                }}
              >
                <VStack spacing={2} align="center" w="full">
                  <Flex align="center" gap={2}>
                    <EditIcon />
                    <Text
                      fontWeight="bold"
                      fontSize={{ base: "md", md: "lg" }}
                      color={type.disabled ? 'purple.700' : undefined}
                    >
                      {type.name}
                    </Text>
                    {type.comingSoon && (
                      <Badge
                        colorScheme="purple"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        Coming Soon
                      </Badge>
                    )}
                  </Flex>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color={type.disabled ? 'purple.600' : undefined}
                    textAlign="center"
                    whiteSpace="pre-wrap"
                    overflowWrap="break-word"
                  >
                    {type.description}
                  </Text>
                </VStack>
              </Button>
            </React.Fragment>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};