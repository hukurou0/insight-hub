import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, VStack, HStack, Image, useToast } from '@chakra-ui/react';
import { ViewIcon, EditIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import { api } from '../../../shared/services/api';

const flashAnimation = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

const shutterAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

interface BookCameraProps {
  onBookInfoDetected: (title: string, author: string, category: string, imageSrc?: string) => void;
  onSwitchToManual?: () => void;
}

// 本の表紙に適したアスペクト比(3:4)を設定
const videoConstraints = {
  facingMode: "environment",
  aspectRatio: 3 / 4,
  focusMode: "continuous"
};

export default function BookCamera({ onBookInfoDetected, onSwitchToManual }: BookCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const toast = useToast();

  const captureImage = useCallback(async () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);
    setIsCapturing(true);

    try {
      const bookInfo = await api.analyzeBookImage(imageSrc);
      onBookInfoDetected(bookInfo.title, bookInfo.author, bookInfo.category || '', imageSrc);
    } catch (error) {
      console.error('Error analyzing book:', error);
      toast({
        title: 'エラー',
        description: '本の解析に失敗しました。手動で入力してください。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      if (onSwitchToManual) {
        onSwitchToManual();
      }
    } finally {
      setIsCapturing(false);
    }
  }, [onBookInfoDetected, onSwitchToManual]);

  return (
    <VStack spacing={4} align="center">
      <Box
        position="relative" 
        width="100%" 
        maxW="300px"
        height="400px"
        animation={isCapturing ? `${shutterAnimation} 0.3s ease-in-out` : undefined}
      >
        {showFlash && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="white"
            zIndex={2}
            animation={`${flashAnimation} 0.3s ease-in-out`}
          />
        )}

        {capturedImage ? (
          <Box
            width="100%"
            height="100%"
            overflow="hidden"
            borderRadius="md"
          >
            <Image
              src={capturedImage}
              alt="Captured"
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
        ) : (
          <Box
            width="100%"
            height="100%"
            overflow="hidden"
            borderRadius="md"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              imageSmoothing={true}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        )}
      </Box>

      <HStack spacing={4} width="100%" justifyContent="center">
        {onSwitchToManual && (
          <Button
            leftIcon={<EditIcon />}
            onClick={onSwitchToManual}
            colorScheme="teal"
            variant="outline"
            flex={1}
          >
            テキストで入力
          </Button>
        )}
        <Button
          leftIcon={<ViewIcon />}
          onClick={captureImage}
          isLoading={isCapturing}
          loadingText="解析中..."
          colorScheme="blue"
          isDisabled={isCapturing}
          flex={1}
        >
          {isCapturing ? "解析中..." : "撮影"}
        </Button>
      </HStack>
    </VStack>
  );
}