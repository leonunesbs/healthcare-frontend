import { CustomMDEditorProps } from './CustomMDEditor';
import dynamic from 'next/dynamic';

export const CustomMDEditor = dynamic<CustomMDEditorProps>(() =>
  import('./CustomMDEditor').then((mod) => mod.default),
);
