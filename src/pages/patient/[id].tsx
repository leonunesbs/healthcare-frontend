import {
  Badge,
  Box,
  Button,
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
  useToast,
} from '@chakra-ui/react';
import { MdAdd, MdClose, MdEdit, MdPrint, MdSave } from 'react-icons/md';
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

interface PatientQueryData {
  patient: ExtendedPatient;
}

const Patient = () => {
  const router = useRouter();
  const { colorMode, setColorMode } = useColorMode();
  const [initalColorMode] = useState(colorMode);
  const { id } = router.query;
  const toast = useToast();
  const contentRef = useRef(null);

  const { data, loading, refetch } = useQuery<PatientQueryData>(PATIENT_QUERY);

  const patient = data?.patient;

  const [value, setValue] = useState('');
  const [evaluate, setEvaluate] = useState(false);
  const [evaluations, setEvaluations] = useState<any>();
  const [createEvaluation] = useMutation(CREATE_EVALUATION);

  useEffect(() => {
    refetch({
      id: id as string,
    });
    setEvaluations(patient?.evaluations.edges);
  }, [id, patient?.evaluations.edges, refetch]);

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

  return (
    <Layout title={(patient?.fullName as string) || 'Nome do paciente'}>
      <Stack>
        <Heading mt={12}>
          {patient?.fullName}
          <Badge fontSize={'xl'} ml={2} colorScheme="blue">
            {patient?.age}
          </Badge>
        </Heading>
        <Tabs
          isFitted
          variant="enclosed"
          boxShadow={['base', 'md']}
          borderRadius={{ base: 'none', sm: 'xl' }}
          bgColor="rgb(255, 255, 255, 0.01)"
          minH={'sm'}
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
                <Skeleton minH="150px" isLoaded={!loading}>
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
                          <Stack>
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

                            <Box py={6}>
                              <ReactMarkdown components={ChakraUIRenderer()}>
                                {node.content}
                              </ReactMarkdown>
                            </Box>
                            <HStack justify={'flex-end'}>
                              <Button
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
