import NextDocument, { Head, Html, Main, NextScript } from 'next/document';

import { ColorModeScript } from '@chakra-ui/react';
import React from 'react';
import theme from '@/styles/theme';

type Props = unknown;

class Document extends NextDocument<Props> {
  render() {
    return (
      <Html lang={'pt-BR'}>
        <Head />
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
