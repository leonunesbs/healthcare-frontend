import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { MdAdd, MdSearch } from 'react-icons/md';
import { SubmitHandler, useForm } from 'react-hook-form';
import { gql, useQuery } from '@apollo/client';
import { useCallback, useEffect } from 'react';

import { IEvaluation } from '@/interfaces/Evaluation';
import { IPatient } from '@/interfaces/Patient';
import { Layout } from '@/components/templates';
import { useRouter } from 'next/router';

const PATIENTS_QUERY = gql`
  query allPatients($fullName: String) {
    allPatients(fullName_Icontains: $fullName) {
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
  };
};

type Inputs = {
  fullName: string;
};

function Patients() {
  const router = useRouter();
  const { fullName } = router.query;
  const { data, loading, refetch } =
    useQuery<PatientsQueryData>(PATIENTS_QUERY);

  const { register, handleSubmit, setValue } = useForm<Inputs>();
  console.log(data);
  const searchSubmit: SubmitHandler<Inputs> = useCallback(
    ({ fullName }) => {
      router.replace({
        pathname: '/patients',
        query: { fullName },
      });
      refetch({
        fullName: fullName,
      });
    },
    [refetch, router],
  );

  useEffect(() => {
    if (fullName) {
      setValue('fullName', fullName as string);
      refetch({
        fullName: fullName,
      });
    }
  }, [fullName, refetch, setValue]);

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
              <FormControl>
                <FormLabel>Buscar paciente</FormLabel>
                <Input
                  pr="4.5rem"
                  type="text"
                  placeholder="Nome do paciente"
                  {...register('fullName')}
                />
              </FormControl>
              <HStack justify={'flex-end'}>
                <Button leftIcon={<MdAdd size="20px" />}>Novo Paciente</Button>
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
        <Skeleton isLoaded={!loading} minH="50px">
          <TableContainer
            py={{ base: '2', sm: '8' }}
            px={{ base: '2', sm: '10' }}
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
              </Tbody>
            </Table>
          </TableContainer>
        </Skeleton>
      </Stack>
    </Layout>
  );
}

export default Patients;
