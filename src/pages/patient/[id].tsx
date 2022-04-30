import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
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
  useToast,
} from '@chakra-ui/react';
import { MdAdd, MdClose, MdEdit, MdPrint, MdSave } from 'react-icons/md';
import { SubmitHandler, useForm } from 'react-hook-form';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';

import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { CustomMDEditor } from '@/components/atoms';
import { IColaborator } from '@/interfaces/Colaborator';
import { IEvaluation } from '@/interfaces/Evaluation';
import { IPatient } from '@/interfaces/Patient';
import { IService } from '@/interfaces/Service';
import { IUnit } from '@/interfaces/Unit';
import { Layout } from '@/components/templates';
import ReactMarkdown from 'react-markdown';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from 'next/router';

const PATIENT_QUERY = gql`
  query ($id: ID) {
    patient(id: $id) {
      id
      fullName
      age
      birthDate
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

const UPDATE_PATIENT = gql`
  mutation UpdatePatient(
    $patientId: ID!
    $fullName: String
    $birthDate: DateTime
    $email: String
    $phone: String
  ) {
    updatePatient(
      patientId: $patientId
      fullName: $fullName
      birthDate: $birthDate
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

const Patient = () => {
  const router = useRouter();
  const { colorMode, setColorMode } = useColorMode();
  const [initalColorMode] = useState(colorMode);
  const [editName, setEditName] = useState(false);
  const { id } = router.query;
  const toast = useToast();
  const contentRef = useRef(null);

  const { data, loading, refetch } = useQuery<PatientQueryData>(PATIENT_QUERY);

  const patient = data?.patient;

  const [value, setValue] = useState('');
  const [evaluate, setEvaluate] = useState(false);
  const [evaluations, setEvaluations] = useState<any>();
  const [createEvaluation] = useMutation(CREATE_EVALUATION);
  const [updatePatient] = useMutation(UPDATE_PATIENT);

  const editNameForm = useForm<{ fullName: string }>();

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
              position: 'top-right',
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
              position: 'top-right',
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
            position: 'top-right',
          }),
        );
    } else {
      toast({
        title: 'Evolução vazia',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [createEvaluation, evaluations, patient, toast, value]);

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    copyStyles: true,
    onBeforeGetContent: () => setColorMode('light'),
    onAfterPrint: () => setColorMode(initalColorMode),
  });

  const toggleEditName = useCallback(() => {
    setEditName(!editName);
  }, [editName]);

  const handleEditName: SubmitHandler<{ fullName: string }> = useCallback(
    async ({ fullName }) => {
      await updatePatient({
        variables: {
          patientId: id,
          fullName: fullName,
        },
      })
        .then(({ data }) => {
          if (data.updatePatient.updated) {
            toast({
              title: 'Dados atualizados com sucesso',
              status: 'success',
              duration: 9000,
              isClosable: true,
              position: 'top-right',
            });
            setEditName(false);
            refetch({
              id: id as string,
            });
          }
        })
        .catch((err) => {
          toast({
            title: 'Erro',
            description: err.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'top-right',
          });
          setEditName(false);
          editNameForm.reset();
        });
    },
    [editNameForm, id, refetch, toast, updatePatient],
  );

  return (
    <Layout title={(patient?.fullName as string) || 'Nome do paciente'}>
      <Stack spacing={6}>
        <form onSubmit={editNameForm.handleSubmit(handleEditName)}>
          <HStack mt={12}>
            {editName ? (
              <Stack w="full" direction={['column', 'column', 'row']}>
                <FormControl variant={inputVariant} isRequired>
                  <Input
                    defaultValue={patient?.fullName}
                    required
                    placeholder=" "
                    textTransform={'uppercase'}
                    {...editNameForm.register('fullName')}
                  />
                  <FormLabel>Editar nome</FormLabel>
                </FormControl>
                <HStack w={['full', 'full', 'initial']} justify="flex-end">
                  <Button
                    leftIcon={<MdClose size="20px" />}
                    onClick={() => {
                      editNameForm.reset();
                      setEditName(false);
                    }}
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
              </Stack>
            ) : (
              <HStack justify={'space-between'} w="full">
                <Heading>
                  {patient?.fullName}
                  <Badge fontSize={'xl'} ml={2} colorScheme="blue">
                    {patient?.age}
                  </Badge>
                </Heading>
                <IconButton
                  aria-label="Editar nome"
                  onClick={toggleEditName}
                  icon={<MdEdit size="20px" />}
                />
              </HStack>
            )}
          </HStack>
        </form>
        <Tabs
          isFitted
          variant="enclosed"
          boxShadow={['base', 'md']}
          borderRadius={{ base: 'none', sm: 'xl' }}
          bgColor="rgb(255, 255, 255, 0.01)"
        >
          <TabList mb="1em">
            <Tab
              _selected={{
                color: 'white',
                bg: 'blue.500',
              }}
            >
              Evolução
            </Tab>
            <Tab
              _selected={{
                color: 'white',
                bg: 'blue.500',
              }}
            >
              Prescrição
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Stack spacing={4}>
                {evaluate ? (
                  <Stack>
                    <CustomMDEditor value={value} setValue={setValue} />
                    <HStack justify="flex-end">
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
                    </HStack>
                  </Stack>
                ) : (
                  <Stack spacing={4}>
                    <HStack justify="center">
                      <Button
                        colorScheme="blue"
                        leftIcon={<MdAdd size="25px" />}
                        onClick={() => setEvaluate(true)}
                      >
                        Nova evolução
                      </Button>
                    </HStack>
                  </Stack>
                )}
                <Skeleton isLoaded={!loading}>
                  <Stack spacing={[4, 6]}>
                    {evaluations?.map(
                      ({ node }: { node: ExtendedEvaulation }) => (
                        <Box
                          ref={contentRef}
                          key={node.id}
                          py={{ base: '2', sm: '8' }}
                          px={{ base: '2', sm: '10' }}
                          boxShadow={['base', 'md']}
                          borderRadius={{ base: 'none', sm: 'xl' }}
                          bgColor="rgb(255, 255, 255, 0.01)"
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
                              <Button
                                colorScheme="yellow"
                                leftIcon={<MdEdit size="20px" />}
                              >
                                Editar
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

export default Patient;
