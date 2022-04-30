import { Box, BoxProps, Button, HStack, useColorMode } from '@chakra-ui/react';
import { ReactNode, useContext } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export interface HeaderProps extends BoxProps {
  children?: ReactNode;
}

const Header = ({ ...rest }: HeaderProps) => {
  const router = useRouter();
  const { signOut, isAuthenticated } = useContext(AuthContext);
  const { toggleColorMode } = useColorMode();
  return (
    <Box {...rest}>
      <HStack>
        <Box>Logo</Box>
        <HStack>
          <Button
            variant={'link'}
            colorScheme="blue"
            onClick={() => router.push('/')}
          >
            Início
          </Button>
          <Button
            variant={'link'}
            colorScheme="blue"
            onClick={() => router.push('/patients')}
          >
            Pacientes
          </Button>
        </HStack>
        <Button onClick={toggleColorMode}>Luz</Button>
        {isAuthenticated ? (
          <Button variant="link" colorScheme="blue" onClick={signOut}>
            Sair
          </Button>
        ) : (
          <Button
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
