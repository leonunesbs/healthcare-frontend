import { CustomLinkProps, CustomMDEditorProps } from './interfaces';

import dynamic from 'next/dynamic';

export const CustomLink = dynamic<CustomLinkProps>(() =>
  import('./CustomLink').then((mod) => mod.default),
);
export const CustomMDEditor = dynamic<CustomMDEditorProps>(() =>
  import('./CustomMDEditor').then((mod) => mod.default),
);
