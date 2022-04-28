import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  useMergeRefs,
} from '@chakra-ui/react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import React, { ReactNode } from 'react';

export interface PasswordFieldProps {
  children?: ReactNode;
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ ...rest }, ref) => {
    const { isOpen, onToggle } = useDisclosure();
    const inputRef = React.useRef<HTMLInputElement>(null);

    const mergeRef = useMergeRefs(inputRef, ref);
    const onClickReveal = () => {
      onToggle();
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    };
    return (
      <FormControl>
        <FormLabel htmlFor="password">Senha</FormLabel>
        <InputGroup>
          <InputRightElement>
            <IconButton
              variant="link"
              aria-label={isOpen ? 'Mask password' : 'Reveal password'}
              icon={isOpen ? <HiEyeOff /> : <HiEye />}
              onClick={onClickReveal}
            />
          </InputRightElement>
          <Input
            id="password"
            ref={mergeRef}
            name="password"
            type={isOpen ? 'text' : 'password'}
            autoComplete="current-password"
            required
            bgColor={'white'}
            {...rest}
          />
        </InputGroup>
      </FormControl>
    );
  },
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
