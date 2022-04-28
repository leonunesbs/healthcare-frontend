import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';

import { Layout } from '@/components/templates';
import { PasswordField } from '@/components/atoms';
import { useCallback } from 'react';
import { useRouter } from 'next/router';

function SignIn() {
  const router = useRouter();
  const handleSignIn = useCallback(() => {
    console.log('Sign in');
  }, []);
  return (
    <Layout title="Entrar" isHeaded={false} isFooted={false}>
      <Container maxW="lg" py={{ base: '12', md: '24' }}>
        <Stack spacing="8">
          <Stack spacing="6">
            <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
              <Heading
                as="h1"
                size={useBreakpointValue({ base: 'xs', md: 'sm' })}
              >
                Acesse a sua conta
              </Heading>
              <Stack direction={['column', 'row']} spacing="1" justify="center">
                <Text color="muted">Não possui uma conta?</Text>
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => router.push('/signup')}
                >
                  Cadastre-se
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '0', sm: '10' }}
            bgColor={['transparent', 'white']}
            boxShadow={{ base: 'none', sm: useColorModeValue('md', 'md-dark') }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="username">Usuário</FormLabel>
                  <Input id="username" bgColor={'white'} />
                </FormControl>
                <PasswordField />
              </Stack>
              <HStack justify="flex-end">
                <Button
                  variant="link"
                  colorScheme="blue"
                  size="sm"
                  onClick={() => router.push('/forgot-password')}
                >
                  Esqueceu sua senha?
                </Button>
              </HStack>
              <Stack spacing="6">
                <Button colorScheme="blue" onClick={handleSignIn}>
                  Entrar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Layout>
  );
}

export default SignIn;
