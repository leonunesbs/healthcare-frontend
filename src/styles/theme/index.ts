import { Form } from '@/styles/theme/components';
import { extendTheme, ThemeOverride, type ThemeConfig } from '@chakra-ui/react';
import styles from './styles';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const overrides: ThemeOverride = {
  config,
  styles,
  components: {
    Form,
  },
};

export default extendTheme(overrides);
