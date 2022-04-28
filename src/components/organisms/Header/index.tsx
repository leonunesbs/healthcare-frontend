import { Box, BoxProps, Button, HStack, Stack } from '@chakra-ui/react';

import { ReactNode } from 'react';
import { useRouter } from 'next/router';

export interface HeaderProps extends BoxProps {
  children?: ReactNode;
}

const Header = ({ ...rest }: HeaderProps) => {
  const router = useRouter();
  return (
    <Box {...rest}>
      <Stack direction={'row'}>
        <Box>Logo</Box>
        <HStack>
          <Button
            variant={'link'}
            colorScheme="blue"
            onClick={() => router.push('/')}
          >
            Início
          </Button>
          <Button
            variant={'link'}
            colorScheme="blue"
            onClick={() => router.push('/patients')}
          >
            Pacientes
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default Header;
