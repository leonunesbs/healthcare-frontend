import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import client from '@/services/apollo-client';
import theme from '@/styles/theme';

const ContextProviders = ({ children }: any) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ContextProviders>
      <ApolloProvider client={client}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProvider>
    </ContextProviders>
  );
}
