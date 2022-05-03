import { Box, useColorModeValue } from '@chakra-ui/react';
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
        <Box mx="auto">
          {isHeaded && <Header />}
          <Box
            h="0.5"
            bg={useColorModeValue('gray.500', 'gray.200')}
            mb={['4', '6']}
          />
          <Box minH="100vh" maxW="8xl" mx="auto" m={0} p={0} px={[2, 6]}>
            {children}
          </Box>
          {isFooted && <Footer />}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
