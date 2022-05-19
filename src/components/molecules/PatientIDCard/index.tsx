import {
  Badge,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';

import { EditPatientCollapse } from '@/components/molecules';
import { IPatientExtEvaluations } from '@/interfaces/Patient';

export interface PatientIdCardProps {
  patient: IPatientExtEvaluations;
  refetch: ({}: any) => any;
}

function PatientIdCard({ patient, refetch }: PatientIdCardProps) {
  const { colorMode } = useColorMode();
  if (!patient) {
    return <Skeleton h={['300px', '200px']} rounded="md" />;
  }

  return (
    <HStack
      px={4}
      py={6}
      boxShadow={colorMode == 'light' ? ['base', 'md'] : undefined}
      bgColor={colorMode == 'light' ? undefined : 'whiteAlpha.50'}
      rounded={['none', 'md']}
    >
      <Stack justify={'space-between'} w="full">
        <Stack>
          <Heading>
            {patient.fullName}
            <Badge fontSize={'xl'} ml={2} colorScheme="blue">
              {patient.age}
            </Badge>
          </Heading>
          <Text>
            Data de nascimento (idade):{' '}
            {new Date(patient.birthDate as string).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeZone: 'UTC',
            })}{' '}
            ({patient.age})
          </Text>
          <Text>CPF: {patient.cpf}</Text>
          <Text>Email: {patient.email}</Text>
          <Text>Celular: {patient.phone}</Text>
        </Stack>
        <EditPatientCollapse patient={patient} refetch={refetch} />
      </Stack>
    </HStack>
  );
}

export default PatientIdCard;
