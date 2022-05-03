import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { MdAdd, MdClose, MdSave, MdSearch } from 'react-icons/md';
import { SubmitHandler, useForm } from 'react-hook-form';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useCallback, useContext, useEffect, useState } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { GetServerSideProps } from 'next';
import { IEvaluation } from '@/interfaces/Evaluation';
import { IPatient } from '@/interfaces/Patient';
import { Layout } from '@/components/templates';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/router';

const PATIENTS_QUERY = gql`
  query allPatients($fullName: String, $first: Int) {
    allPatients(fullName_Icontains: $fullName, first: $first, offset: 0) {
      edges {
        node {
          id
          fullName
          age
          birthDate
          latestEvaluation
          evaluations {
            edges {
              node {
                id
                createdAt
                updatedAt
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const CREATE_PATIENT = gql`
  mutation createPatient(
    $fullName: String!
    $birthDate: DateTime!
    $email: String
    $phone: String
  ) {
    createPatient(
      fullName: $fullName
      birthDate: $birthDate
      email: $email
      phone: $phone
    ) {
      created
      patient {
        id
        fullName
      }
    }
  }
`;

interface PatientNode extends IPatient {
  evaluations: {
    edges: {
      node: IEvaluation;
    }[];
  };
  latestEvaluation: string;
}

type PatientsQueryData = {
  allPatients: {
    edges: {
      node: PatientNode;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
};

type SearchInputs = {
  fullName: string;
};

type CreatePatientInputs = {
  fullName: string;
  birthDate: string;
  email?: string;
  phone?: string;
};

function Patients() {
  const router = useRouter();
  const toast = useToast();
  const { token, isAuthenticated } = useContext(AuthContext);
  const { fullName } = router.query;
  const [fullNameState, setFullNameState] = useState<string>(
    fullName as string,
  );
  const [first, setFirst] = useState(15);
  const { register, handleSubmit } = useForm<SearchInputs>();
  const createPatientForm = useForm<CreatePatientInputs>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputVariant = useColorModeValue('floating-light', 'floating-dark');

  const { data, refetch } = useQuery<PatientsQueryData>(PATIENTS_QUERY, {
    variables: {
      first: 15,
    },
    context: {
      headers: {
        authorization: `JWT ${token}`,
      },
    },
  });

  const [createPatient] = useMutation(CREATE_PATIENT);

  const searchSubmit: SubmitHandler<SearchInputs> = useCallback(
    ({ fullName }) => {
      setFullNameState(fullName);
      if (!fullName) {
        router.replace({
          pathname: '/patients',
        });
      } else {
        router.replace({
          pathname: '/patients',
          query: { fullName },
        });
      }
      refetch({
        fullName: fullName.toUpperCase(),
        first,
      });
    },
    [first, refetch, router],
  );

  const handleCreatePatient: SubmitHandler<CreatePatientInputs> = useCallback(
    async ({ fullName, birthDate, email, phone }) => {
      await createPatient({
        variables: {
          fullName: fullName.toUpperCase(),
          email: email?.toLowerCase(),
          phone,
          birthDate: new Date(
            new Date(birthDate).toLocaleString('en-US', { timeZone: 'UTC' }),
          ),
        },
      }).then(({ data }) => {
        if (data?.createPatient?.created) {
          toast({
            title: 'Paciente criado',
            description: 'Paciente criado com sucesso',
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
          });

          onClose();
          refetch({
            fullName: data?.createPatient?.patient.fullName.toUpperCase(),
            first,
          });
        } else {
          toast({
            title: 'Atenção',
            description: 'Paciente já existe',
            status: 'warning',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
          });
          router.push(`/patient/${data?.createPatient?.patient?.id}`);
        }
      });
    },
    [createPatient, first, onClose, refetch, router, toast],
  );

  const handleFetchMore = useCallback(async () => {
    setFirst(first + 5);
    refetch({
      fullName: fullNameState.toUpperCase(),
      first: first + 5,
    });
  }, [first, fullNameState, refetch]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Atenção',
        description: 'Você não está autenticado',
        status: 'warning',
        duration: 9000,
        isClosable: true,
        position: 'bottom',
      });
      router.push(`/signin?after=${router.pathname}`);
    }
  }, [isAuthenticated, router, toast]);

  return (
    <Layout title="Pacientes">
      <Stack spacing={[4, 8]}>
        <Box
          py={{ base: '2', sm: '8' }}
          px={{ base: '2', sm: '10' }}
          boxShadow={['none', 'md']}
          borderRadius={{ base: 'none', sm: 'xl' }}
          bgColor="rgb(255, 255, 255, 0.01)"
        >
          <form onSubmit={handleSubmit(searchSubmit)}>
            <Stack>
              <FormControl variant={inputVariant}>
                <Input
                  type="text"
                  placeholder=" "
                  defaultValue={fullNameState as string}
                  textTransform={'uppercase'}
                  {...register('fullName', {
                    onChange: handleSubmit(searchSubmit),
                  })}
                />
                <FormLabel>Buscar paciente</FormLabel>
              </FormControl>
              <HStack justify={'flex-end'}>
                <Button leftIcon={<MdAdd size="20px" />} onClick={onOpen}>
                  Novo Paciente
                </Button>
                <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay />
                  <ModalContent
                    bgColor={useColorModeValue('white', 'gray.800')}
                  >
                    <form
                      onSubmit={createPatientForm.handleSubmit(
                        handleCreatePatient,
                      )}
                    >
                      <ModalHeader>Adicionar paciente</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody pb={6}>
                        <Stack spacing={6}>
                          <FormControl variant={inputVariant} isRequired>
                            <Input
                              autoFocus
                              required
                              defaultValue={fullNameState}
                              placeholder=" "
                              textTransform={'uppercase'}
                              {...createPatientForm.register('fullName')}
                            />
                            <FormLabel>Nome completo</FormLabel>
                          </FormControl>
                          <FormControl variant={inputVariant} isRequired>
                            <Input
                              type="date"
                              required
                              {...createPatientForm.register('birthDate')}
                            />
                            <FormLabel>Data de nascimento</FormLabel>
                          </FormControl>
                          <FormControl variant={inputVariant}>
                            <Input
                              placeholder=" "
                              type="email"
                              {...createPatientForm.register('email')}
                            />
                            <FormLabel>Email</FormLabel>
                          </FormControl>
                          <FormControl variant={inputVariant}>
                            <Input
                              placeholder=" "
                              type="tel"
                              {...createPatientForm.register('phone')}
                            />
                            <FormLabel>Celular</FormLabel>
                          </FormControl>
                        </Stack>
                      </ModalBody>

                      <ModalFooter>
                        <HStack>
                          <Button
                            onClick={onClose}
                            leftIcon={<MdClose size="20px" />}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            colorScheme="blue"
                            leftIcon={<MdSave size="20px" />}
                          >
                            Salvar
                          </Button>
                        </HStack>
                      </ModalFooter>
                    </form>
                  </ModalContent>
                </Modal>
                <Button
                  type="submit"
                  leftIcon={<MdSearch size="20px" />}
                  colorScheme="blue"
                >
                  Buscar
                </Button>
              </HStack>
            </Stack>
          </form>
        </Box>
        <Stack>
          <TableContainer
            py={{ base: '2', sm: '8' }}
            px={[2, 4]}
            boxShadow={['base', 'md']}
            borderRadius={{ base: 'none', sm: 'xl' }}
            bgColor="rgb(255, 255, 255, 0.01)"
          >
            <Table>
              <Thead>
                <Tr>
                  <Th>Nome completo</Th>
                  <Th />
                  <Th>Idade</Th>
                  <Th>Data de nascimento</Th>
                  <Th>Última consulta</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.allPatients?.edges?.map(({ node }) => (
                  <Tr key={node.id}>
                    <Td colSpan={2}>
                      <Button
                        variant="link"
                        colorScheme={'blue'}
                        onClick={() => router.push(`/patient/${node.id}`)}
                      >
                        {node.fullName}
                      </Button>
                    </Td>
                    <Td>{node.age}</Td>
                    <Td>
                      {new Date(node.birthDate).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeZone: 'UTC',
                      })}
                    </Td>
                    <Td>
                      {node.latestEvaluation ? (
                        new Date(node.latestEvaluation).toLocaleString(
                          'pt-BR',
                          {
                            dateStyle: 'short',
                            timeStyle: 'short',
                            timeZone: 'UTC',
                          },
                        )
                      ) : (
                        <Text as="i">Nenhuma consulta</Text>
                      )}
                    </Td>
                  </Tr>
                ))}
                {!data?.allPatients?.edges?.length && (
                  <Tr>
                    <Td colSpan={5}>
                      <Text>
                        Nenhum paciente encontrado.{' '}
                        <Button
                          variant={'link'}
                          colorScheme="blue"
                          onClick={onOpen}
                        >
                          Adicionar paciente
                        </Button>
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
          <HStack justify={'center'}>
            <Button
              variant={'outline'}
              colorScheme={'gray'}
              leftIcon={<MdAdd size="20px" />}
              onClick={handleFetchMore}
              isDisabled={!data?.allPatients?.pageInfo?.hasNextPage}
            >
              Ver mais
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { ['healthcareToken']: token } = parseCookies(ctx);

  if (!token) {
    return {
      redirect: {
        destination: `/signin?after=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Patients;
