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
  useToast,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useCallback, useContext, useState } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { Layout } from '@/components/templates';
import { MdLogin } from 'react-icons/md';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/router';

type SignInInputs = {
  username: string;
  password: string;
};

function SignIn() {
  const router = useRouter();
  const toast = useToast();
  const { signIn } = useContext(AuthContext);
  const { after }: { after?: string } = router.query;
  const [loading, setLoading] = useState(false);
  const inputVariant = useColorModeValue('floating-light', 'floating-dark');
  const { register, handleSubmit } = useForm<SignInInputs>();
  const handleSignIn: SubmitHandler<SignInInputs> = useCallback(
    async ({ username, password }) => {
      setLoading(true);
      await signIn({
        username,
        password,
        redirectUrl: after,
      })
        .then(({ user }) => {
          toast({
            title: 'Sucesso',
            description: `Olá ${user.colaborator.name}, bem vind@ de volta`,
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
          });
          setLoading(false);
        })
        .catch((error) => {
          toast({
            title: 'Erro',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
          });
          setLoading(false);
        });
    },
    [after, signIn, toast],
  );
  return (
    <Layout title="Entrar" isHeaded={false} isFooted={false}>
      <Container maxW="lg" py={{ base: '12', md: '24' }}>
        <Stack spacing="8">
          <Stack spacing={6}>
            <Box mx="auto" position={'relative'} h="150px" w="150px">
              <Image
                alt="logo"
                blurDataURL={useColorModeValue('/ln-light.png', '/ln-dark.png')}
                src={useColorModeValue('/ln-light.png', '/ln-dark.png')}
                layout="fill"
                quality={50}
              />
            </Box>
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
                    <Input
                      id="username"
                      placeholder=" "
                      required
                      {...register('username')}
                    />
                    <FormLabel>Usuário</FormLabel>
                  </FormControl>
                  <FormControl variant={inputVariant}>
                    <Input
                      id="password"
                      type="password"
                      placeholder=" "
                      autoComplete="current-password"
                      required
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
                    isLoading={loading}
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { ['healthcareToken']: token } = parseCookies(ctx);

  if (token) {
    return {
      redirect: {
        destination: '/',
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};

export default SignIn;
