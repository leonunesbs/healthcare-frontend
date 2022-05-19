export interface IService {
  name: string;
}

export interface IServiceExtUnit extends IService {
  unit: IUnit;
}
