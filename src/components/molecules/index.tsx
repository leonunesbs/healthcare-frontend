import { EditPatientCollapseProps } from './EditPatientCollapse';
import { PatientIdCardProps } from './PatientIDCard';
import dynamic from 'next/dynamic';

export const CustomMDEditor = dynamic<PatientIdCardProps>(() =>
  import('./PatientIDCard').then((mod) => mod.default),
);

export const EditPatientCollapse = dynamic<EditPatientCollapseProps>(() =>
  import('./EditPatientCollapse').then((mod) => mod.default),
);
