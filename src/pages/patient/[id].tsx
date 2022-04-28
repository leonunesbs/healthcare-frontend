import { Box, Button, HStack, Heading, Stack } from '@chakra-ui/react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { MdClose, MdSave } from 'react-icons/md';

import { CustomMDEditor } from '@/components/atoms';
import { IEvaluation } from '@/interfaces/Evaluation';
import { IPatient } from '@/interfaces/Patient';
import { IService } from '@/interfaces/Service';
import { IUnit } from '@/interfaces/Unit';
import { Layout } from '@/components/templates';
import client from '@/services/apollo-client';
import { gql } from '@apollo/client';
import { useState } from 'react';

const PATIENT_QUERY = gql`
  query ($id: ID) {
    patient(id: $id) {
      id
      fullName
      birthDate
      evaluations {
        edges {
          node {
            id
            content
            createdAt
            updatedAt
            service {
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
}

interface ExtendedPatient extends IPatient {
  evaluations: {
    edges: {
      node: ExtendedEvaulation;
    }[];
  };
}

interface PatientProps {
  patient: ExtendedPatient;
}

const Patient = ({ patient }: PatientProps) => {
  const [value, setValue] = useState('');
  return (
    <Layout title={patient?.fullName}>
      <Box>{patient?.fullName}</Box>
      <Heading>Evoluções</Heading>
      {patient?.evaluations?.edges?.map(({ node }) => (
        <Button
          key={node.id}
          variant="link"
          onClick={() => setValue(node.content)}
        >
          {node.service.name} - {node.service.unit.name} - {node.createdAt}
        </Button>
      ))}

      {value && (
        <Stack>
          <CustomMDEditor value={value} setValue={setValue} />
          <HStack justify="flex-end">
            <Button
              colorScheme="gray"
              leftIcon={<MdClose size="25px" />}
              onClick={() => setValue('')}
            >
              Fechar
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<MdSave size="25px" />}
              onClick={() => setValue('')}
            >
              Salvar
            </Button>
          </HStack>
        </Stack>
      )}
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
    revalidate: 15,
  };
};

export default Patient;
