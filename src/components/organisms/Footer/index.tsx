import { Box, BoxProps } from '@chakra-ui/react';

import { ReactNode } from 'react';

export interface FooterProps extends BoxProps {
  children?: ReactNode;
}

const Footer = ({ ...rest }: FooterProps) => {
  return (
    <Box px={[2, 6]} {...rest}>
      <h1>Footer</h1>
    </Box>
  );
};

export default Footer;
