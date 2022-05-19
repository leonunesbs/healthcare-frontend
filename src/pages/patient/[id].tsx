import {
  Badge,
  Box,
  Button,
  Collapse,
  FormControl,
  FormLabel,
  HStack,
  Heading,
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
import { MdAdd, MdClose, MdPrint, MdSave } from 'react-icons/md';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AuthContext } from '@/context/AuthContext';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { CustomMDEditor } from '@/components/atoms';
import { GetServerSideProps } from 'next';
import { IEvaluationExtServiceCollaborator } from './../../interfaces/Evaluation.d';
import { IPatientExtEvaluations } from './../../interfaces/Patient.d';
import { Layout } from '@/components/templates';
import PatientIdCard from '@/components/molecules/PatientIDCard';
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
            collaborator {
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
        collaborator {
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

interface PatientQueryData {
  patient: IPatientExtEvaluations;
}

const Patient = () => {
  const router = useRouter();
  const { id, tabIndex } = router.query;
  const { token, isAuthenticated } = useContext(AuthContext);
  const { colorMode, setColorMode } = useColorMode();
  const [initalColorMode] = useState(colorMode);
  const toast = useToast();
  const contentRef = useRef(null);

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
  const [prescribe, setPrescribe] = useState(false);
  const [evaluations, setEvaluations] = useState<any>();
  const [createEvaluation] = useMutation(CREATE_EVALUATION, {
    context: {
      headers: {
        authorization: `JWT ${token}`,
      },
    },
  });

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
          serviceId: localStorage.getItem('healthcare:serviceId'),
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
        <PatientIdCard
          patient={patient as IPatientExtEvaluations}
          refetch={refetch}
        />
        <Tabs
          isFitted
          variant="enclosed"
          boxShadow={colorMode == 'light' ? ['base', 'md'] : undefined}
          bgColor={colorMode == 'light' ? undefined : 'whiteAlpha.50'}
          rounded={['none', 'md']}
          defaultIndex={parseInt(tabIndex as string) || 1}
          onChange={(index) =>
            router.push(`/patient/${id}?tabIndex=${index}`, undefined, {
              scroll: false,
            })
          }
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
            <Tab
              _selected={{
                color: 'white',
                bg: useColorModeValue('blue.500', 'blue.200'),
                textColor: useColorModeValue('white', 'blue.800'),
              }}
            >
              Exames
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
                          Salvar evolução
                        </Button>
                      </>
                    )}
                  </HStack>
                </Stack>
                <Skeleton isLoaded={!loading}>
                  <Stack spacing={[4, 6]}>
                    {evaluations?.map(
                      ({
                        node,
                      }: {
                        node: IEvaluationExtServiceCollaborator;
                      }) => (
                        <Box
                          key={node.id}
                          ref={contentRef}
                          rounded={['none', 'md']}
                        >
                          <Stack spacing={4}>
                            <Heading as="h3" fontSize={'lg'}>
                              {node.service.name}
                            </Heading>
                            <Text fontSize={'lg'}>
                              <Badge colorScheme={'blue'} mr={2}>
                                {node.collaborator.role}
                              </Badge>
                              {node.collaborator.fullName}
                            </Text>
                            <Stack
                              spacing={0}
                              textColor={
                                colorMode === 'light'
                                  ? undefined
                                  : 'whiteAlpha.700'
                              }
                            >
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
                              bgColor="whiteAlpha.50"
                              rounded={['none', 'md']}
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
                          <Box
                            w="full"
                            h={0.5}
                            bgColor={
                              colorMode === 'light'
                                ? 'blackAlpha.50'
                                : 'whiteAlpha.50'
                            }
                            rounded={['none', 'md']}
                            my={4}
                          />
                        </Box>
                      ),
                    )}
                  </Stack>
                </Skeleton>
              </Stack>
            </TabPanel>
            <TabPanel>
              <Stack spacing={4}>
                <Collapse in={prescribe} animateOpacity>
                  <Stack p={1}>
                    <Heading as="h3" size="lg">
                      Prescrição
                    </Heading>
                  </Stack>
                </Collapse>
                <Stack spacing={4}>
                  <HStack justify="flex-end">
                    {!prescribe ? (
                      <Button
                        colorScheme="blue"
                        leftIcon={<MdAdd size="25px" />}
                        onClick={() => setPrescribe(true)}
                      >
                        Nova prescrição
                      </Button>
                    ) : (
                      <>
                        <Button
                          colorScheme="gray"
                          leftIcon={<MdClose size="25px" />}
                          onClick={() => setPrescribe(false)}
                        >
                          Fechar
                        </Button>
                        <Button
                          colorScheme="blue"
                          leftIcon={<MdSave size="25px" />}
                        >
                          Salvar prescrição
                        </Button>
                      </>
                    )}
                  </HStack>
                </Stack>
                <Skeleton isLoaded={!loading}>
                  <Stack spacing={[4, 6]}>
                    {evaluations?.map(
                      ({
                        node,
                      }: {
                        node: IEvaluationExtServiceCollaborator;
                      }) => (
                        <Box
                          ref={contentRef}
                          key={node.id}
                          rounded={['none', 'md']}
                        >
                          <Stack spacing={4}>
                            <Heading as="h3" fontSize={'lg'}>
                              {node.service.name}
                            </Heading>
                            <Text fontSize={'lg'}>
                              <Badge colorScheme={'blue'} mr={2}>
                                {node.collaborator.role}
                              </Badge>
                              {node.collaborator.fullName}
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
                              bgColor="whiteAlpha.50"
                              rounded={['none', 'md']}
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
              <p>Exames</p>
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
