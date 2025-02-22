import { useState, memo, useRef, useEffect } from 'react';
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
}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <VStack spacing={4} w="100%">
      <FormControl isInvalid={!!error}>
        <FormLabel>メールアドレス</FormLabel>
        <Input
          ref={emailInputRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              if (passwordInputRef.current) {
                passwordInputRef.current.focus();
              }
            }
          }}
          placeholder="your@email.com"
          size="lg"
          isDisabled={loading}
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
        />
      </FormControl>

      <FormControl isInvalid={!!error}>
        <FormLabel>パスワード</FormLabel>
        <InputGroup>
          <Input
            ref={passwordInputRef}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleSubmit(isSignUp);
              }
            }}
            placeholder="******"
            size="lg"
            isDisabled={loading}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            autoCapitalize="none"
          />
          <InputRightElement h="full">
            <IconButton
              aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              onClick={() => setShowPassword(!showPassword)}
              variant="ghost"
              size="sm"
              isDisabled={loading}
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
        isDisabled={!email || !password || loading}
      >
        {isSignUp ? '新規登録' : 'ログイン'}
      </Button>
    </VStack>
  );
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const toast = useToast();

  const bgColor = 'white';
  const borderColor = 'gray.200';

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (isSignUp: boolean) => {
    if (loading) return;
    
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
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('予期せぬエラーが発生しました');
      }
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
            "読むだけ"で終わらない
            <br />
            学びの新体験を
          </Text>

          <Tabs
            isFitted
            variant="line"
            width="100%"
            colorScheme="blue"
          >
            <TabList
              mb="1.5em"
              borderBottom="2px solid"
              borderColor="gray.200"
            >
              <Tab
                py={3}
                px={8}
                fontSize="lg"
                fontWeight="medium"
                _selected={{
                  color: 'blue.600',
                  borderBottom: "4px solid",
                  borderColor: "blue.500",
                  fontWeight: "bold",
                  marginBottom: "-2px"
                }}
                _hover={{
                  color: 'blue.400'
                }}
                isDisabled={loading}
              >
                ログイン
              </Tab>
              <Tab
                py={3}
                px={8}
                fontSize="lg"
                fontWeight="medium"
                _selected={{
                  color: 'blue.600',
                  borderBottom: "4px solid",
                  borderColor: "blue.500",
                  fontWeight: "bold",
                  marginBottom: "-2px"
                }}
                _hover={{
                  color: 'blue.400'
                }}
                isDisabled={loading}
              >
                新規登録
              </Tab>
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