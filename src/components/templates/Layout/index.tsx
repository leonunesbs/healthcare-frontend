import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import { Footer, Header } from '@/components/organisms';

import Head from 'next/head';
import { ReactNode } from 'react';

export interface LayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  isHeaded?: boolean;
  isFooted?: boolean;
}

const Layout = ({
  title,
  description,
  children,
  isHeaded = true,
  isFooted = true,
}: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{`${title} | Healthcare - Gestor de serviços de saúde`}</title>
        <meta
          name="description"
          content={
            description ||
            'Plataforma para gestão de pacientes em serviços de saúde.'
          }
        />
      </Head>
      {isHeaded && <Header />}
      <Box
        h="0.5"
        bg={useColorModeValue('gray.500', 'gray.200')}
        mb={['4', '6']}
      />
      <Container maxW={'8xl'} minH="100vh">
        <Box>{children}</Box>
      </Container>
      {isFooted && <Footer />}
    </>
  );
};

export default Layout;
