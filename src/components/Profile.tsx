import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Profile = ({ isOpen, onClose }: ProfileProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>アカウント</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} pb={6} align="stretch">
            <VStack spacing={4} align="center">
              <Avatar
                size="xl"
                name={user?.email || undefined}
                src={user?.user_metadata?.avatar_url}
              />
              <Text fontSize="lg" fontWeight="bold">
                {user?.email}
              </Text>
            </VStack>

            <Divider />

            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleSignOut}
              width="100%"
            >
              ログアウト
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};