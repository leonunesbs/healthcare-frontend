import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Collapse,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdClose,
  MdDeleteForever,
  MdEdit,
  MdPrint,
  MdSave,
} from 'react-icons/md';
import { SubmitHandler, useForm } from 'react-hook-form';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AuthContext } from '@/context/AuthContext';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { CustomMDEditor } from '@/components/atoms';
import { GetServerSideProps } from 'next';
import { IColaborator } from '@/interfaces/Colaborator';
import { IEvaluation } from '@/interfaces/Evaluation';
import { IPatient } from '@/interfaces/Patient';
import { IService } from '@/interfaces/Service';
import { IUnit } from '@/interfaces/Unit';
import { Layout } from '@/components/templates';
import ReactMarkdown from 'react-markdown';
import { parseCookies } from 'nookies/dist';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from 'next/router';

const PATIENT_QUERY = gql`
  query ($id: ID) {
    patient(id: $id) {
      id
      fullName
      age
      birthDate
      email
      phone
      cpf
      evaluations {
        edges {
          node {
            id
            content
            createdAt
            updatedAt
            colaborator {
              id
              fullName
              role
            }
            service {
              id
              name
              unit {
                name
              }
            }
          }
        }
      }
    }
  }
`;

interface ExtendedService extends IService {
  unit: IUnit;
}

interface ExtendedEvaulation extends IEvaluation {
  service: ExtendedService;
  colaborator: IColaborator;
}

interface ExtendedPatient extends IPatient {
  evaluations: {
    edges: {
      node: ExtendedEvaulation;
    }[];
  };
}

const CREATE_EVALUATION = gql`
  mutation Evaluation($serviceId: ID!, $patientId: ID!, $content: String!) {
    createEvaluation(
      serviceId: $serviceId
      patientId: $patientId
      content: $content
    ) {
      created
      evaluation {
        id
        content
        createdAt
        updatedAt
        colaborator {
          id
          fullName
          role
        }
        service {
          id
          name
          unit {
            name
          }
        }
      }
    }
  }
`;

const DELETE_PATIENT = gql`
  mutation DeletePatient($patientId: ID!) {
    deletePatient(patientId: $patientId) {
      deleted
    }
  }
`;

const UPDATE_PATIENT = gql`
  mutation UpdatePatient(
    $patientId: ID!
    $fullName: String
    $birthDate: DateTime
    $email: String
    $cpf: String
    $phone: String
  ) {
    updatePatient(
      patientId: $patientId
      fullName: $fullName
      birthDate: $birthDate
      cpf: $cpf
      email: $email
      phone: $phone
    ) {
      updated
    }
  }
`;

interface PatientQueryData {
  patient: ExtendedPatient;
}

type EditPatientFormData = {
  fullName: string;
  birthDate: string;
  cpf?: string;
  email?: string;
  phone?: string;
};

