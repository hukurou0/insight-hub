import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, VStack, HStack, Image } from '@chakra-ui/react';
import { ViewIcon, EditIcon } from '@chakra-ui/icons';
import OpenAI from 'openai';
import { keyframes } from '@emotion/react';

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

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// 本の表紙に適したアスペクト比（3:4）を設定
const videoConstraints = {
  facingMode: "environment",
  aspectRatio: 3 / 4,
  focusMode: "continuous"
};

export const BookCamera: React.FC<BookCameraProps> = ({ onBookInfoDetected, onSwitchToManual }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const captureImage = useCallback(async () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    // ここで width / height の指定を削除し、カメラの元の縦横比で取得
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);
    setIsCapturing(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "この本の表紙から本のタイトルと著者名を抽出してください。できるだけ正確に文字を認識してください。以下のJSON形式で返してください（マークダウンは使わないでください）: {\"title\": \"タイトル\", \"author\": \"著者名\", \"category\": \"カテゴリー\"}" 
              },
              {
                type: "image_url",
                image_url: {
                  url: imageSrc,
                  detail: "high"
                }
              }
            ],
          },
        ],
        max_tokens: 300,
      });

      const content = response.choices[0].message.content;
      if (content) {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const bookInfo = JSON.parse(jsonMatch[0]);
            onBookInfoDetected(bookInfo.title, bookInfo.author, bookInfo.category || '', imageSrc);
          }
        } catch (error) {
          console.error('Failed to parse book info:', error);
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsCapturing(false);
      setCapturedImage(null);
    }
  }, [onBookInfoDetected]);

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
              // cover にするとアスペクト比を維持しつつ領域いっぱいに拡大表示
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
                // 縦に引き延ばされるのを防ぐためにアスペクト比を保持
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
};
