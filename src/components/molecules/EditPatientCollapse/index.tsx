import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Collapse,
  CollapseProps,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { MdClose, MdDeleteForever, MdEdit, MdSave } from 'react-icons/md';
import { SubmitHandler, useForm } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';
import { useCallback, useContext, useRef, useState } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { IPatientExtEvaluations } from '@/interfaces/Patient';
import { useRouter } from 'next/router';

export interface EditPatientCollapseProps extends CollapseProps {
  patient: IPatientExtEvaluations;
  refetch: ({}: any) => any;
}

type EditPatientFormData = {
  fullName: string;
  birthDate: string;
  cpf?: string;
  email?: string;
  phone?: string;
};

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

const DELETE_PATIENT = gql`
  mutation DeletePatient($patientId: ID!) {
    deletePatient(patientId: $patientId) {
      deleted
    }
  }
`;

function EditPatientCollapse({ patient, refetch }: EditPatientCollapseProps) {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query;

  const { token } = useContext(AuthContext);
  const deletePatientDialogButton = useRef<HTMLButtonElement>(null);
  const deletePatientDisclosure = useDisclosure();

  const editPatientForm = useForm<EditPatientFormData>();

  const [editingPatient, setEditingPatient] = useState(false);

  const toggleEditPatient = useCallback(() => {
    setEditingPatient(!editingPatient);
  }, [editingPatient]);

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

  const handleEditPatient: SubmitHandler<EditPatientFormData> = useCallback(
    async ({ fullName, email, birthDate, phone, cpf }) => {
      if (
        JSON.stringify([fullName, email, birthDate, phone, cpf]) ==
        JSON.stringify([
          patient.fullName,
          patient.email,
          patient.birthDate,
          patient.phone,
          patient.cpf,
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
            setEditingPatient(false);
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
  return (
    <Box>
      <HStack justify={'flex-end'}>
        <Button
          aria-label="Editar paciente"
          onClick={toggleEditPatient}
          leftIcon={<MdEdit size="20px" />}
        >
          Editar paciente
        </Button>
      </HStack>
      <Collapse in={editingPatient} animateOpacity>
        <form onSubmit={editPatientForm.handleSubmit(handleEditPatient)}>
          <Stack w="full" spacing={6} py={2}>
            <Heading as="h3" size="lg">
              Editar paciente
            </Heading>

            <Stack w="full" spacing={4}>
              <FormControl variant="floating" isRequired>
                <Input
                  defaultValue={patient.fullName}
                  required
                  placeholder=" "
                  textTransform={'uppercase'}
                  {...editPatientForm.register('fullName')}
                />
                <FormLabel>Nome completo</FormLabel>
              </FormControl>
              <FormControl variant="floating" isRequired>
                <Input
                  defaultValue={patient.birthDate}
                  required
                  placeholder=" "
                  type="date"
                  {...editPatientForm.register('birthDate')}
                />
                <FormLabel>Data de nascimento</FormLabel>
              </FormControl>
              <FormControl variant="floating">
                <Input
                  defaultValue={patient.cpf}
                  placeholder=" "
                  {...editPatientForm.register('cpf')}
                />
                <FormLabel>CPF</FormLabel>
              </FormControl>
              <FormControl variant="floating">
                <Input
                  defaultValue={patient.email}
                  placeholder=" "
                  textTransform={'lowercase'}
                  type="email"
                  {...editPatientForm.register('email')}
                />
                <FormLabel>Email</FormLabel>
              </FormControl>
              <FormControl variant="floating">
                <Input
                  defaultValue={patient.phone}
                  placeholder=" "
                  type="tel"
                  {...editPatientForm.register('phone')}
                />
                <FormLabel>Celular</FormLabel>
              </FormControl>
            </Stack>
            <Stack justify={'flex-end'} direction={['column-reverse', 'row']}>
              <Button
                autoFocus
                leftIcon={<MdClose size="20px" />}
                onClick={() => {
                  editPatientForm.reset();
                  setEditingPatient(false);
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
                  Remover paciente
                </Button>
                <AlertDialog
                  isOpen={deletePatientDisclosure.isOpen}
                  leastDestructiveRef={deletePatientDialogButton}
                  onClose={deletePatientDisclosure.onClose}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent bgColor={'gray.900'}>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Remover paciente
                      </AlertDialogHeader>

                      <AlertDialogBody>
                        <Stack spacing={4}>
                          <Stack spacing={0}>
                            <Text>
                              Você tem certeza? Esta ação não poderá ser
                              desfeita.
                            </Text>
                          </Stack>
                          <Text as="i" textColor={'whiteAlpha.700'}>
                            Os dados do paciente e todo o seu histórico serão
                            removidos permanentemente.
                          </Text>
                        </Stack>
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <HStack>
                          <Button
                            ref={deletePatientDialogButton}
                            onClick={deletePatientDisclosure.onClose}
                            leftIcon={<MdClose size="20px" />}
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
                            Remover paciente
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
                Salvar informações
              </Button>
            </Stack>
          </Stack>
        </form>
      </Collapse>
    </Box>
  );
}

export default EditPatientCollapse;
