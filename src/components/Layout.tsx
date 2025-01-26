import { Box, Container, Flex, Heading, Button, HStack, useBreakpointValue, useDisclosure, IconButton, Image } from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { Profile } from './Profile';
import { SettingsIcon } from '@chakra-ui/icons';

export const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const TabButton = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Button
      as={RouterLink}
      to={to}
      variant="unstyled"
      position="relative"
      height="40px"
      px={4}
      fontSize={isMobile ? "sm" : "md"}
      color={isActive(to) ? "blue.500" : "gray.600"}
      fontWeight={isActive(to) ? "bold" : "normal"}
      _hover={{
        color: "blue.500",
      }}
      sx={{
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '2px',
          bg: isActive(to) ? 'blue.500' : 'transparent',
          transition: 'all 0.2s'
        },
        '&:hover::after': {
          bg: 'blue.500',
          opacity: isActive(to) ? 1 : 0.5
        }
      }}
    >
      {children}
    </Button>
  );

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200" w="100%">
        <Container maxW="container.lg">
          <Flex
            direction={isMobile ? 'column' : 'row'}
            justify="space-between"
            align="center"
            w="100%"
            gap={isMobile ? 3 : 4}
            py={isMobile ? 2 : 3}
          >
            <Flex 
              justify="space-between" 
              align="center" 
              w={isMobile ? "100%" : "auto"}
              gap={8}
            >
              <Flex as={RouterLink} to="/" align="center" gap={2}>
                <Image
                  src="/icon.webp"
                  alt="InsightHub Logo"
                  width="32px"
                  height="32px"
                  objectFit="contain"
                />
                <Heading size="lg">
                  InsightHub
                </Heading>
              </Flex>

              {!isMobile && (
                <HStack spacing={1} height="40px">
                  <TabButton to="/notes">読書ノート</TabButton>
                  <TabButton to="/search">本を探す</TabButton>
                </HStack>
              )}

              <IconButton
                aria-label="アカウント設定"
                icon={<SettingsIcon />}
                variant="ghost"
                onClick={onOpen}
                display={isMobile ? "flex" : "none"}
              />
            </Flex>
            
            {isMobile && (
              <Flex direction="column" width="100%" align="center">
                <HStack spacing={1} borderBottom="1px" borderColor="gray.200" width="100%" justify="center">
                  <TabButton to="/notes">読書ノート</TabButton>
                  <TabButton to="/search">本を探す</TabButton>
                </HStack>
              </Flex>
            )}

            {!isMobile && (
              <IconButton
                aria-label="アカウント設定"
                icon={<SettingsIcon />}
                variant="ghost"
                onClick={onOpen}
              />
            )}
          </Flex>
        </Container>
      </Box>

      <Box flex="1" width="100%">
        <Container maxW="container.lg" py={isMobile ? 4 : 8}>
          <Outlet />
        </Container>
      </Box>

      <Profile isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};