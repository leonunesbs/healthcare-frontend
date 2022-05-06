import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { Layout } from '@/components/templates';
import { MdSend } from 'react-icons/md';
import { parseCookies } from 'nookies';
import { useCallback } from 'react';
import { useRouter } from 'next/router';

type SignInStep1Inputs = {
  username: string;
};

function SignInStep1() {
  const router = useRouter();
  const { after } = router.query;
  const { register, handleSubmit } = useForm<SignInStep1Inputs>();

  const handleSignIn: SubmitHandler<SignInStep1Inputs> = useCallback(
    ({ username }) => {
      router.push(
        `/signin/${username}${after ? `?after=${after}` : ''}`,
        undefined,
        { scroll: true },
      );
    },
    [after, router],
  );

  return (
    <Layout title="Entrar" isHeaded={false} isFooted={false}>
      <Container py={{ base: '12', md: '24' }} maxW="lg">
        <Stack spacing="8">
          <Stack spacing={6}>
            <Box
              as={Button}
              mx="auto"
              position={'relative'}
              h="150px"
              w="150px"
              variant="unstyled"
              onClick={() => router.push('/')}
            >
              <Image
                alt="logo"
                placeholder="blur"
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
                  <FormControl variant="floating">
                    <Input
                      id="username"
                      placeholder=" "
                      required
                      {...register('username')}
                    />
                    <FormLabel>Usuário</FormLabel>
                  </FormControl>
                </Stack>
                <Stack spacing="6">
                  <Button
                    colorScheme="blue"
                    type="submit"
                    leftIcon={<MdSend size="20px" />}
                  >
                    Continuar
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

export default SignInStep1;
