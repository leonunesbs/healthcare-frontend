import { CustomMDEditorProps } from './CustomMDEditor';
import { PasswordFieldProps } from './PasswordField';
import dynamic from 'next/dynamic';

export const PasswordField = dynamic<PasswordFieldProps>(() =>
  import('./PasswordField').then((mod) => mod.default),
);
export const CustomMDEditor = dynamic<CustomMDEditorProps>(() =>
  import('./CustomMDEditor').then((mod) => mod.default),
);
