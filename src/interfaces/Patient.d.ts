import { IEvaluationExtServiceCollaborator } from './Evaluation';

export interface IPatient {
  id: string;
  fullName: string;
  birthDate: string;
  cpf: string;
  age: string;
  email: string;
  phone: string;
}

export interface IPatientExtEvaluations extends IPatient {
  evaluations: {
    edges: {
      node: IEvaluationExtServiceCollaborator;
    }[];
  };
}
