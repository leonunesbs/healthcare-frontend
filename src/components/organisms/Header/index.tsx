import {
  Box,
  BoxProps,
  Button,
  Container,
  HStack,
  IconButton,
  LinkBox,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdDarkMode, MdLightMode, MdLogin, MdLogout } from 'react-icons/md';
import { ReactNode, useContext, useEffect } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { CustomLink } from '@/components/atoms';
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
    <>
      <Container maxW="8xl" px={4} py={2} {...rest}>
        <HStack justify={'space-between'}>
          <LinkBox
            position={'relative'}
            h={['3rem', '4rem', '5rem']}
            w={['3rem', '4rem', '5rem']}
          >
            <CustomLink href="/">
              <Image
                alt="logo"
                placeholder="blur"
                blurDataURL={useColorModeValue('/ln-light.png', '/ln-dark.png')}
                src={useColorModeValue('/ln-light.png', '/ln-dark.png')}
                layout="fill"
                quality={100}
              />
            </CustomLink>
          </LinkBox>
          <HStack as="nav" display={['none', 'block']} spacing={[8, 10]}>
            <Button
              variant={'ghost'}
              isActive={router.pathname === '/'}
              colorScheme="blue"
            >
              <CustomLink href="/">Início</CustomLink>
            </Button>
            <Button
              variant={'ghost'}
              isActive={router.pathname === '/attendances'}
              colorScheme="blue"
            >
              <CustomLink href="/attendances">Atendimentos</CustomLink>
            </Button>
            <Button
              variant={'ghost'}
              isActive={router.pathname === '/patients'}
              colorScheme="blue"
            >
              <CustomLink href="/patients">Pacientes</CustomLink>
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
                <Text fontSize="sm">Olá, {user?.collaborator.name}</Text>
                <Button
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
                  variant="solid"
                  colorScheme="blue"
                  leftIcon={<MdLogin size="20px" />}
                >
                  <CustomLink href="/signin">Entrar</CustomLink>
                </Button>
              </Stack>
            )}
          </HStack>
        </HStack>
      </Container>
      <Box
        h="0.5"
        bg={useColorModeValue('gray.500', 'gray.200')}
        mb={['4', '6']}
      />
    </>
  );
};

export default Header;
