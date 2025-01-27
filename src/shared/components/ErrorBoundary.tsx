import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack, Container } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxW="container.md" py={10}>
          <VStack spacing={6} align="stretch">
            <Heading size="xl" color="red.500">
              エラーが発生しました
            </Heading>
            <Box bg="red.50" p={6} borderRadius="lg">
              <Text color="red.700" fontWeight="bold" mb={2}>
                エラー内容:
              </Text>
              <Text color="red.600" whiteSpace="pre-wrap">
                {this.state.error?.message}
              </Text>
            </Box>
            <Button
              colorScheme="blue"
              onClick={() => window.location.reload()}
              size="lg"
            >
              ページを再読み込み
            </Button>
          </VStack>
        </Container>
      );
    }

    return this.props.children;
  }
}