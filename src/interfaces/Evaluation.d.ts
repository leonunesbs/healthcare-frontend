export interface IEvaluation {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEvaluationExtServiceCollaborator extends IEvaluation {
  service: ExtendedService;
  collaborator: ICollaborator;
}
