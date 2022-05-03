import {
  Box,
  BoxProps,
  Button,
  Container,
  HStack,
  IconButton,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdDarkMode,
  MdLightMode,
  MdLogin,
  MdLogout,
} from 'node_modules.nosync/react-icons/md';
import { ReactNode, useContext, useEffect } from 'react';

import { AuthContext } from '@/context/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/router';

export interface HeaderProps extends BoxProps {
  children?: ReactNode;
}

const Header = ({ ...rest }: HeaderProps) => {
  const router = useRouter();
  const { signOut, isAuthenticated, user, checkToken } =
    useContext(AuthContext);
  const { toggleColorMode, colorMode } = useColorMode();
  useEffect(() => {
    checkToken();
  }, [checkToken]);
  return (
    <Container maxW="8xl" px={4} py={2} {...rest}>
      <HStack justify={'space-between'}>
        <Box
          as={Button}
          variant="unstyled"
          position={'relative'}
          h={['3rem', '4rem', '5rem']}
          w={['3rem', '4rem', '5rem']}
          onClick={() => router.push('/')}
        >
          <Image
            alt="logo"
            placeholder="blur"
            blurDataURL={useColorModeValue('/ln-light.png', '/ln-dark.png')}
            src={useColorModeValue('/ln-light.png', '/ln-dark.png')}
            layout="fill"
            quality={100}
          />
        </Box>
        <HStack as="nav" display={['none', 'block']} spacing={[8, 10]}>
          <Button
            variant={'link'}
            isActive={router.pathname === '/'}
            colorScheme="blue"
            onClick={() => router.push('/')}
          >
            Início
          </Button>
          <Button
            variant={'link'}
            isActive={router.pathname === '/attendances'}
            colorScheme="blue"
            onClick={() => router.push('/attendances')}
          >
            Atendimentos
          </Button>
          <Button
            variant={'link'}
            isActive={router.pathname === '/patients'}
            colorScheme="blue"
            onClick={() => router.push('/patients')}
          >
            Pacientes
          </Button>
        </HStack>
        <HStack>
          <IconButton
            aria-label="light"
            variant={'ghost'}
            colorScheme="blue"
            icon={
              colorMode === 'light' ? (
                <MdDarkMode size="20px" />
              ) : (
                <MdLightMode size="20px" />
              )
            }
            onClick={toggleColorMode}
          />
          {isAuthenticated && (
            <Stack>
              <Text fontSize="sm">Olá, {user?.colaborator.name}</Text>
              <Button
                id="SignOut"
                variant="ghost"
                size="sm"
                colorScheme="blue"
                onClick={signOut}
                leftIcon={<MdLogout size="20px" />}
              >
                Sair
              </Button>
            </Stack>
          )}
          {!isAuthenticated && (
            <Stack>
              <Button
                id="SignIn"
                variant={'solid'}
                colorScheme="blue"
                onClick={() => router.push('/signin')}
                leftIcon={<MdLogin size="20px" />}
              >
                Entrar
              </Button>
            </Stack>
          )}
        </HStack>
      </HStack>
    </Container>
  );
};

export default Header;
