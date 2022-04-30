import { Box, Container } from '@chakra-ui/react';
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
      <Box>
        <Container maxW="container.xl" px={[2, 6]}>
          {isHeaded && <Header />}
          <Box minH="100vh" maxW="8xl" mx="auto" m={0} p={0}>
            {children}
          </Box>
          {isFooted && <Footer />}
        </Container>
      </Box>
    </>
  );
};

export default Layout;
