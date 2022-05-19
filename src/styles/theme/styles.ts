import { ThemeOverride } from '@chakra-ui/react';

const override: ThemeOverride = {
  styles: {
    global: ({ colorMode }) => ({
      body: {
        backgroundColor: colorMode === 'light' ? 'white' : 'gray.900',
        textColor: colorMode === 'light' ? 'gray.900' : 'white',
      },
      a: {
        _hover: {
          textDecoration: 'underline',
        },
      },
    }),
  },
};

export default override.styles;
