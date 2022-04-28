import { FooterProps } from './Footer';
import { HeaderProps } from './Header';
import dynamic from 'next/dynamic';

export const Header = dynamic<HeaderProps>(() =>
  import('./Header').then((mod) => mod.default),
);
export const Footer = dynamic<FooterProps>(() =>
  import('./Footer').then((mod) => mod.default),
);
