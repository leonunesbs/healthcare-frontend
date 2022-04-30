import { createContext, useCallback, useMemo, useState } from 'react';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import client from '@/services/apollo-client';
import { gql } from '@apollo/client';
import { useRouter } from 'node_modules.nosync/next/router';

const SIGN_IN = gql`
  mutation getToken($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      user {
        id
        isStaff
      }
    }
  }
`;

interface AuthContextProps {
  isAuthenticated: boolean;
  token: string;
  signIn: (data: SignInData) => Promise<void>;
  isStaff: boolean | null;
  signOut: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

type SignInData = {
  username: string;
  password: string;
  redirectUrl?: string;
};

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  const { ['healthcareToken']: token } = parseCookies();

  const isAuthenticated = useMemo(() => !!token, [token]);

  const signIn = useCallback(
    async (data: SignInData) => {
      const { username, password, redirectUrl } = data;

      await client
        .mutate({
          mutation: SIGN_IN,
          variables: {
            username,
            password,
          },
        })
        .then(({ data: { tokenAuth } }) => {
          if (tokenAuth) {
            const { token, user } = tokenAuth;
            setCookie(null, 'healthcareToken', token, {
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            });
            setIsStaff(user.is_staff);
          }

          router.push(redirectUrl || '/');
        });
    },
    [router],
  );

  const signOut = useCallback(() => {
    destroyCookie(null, 'healthcareToken');
    router.reload();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        signIn,
        signOut,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
