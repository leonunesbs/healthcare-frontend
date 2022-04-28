import { LayoutProps } from './Layout';
import dynamic from 'next/dynamic';

export const Layout = dynamic<LayoutProps>(() =>
  import('./Layout').then((mod) => mod.default),
);
