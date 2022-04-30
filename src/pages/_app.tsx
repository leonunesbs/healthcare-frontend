import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import client from '@/services/apollo-client';
import theme from '@/styles/theme';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}
