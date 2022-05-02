import {
  Box,
  BoxProps,
  Button,
  HStack,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
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
  const { toggleColorMode } = useColorMode();
  useEffect(() => {
    checkToken();
  }, [checkToken]);
  return (
    <Box maxW="8xl" mx="auto" px={2} py={2} {...rest}>
      <HStack justify={'space-between'}>
        <Box position={'relative'} h="45px" w="45px">
          <Image
            alt="logo"
            src={useColorModeValue('/ln-light.png', '/ln-dark.png')}
            layout="fill"
            quality={50}
          />
        </Box>
        <HStack as="nav" display={['none', 'block']}>
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
        {isAuthenticated ? (
          <HStack>
            <Button onClick={toggleColorMode}>Luz</Button>
            <Stack>
              <Text>Olá, {user?.colaborator.name}</Text>
              <Button
                id="SignOut"
                variant="link"
                colorScheme="blue"
                onClick={signOut}
              >
                Sair
              </Button>
            </Stack>
          </HStack>
        ) : (
          <Button
            id="SignIn"
            variant="link"
            colorScheme="blue"
            onClick={() => router.push('/signin')}
          >
            Entrar
          </Button>
        )}
      </HStack>
    </Box>
  );
};

export default Header;
