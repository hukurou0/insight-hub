import { useState, memo } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = memo(({ 
  isSignUp, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword, 
  error, 
  loading, 
  handleSubmit 
}: {
  isSignUp: boolean;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  error: string;
  loading: boolean;
  handleSubmit: (isSignUp: boolean) => void;
}) => (
  <VStack spacing={4} w="100%">
    <FormControl isInvalid={!!error}>
      <FormLabel>メールアドレス</FormLabel>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        size="lg"
      />
    </FormControl>

    <FormControl isInvalid={!!error}>
      <FormLabel>パスワード</FormLabel>
      <InputGroup>
        <Input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="******"
          size="lg"
        />
        <InputRightElement h="full">
          <IconButton
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
            onClick={() => setShowPassword(!showPassword)}
            variant="ghost"
            size="sm"
          />
        </InputRightElement>
      </InputGroup>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>

    <Button
      colorScheme="blue"
      size="lg"
      width="100%"
      onClick={() => handleSubmit(isSignUp)}
      isLoading={loading}
      loadingText={isSignUp ? '登録中...' : 'ログイン中...'}
    >
      {isSignUp ? '新規登録' : 'ログイン'}
    </Button>
  </VStack>
));

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (isSignUp: boolean) => {
    setError('');
    
    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    if (!validatePassword(password)) {
      setError('パスワードは6文字以上である必要があります');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: '登録完了',
          description: '確認メールを送信しました。メールを確認してください。',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg={bgColor}
        borderColor={borderColor}
      >
        <VStack spacing={6}>
          <Heading size="xl" textAlign="center" mb={2}>
            InsightHub
          </Heading>
          <Text fontSize="lg" color="gray.600" textAlign="center" mb={6}>
          「ただ読むだけ」で終わらない体験を
          </Text>

          <Tabs isFitted variant="enclosed" width="100%">
            <TabList mb="1em">
              <Tab>ログイン</Tab>
              <Tab>新規登録</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <AuthForm
                  isSignUp={false}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  error={error}
                  loading={loading}
                  handleSubmit={handleSubmit}
                />
              </TabPanel>
              <TabPanel>
                <AuthForm
                  isSignUp={true}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  error={error}
                  loading={loading}
                  handleSubmit={handleSubmit}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </Container>
  );
}