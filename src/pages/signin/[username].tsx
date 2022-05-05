import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Select,
  Stack,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdArrowBack, MdLogin } from 'react-icons/md';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useCallback, useContext, useEffect } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { GetServerSidePropsContext } from 'node_modules.nosync/next';
import Image from 'next/image';
import { Layout } from '@/components/templates';
import client from '@/services/apollo-client';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';

type SignInInputs = {
  username: string;
  password: string;
  service: string;
};

const COLLABORATOR_SERVICES = gql`
  query CollaboratorServices($username: String!) {
    collaboratorServices(username: $username) {
      id
      name
      unit {
        name
      }
    }
  }
`;

interface ServiceData {
  id: string;
  name: string;
  unit: {
    name: string;
  };
}

interface SignInStep2 {
  services: ServiceData[];
}

function SignInStep2({ services }: SignInStep2) {
  const router = useRouter();
  const { username, after } = router.query;
  const toast = useToast();
  const { register, handleSubmit, setValue } = useForm<SignInInputs>();

  const { signIn } = useContext(AuthContext);

  const inputVariant = useColorModeValue('floating-light', 'floating-dark');

  const handleSignIn: SubmitHandler<SignInInputs> = useCallback(
    async ({ username, password, service }) => {
      await signIn({
        username: username as string,
        password,
        redirectUrl: after as string,
      })
        .then(({ user }) => {
          localStorage.setItem('healthcare:serviceId', service);
          toast({
            title: 'Sucesso',
            description: `Olá ${user.collaborator.name}, bem vind@ de volta`,
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
          });
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
        });
    },
    [after, signIn, toast],
  );
  useEffect(() => {
    if (!services) {
      toast({
        title: 'Erro',
        description: 'Não há nenhum serviço para este Colaborador',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'bottom',
      });
      setTimeout(() => router.push('/signin'), 5000);
    }
  }, [router, services, toast]);

  return (
    <Layout
      title={(username as string) || '...'}
      isHeaded={false}
      isFooted={false}
    >
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
                    <FormControl variant={inputVariant} isRequired>
                      <Input
                        id="username"
                        placeholder=" "
                        required
                        value={(username as string) || '...'}
                        readOnly
                        isDisabled
                        {...register('username')}
                      />
                      <FormLabel>Usuário</FormLabel>
                    </FormControl>
                    <FormControl variant={inputVariant} isRequired>
                      <Select
                        placeholder="Selecione uma opção"
                        required
                        onFocus={() => {
                          setValue('username', username as string);
                        }}
                        {...register('service')}
                      >
                        {services &&
                          services.map((service: ServiceData) => (
                            <option key={service.id} value={service.id}>
                              {service.name} - {service.unit.name}
                            </option>
                          ))}
                      </Select>
                      <FormLabel>Serviço</FormLabel>
                    </FormControl>
                    <FormControl variant={inputVariant} isRequired>
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
                  <Stack spacing={4}>
                    <Button
                      colorScheme="blue"
                      type="submit"
                      leftIcon={<MdLogin size="20px" />}
                    >
                      Entrar
                    </Button>
                    <Button
                      colorScheme="gray"
                      leftIcon={<MdArrowBack size="20px" />}
                      onClick={() => router.push('/signin')}
                    >
                      Voltar
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </form>
          </Stack>
        </Stack>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { data } = await client.query({
    query: COLLABORATOR_SERVICES,
    variables: {
      username: context.query.username,
    },
  });

  console.log(data);

  return {
    props: {
      services: data.collaboratorServices,
    },
  };
}

export default SignInStep2;
