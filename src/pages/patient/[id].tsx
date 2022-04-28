import {
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { MdAdd, MdClose, MdEdit, MdSave } from 'react-icons/md';
import { gql, useMutation } from '@apollo/client';
import { useCallback, useState } from 'react';

import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { CustomMDEditor } from '@/components/atoms';
import { IColaborator } from '@/interfaces/Colaborator';
import { IEvaluation } from '@/interfaces/Evaluation';
import { IPatient } from '@/interfaces/Patient';
import { IService } from '@/interfaces/Service';
import { IUnit } from '@/interfaces/Unit';
import { Layout } from '@/components/templates';
import ReactMarkdown from 'react-markdown';
import client from '@/services/apollo-client';

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

interface PatientProps {
  patient: ExtendedPatient;
}

const Patient = ({ patient }: PatientProps) => {
  const toast = useToast();
  const [value, setValue] = useState('');
  const [evaluate, setEvaluate] = useState(false);
  const [evaluations, setEvaluations] = useState(patient.evaluations.edges);
  const [createEvaluation] = useMutation(CREATE_EVALUATION);

  const handleSaveEvaluation = useCallback(async () => {
    if (value) {
      await createEvaluation({
        variables: {
          serviceId: 'U2VydmljZU5vZGU6MQ==',
          patientId: patient.id,
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
  return (
    <Layout title={patient?.fullName}>
      <Stack>
        <Heading mt={12}>
          {patient?.fullName}
          <Badge fontSize={'xl'} ml={2} colorScheme="blue">
            {patient?.age} anos
          </Badge>
        </Heading>
        <Tabs
          isFitted
          variant="enclosed"
          bgColor="white"
          p={4}
          rounded="md"
          shadow="md"
        >
          <TabList mb="1em">
            <Tab>Evolução</Tab>
            <Tab>Prescrição</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
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
                <Stack spacing={[2, 4]}>
                  {evaluations?.map(({ node }) => (
                    <Box
                      key={node.id}
                      boxShadow="base"
                      rounded="md"
                      px={[4, 6]}
                      py={[6, 8]}
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
                            {new Date(node.createdAt).toLocaleString()}
                          </Text>
                          <Text as="i">
                            Ultima atualização:{' '}
                            {new Date(node.createdAt).toLocaleString()}
                          </Text>
                        </Stack>

                        <Box py={6}>
                          <ReactMarkdown
                            components={ChakraUIRenderer()}
                            skipHtml
                          >
                            {node.content}
                          </ReactMarkdown>
                        </Box>
                        <HStack justify={'flex-end'}>
                          <Button
                            colorScheme="gray"
                            leftIcon={<MdEdit size="25px" />}
                            size="sm"
                          >
                            Editar
                          </Button>
                        </HStack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
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

interface PatientsData {
  allPatients: {
    edges: {
      node: IPatient;
    }[];
  };
}
export const getStaticPaths: GetStaticPaths = async () => {
  const { data }: { data: PatientsData } = await client.query({
    query: gql`
      query {
        allPatients {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
  });

  const paths = data.allPatients.edges.map(({ node }) => ({
    params: { id: node.id },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string };

  if (!id) {
    return {
      props: {
        patient: null,
      },
      redirect: {
        destination: '/',
      },
    };
  }

  const { data } = await client.query({
    query: PATIENT_QUERY,
    variables: { id: id as string },
  });

  if (data.patient == null) {
    return {
      props: {
        patient: null,
      },
      redirect: {
        destination: '/',
      },
    };
  }

  return {
    props: {
      patient: data.patient,
    },
    revalidate: 1,
  };
};

export default Patient;
