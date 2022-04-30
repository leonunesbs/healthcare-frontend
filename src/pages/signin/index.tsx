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
import { SubmitHandler, useForm } from 'react-hook-form';
import { useCallback, useContext } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { Layout } from '@/components/templates';
import { MdLogin } from 'node_modules.nosync/react-icons/md';
import { useRouter } from 'next/router';

type SignInInputs = {
  username: string;
  password: string;
};

function SignIn() {
  const { signIn } = useContext(AuthContext);
  const router = useRouter();
  const inputVariant = useColorModeValue('floating-light', 'floating-dark');
  const { register, handleSubmit } = useForm<SignInInputs>();
  const handleSignIn: SubmitHandler<SignInInputs> = useCallback(
    (data) => {
      signIn({
        username: data.username,
        password: data.password,
      });
    },
    [signIn],
  );
  return (
    <Layout title="Entrar" isHeaded={false} isFooted={false}>
      <Container maxW="lg" py={{ base: '12', md: '24' }}>
        <Stack spacing="8">
          <Stack spacing={6}>
            <Stack spacing={6} textAlign="center">
              <Heading
                as="h1"
                size={useBreakpointValue({ base: 'md', md: 'lg' })}
              >
                Acesse a sua conta
              </Heading>
              <Stack
                direction={['column', 'row']}
                spacing={['0', '2']}
                justify="center"
              >
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
          <form onSubmit={handleSubmit(handleSignIn)}>
            <Box
              py={{ base: '0', sm: '8' }}
              px={{ base: '0', sm: '10' }}
              bgColor={['transparent', 'rgba(255, 255, 255, 0.01)']}
              boxShadow={{
                base: 'none',
                sm: useColorModeValue('md', 'md-dark'),
              }}
              borderRadius={{ base: 'none', sm: 'xl' }}
            >
              <Stack spacing="6">
                <Stack spacing="5">
                  <FormControl variant={inputVariant}>
                    <Input placeholder=" " {...register('username')} />
                    <FormLabel>Usuário</FormLabel>
                  </FormControl>
                  <FormControl variant={inputVariant}>
                    <Input
                      type="password"
                      placeholder=" "
                      autoComplete="current-password"
                      {...register('password')}
                    />
                    <FormLabel>Senha</FormLabel>
                  </FormControl>
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
                  <Button
                    colorScheme="blue"
                    type="submit"
                    leftIcon={<MdLogin size="20px" />}
                  >
                    Entrar
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </form>
        </Stack>
      </Container>
    </Layout>
  );
}

export default SignIn;
