import { Button, HStack } from '@chakra-ui/react';
import { gql, useQuery } from '@apollo/client';

import { IEvaluation } from '@/interfaces/Evaluation';
import { IPatient } from '@/interfaces/Patient';
import { Layout } from '@/components/templates';
import { useRouter } from 'next/router';

const PATIENTS_QUERY = gql`
  query {
    allPatients {
      edges {
        node {
          id
          fullName
          birthDate
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
    }
  }
`;

interface PatientNode extends IPatient {
  evaluations: {
    edges: {
      node: IEvaluation;
    }[];
  };
}

type PatientsQueryData = {
  allPatients: {
    edges: {
      node: PatientNode;
    }[];
  };
};

function Patients() {
  const router = useRouter();
  const { data } = useQuery<PatientsQueryData>(PATIENTS_QUERY);
  return (
    <Layout title="Pacientes">
      {data?.allPatients?.edges?.map(({ node }) => (
        <Button
          key={node.id}
          variant="link"
          colorScheme="blue"
          onClick={() => router.push(`/patient/${node.id}`)}
        >
          <HStack key={node.id}>
            <h1>Nome completo: {node.fullName}</h1>
            <p>Data de nascimento: {node.birthDate}</p>
          </HStack>
        </Button>
      ))}
    </Layout>
  );
}

export default Patients;
