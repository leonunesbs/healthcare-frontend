import { LinkOverlay, LinkOverlayProps } from '@chakra-ui/react';

import NextLink from 'next/link';
import { ReactNode } from 'react';

export interface CustomLinkProps extends LinkOverlayProps {
  href: string;
  children: ReactNode;
}

function CustomLink({ children, href, ...rest }: CustomLinkProps) {
  return (
    <NextLink href={href} passHref>
      <LinkOverlay
        hrefLang="pt-BR"
        _hover={{
          textDecoration: 'none',
        }}
        {...rest}
      >
        {children}
      </LinkOverlay>
    </NextLink>
  );
}

export default CustomLink;
