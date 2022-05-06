import { Form } from '@/styles/theme/components';
import { colors } from '@/styles/theme/foundations';
import { extendTheme, ThemeOverride, type ThemeConfig } from '@chakra-ui/react';
import styles from './styles';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const overrides: ThemeOverride = {
  config,
  styles,
  colors: colors,
  components: {
    Form,
  },
};

const theme = extendTheme(overrides);

export default theme;