const Patient = () => {
  const router = useRouter();
  const { token, isAuthenticated } = useContext(AuthContext);
  const { colorMode, setColorMode } = useColorMode();
  const evaluationCardBgColor = useColorModeValue('gray.50', 'gray.800');
  const [initalColorMode] = useState(colorMode);
  const [editPatient, setEditPatient] = useState(false);
  const { id } = router.query;
  const toast = useToast();
  const contentRef = useRef(null);
  const deletePatientDialogButton = useRef<HTMLButtonElement>(null);

  const deletePatientDisclosure = useDisclosure();

  const { data, loading, refetch } = useQuery<PatientQueryData>(PATIENT_QUERY, {
    context: {
      headers: {
        authorization: `JWT ${token}`,
      },
    },
    variables: {
      id,
    },
  });

  const patient = data?.patient;

  const [value, setValue] = useState('');
  const [evaluate, setEvaluate] = useState(false);
  const [evaluations, setEvaluations] = useState<any>();
  const [createEvaluation] = useMutation(CREATE_EVALUATION, {
    context: {
      headers: {
        authorization: `JWT ${token}`,
      },
    },
  });

  const [deletePatient, deletePatientProps] = useMutation(DELETE_PATIENT, {
    context: {
      headers: {
        authorization: `JWT ${token}`,
      },
    },
  });
  const [updatePatient, updatePatientProps] = useMutation(UPDATE_PATIENT, {
    context: {
      headers: {
        authorization: `JWT ${token}`,
      },
    },
  });
  const editPatientForm = useForm<EditPatientFormData>();

  const inputVariant = useColorModeValue('floating-light', 'floating-dark');

  useEffect(() => {
    refetch({
      id: id as string,
    });
    setEvaluations(patient?.evaluations.edges);
  }, [id, patient, refetch]);

  const handleSaveEvaluation = useCallback(async () => {
    if (value) {
      await createEvaluation({
        variables: {
          serviceId: 'U2VydmljZU5vZGU6MQ==',
          patientId: patient?.id,
          content: value,
        },
      })
        .then(({ data }) => {
          if (data.createEvaluation.created) {
            toast({
              title: 'Evolução criada com sucesso',
              status: 'success',
              duration: 9000,
              isClosable: true,
              position: 'bottom',
            });
            setEvaluations([
              ...evaluations,
              {
                node: data.createEvaluation.evaluation,
              },
            ]);
            setValue('');
            setEvaluate(false);
          } else {
            toast({
              title: 'Evolução idêntica já existente',
              status: 'info',
              duration: 9000,
              isClosable: true,
              position: 'bottom',
            });
          }
        })
        .catch((err) =>
          toast({
            title: 'Erro',
            description: err.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
          }),
        );
    } else {
      toast({
        title: 'Evolução vazia',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'bottom',
      });
    }
  }, [createEvaluation, evaluations, patient, toast, value]);

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    copyStyles: true,
    onBeforeGetContent: () => setColorMode('light'),
    onAfterPrint: () => setColorMode(initalColorMode),
  });

  const toggleEditPatient = useCallback(() => {
    setEditPatient(!editPatient);
  }, [editPatient]);

  const handleEditPatient: SubmitHandler<EditPatientFormData> = useCallback(
    async ({ fullName, email, birthDate, phone, cpf }) => {
      if (
        JSON.stringify([fullName, email, birthDate, phone, cpf]) ==
        JSON.stringify([
          patient?.fullName,
          patient?.email,
          patient?.birthDate,
          patient?.phone,
          patient?.cpf,
        ])
      ) {
        toast({
          title: 'Nenhum dado alterado',
          status: 'warning',
          duration: 9000,
          isClosable: true,
          position: 'bottom',
        });
        return;
      }
      await updatePatient({
        variables: {
          patientId: id,
          fullName: fullName
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''),
          email,
          phone,
          cpf,
          birthDate: new Date(
            new Date(birthDate).toLocaleString('en-US', { timeZone: 'UTC' }),
          ),
        },
      })
        .then(({ data }) => {
          if (data.updatePatient.updated) {
            toast({
              title: 'Dados atualizados com sucesso',
              status: 'success',
              duration: 9000,
              isClosable: true,
              position: 'bottom',
            });
            setEditPatient(false);
            refetch({
              id: id as string,
            });
            editPatientForm.reset();
          }
        })
        .catch((err) => {
          toast({
            title: 'Erro',
            description: err.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
          });
        });
    },
    [editPatientForm, id, patient, refetch, toast, updatePatient],
  );

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
    <Layout title={(patient?.fullName as string) || 'Nome do paciente'}>
      <Stack spacing={6}>
        <form onSubmit={editPatientForm.handleSubmit(handleEditPatient)}>
          <HStack
            px={4}
            py={6}
            boxShadow={['base', 'md']}
            borderRadius={{ base: 'none', sm: 'xl' }}
            bgColor="rgb(255, 255, 255, 0.01)"
          >
            <Stack justify={'space-between'} w="full">
              <Stack>
                <Heading>
                  {patient?.fullName}
                  <Badge fontSize={'xl'} ml={2} colorScheme="blue">
                    {patient?.age}
                  </Badge>
                </Heading>
                <Text>
                  Data de nascimento (idade):{' '}
                  {new Date(patient?.birthDate as string).toLocaleString(
                    'pt-BR',
                    {
                      dateStyle: 'short',
                      timeZone: 'UTC',
                    },
                  )}{' '}
                  ({patient?.age})
                </Text>
                <Text>CPF: {patient?.cpf}</Text>
                <Text>Email: {patient?.email}</Text>
                <Text>Celular: {patient?.phone}</Text>
              </Stack>
              <HStack justify={'flex-end'}>
                <Button
                  aria-label="Editar paciente"
                  onClick={toggleEditPatient}
                  leftIcon={<MdEdit size="20px" />}
                >
                  Editar paciente
                </Button>
              </HStack>
              <Collapse in={editPatient} animateOpacity>
                <Stack w="full" spacing={6} py={2}>
                  <Heading as="h3" size="lg">
                    Editar paciente
                  </Heading>
                  <Stack w="full" spacing={4}>
                    <FormControl variant={inputVariant} isRequired>
                      <Input
                        defaultValue={patient?.fullName}
                        required
                        placeholder=" "
                        textTransform={'uppercase'}
                        {...editPatientForm.register('fullName')}
                      />
                      <FormLabel>Nome</FormLabel>
                    </FormControl>
                    <FormControl variant={inputVariant} isRequired>
                      <Input
                        defaultValue={patient?.birthDate}
                        required
                        placeholder=" "
                        type="date"
                        {...editPatientForm.register('birthDate')}
                      />
                      <FormLabel>Data de nascimento</FormLabel>
                    </FormControl>
                    <FormControl variant={inputVariant}>
                      <Input
                        defaultValue={patient?.cpf}
                        placeholder=" "
                        {...editPatientForm.register('cpf')}
                      />
                      <FormLabel>CPF</FormLabel>
                    </FormControl>
                    <FormControl variant={inputVariant}>
                      <Input
                        defaultValue={patient?.email}
                        placeholder=" "
                        textTransform={'lowercase'}
                        type="email"
                        {...editPatientForm.register('email')}
                      />
                      <FormLabel>Email</FormLabel>
                    </FormControl>
                    <FormControl variant={inputVariant}>
                      <Input
                        defaultValue={patient?.phone}
                        placeholder=" "
                        type="tel"
                        {...editPatientForm.register('phone')}
                      />
                      <FormLabel>Celular</FormLabel>
                    </FormControl>
                  </Stack>
                  <HStack justify={'flex-end'}>
                    <Button
                      autoFocus
                      leftIcon={<MdClose size="20px" />}
                      onClick={() => {
                        editPatientForm.reset();
                        setEditPatient(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Stack>
                      <Button
                        colorScheme="red"
                        leftIcon={<MdDeleteForever size="20px" />}
                        onClick={deletePatientDisclosure.onOpen}
                        isLoading={deletePatientProps.loading}
                      >
                        Remover
                      </Button>
                      <AlertDialog
                        isOpen={deletePatientDisclosure.isOpen}
                        leastDestructiveRef={deletePatientDialogButton}
                        onClose={deletePatientDisclosure.onClose}
                      >
                        <AlertDialogOverlay>
                          <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                              Deletar paciente
                            </AlertDialogHeader>

                            <AlertDialogBody>
                              <Stack>
                                <Text>Você tem certeza?</Text>
                                <Text>
                                  Os dados do paciente e todo o seu histórico
                                  serão removidos permanentemente.
                                </Text>
                                <Text>Esta ação não poderá ser desfeita.</Text>
                              </Stack>
                            </AlertDialogBody>

                            <AlertDialogFooter>
                              <HStack>
                                <Button
                                  ref={deletePatientDialogButton}
                                  onClick={deletePatientDisclosure.onClose}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  colorScheme="red"
                                  leftIcon={<MdDeleteForever size="20px" />}
                                  onClick={() => {
                                    deletePatient({
                                      variables: {
                                        patientId: id,
                                      },
                                    });
                                    router.push('/patients');
                                  }}
                                  isLoading={deletePatientProps.loading}
                                >
                                  Remover
                                </Button>
                              </HStack>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialogOverlay>
                      </AlertDialog>
                    </Stack>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      leftIcon={<MdSave size="20px" />}
                      isLoading={updatePatientProps.loading}
                    >
                      Salvar
                    </Button>
                  </HStack>
                </Stack>
              </Collapse>
            </Stack>
          </HStack>
        </form>
        <Tabs
          isFitted
          variant="enclosed"
          boxShadow={['base', 'md']}
          borderRadius={{ base: 'none', sm: 'xl' }}
          bgColor="rgb(255, 255, 255, 0.01)"
        >
          <TabList mb="1em" overflowX={'auto'} overflowY="hidden">
            <Tab
              _selected={{
                color: 'white',
                bg: useColorModeValue('blue.500', 'blue.200'),
                textColor: useColorModeValue('white', 'blue.800'),
              }}
            >
              Atendimento
            </Tab>
            <Tab
              _selected={{
                color: 'white',
                bg: useColorModeValue('blue.500', 'blue.200'),
                textColor: useColorModeValue('white', 'blue.800'),
              }}
            >
              Evolução
            </Tab>
            <Tab
              _selected={{
                color: 'white',
                bg: useColorModeValue('blue.500', 'blue.200'),
                textColor: useColorModeValue('white', 'blue.800'),
              }}
            >
              Prescrição
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>Atendimento</TabPanel>
            <TabPanel>
              <Stack spacing={4}>
                <Collapse in={evaluate} animateOpacity>
                  <Stack p={1}>
                    <FormControl>
                      <FormLabel>
                        <Heading as="h3" size="lg">
                          Evolução
                        </Heading>
                      </FormLabel>
                      <CustomMDEditor value={value} setValue={setValue} />
                    </FormControl>
                  </Stack>
                </Collapse>
                <Stack spacing={4}>
                  <HStack justify="flex-end">
                    {!evaluate ? (
                      <Button
                        colorScheme="blue"
                        leftIcon={<MdAdd size="25px" />}
                        onClick={() => setEvaluate(true)}
                      >
                        Nova evolução
                      </Button>
                    ) : (
                      <>
                        <Button
                          colorScheme="gray"
                          leftIcon={<MdClose size="25px" />}
                          onClick={() => setEvaluate(false)}
                        >
                          Fechar
                        </Button>
                        <Button
                          colorScheme="blue"
                          leftIcon={<MdSave size="25px" />}
                          onClick={handleSaveEvaluation}
                        >
                          Salvar
                        </Button>
                      </>
                    )}
                  </HStack>
                </Stack>
                <Skeleton isLoaded={!loading}>
                  <Stack spacing={[4, 6]}>
                    {evaluations?.map(
                      ({ node }: { node: ExtendedEvaulation }) => (
                        <Box
                          ref={contentRef}
                          key={node.id}
                          bgColor={evaluationCardBgColor}
                          rounded="md"
                          boxShadow={'base'}
                          p={4}
                        >
                          <Stack spacing={4}>
                            <Heading as="h3" fontSize={'lg'}>
                              {node.service.name}
                            </Heading>
                            <Text fontSize={'lg'}>
                              <Badge colorScheme={'blue'} mr={2}>
                                {node.colaborator.role}
                              </Badge>
                              {node.colaborator.fullName}
                            </Text>
                            <Stack spacing={0} fontSize="sm">
                              <Text as="i">
                                Data da consulta:{' '}
                                {new Date(node.createdAt).toLocaleString(
                                  'pt-BR',
                                  {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                    timeZone: 'UTC',
                                  },
                                )}
                              </Text>
                              <Text as="i">
                                Ultima atualização:{' '}
                                {new Date(node.updatedAt).toLocaleString(
                                  'pt-BR',
                                  {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                    timeZone: 'UTC',
                                  },
                                )}
                              </Text>
                            </Stack>

                            <Box
                              p={4}
                              boxShadow={['sm', 'base']}
                              borderRadius={{ base: 'none', sm: 'xl' }}
                            >
                              <ReactMarkdown components={ChakraUIRenderer()}>
                                {node.content}
                              </ReactMarkdown>
                            </Box>
                            <HStack justify={'flex-end'}>
                              <Button
                                display={['none', 'inline']}
                                colorScheme="gray"
                                leftIcon={<MdPrint size="20px" />}
                                onClick={handlePrint}
                              >
                                Imprimir
                              </Button>
                            </HStack>
                          </Stack>
                        </Box>
                      ),
                    )}
                  </Stack>
                </Skeleton>
              </Stack>
            </TabPanel>
            <TabPanel>
              <p>two!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Layout>
  );
};

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

export default Patient;
