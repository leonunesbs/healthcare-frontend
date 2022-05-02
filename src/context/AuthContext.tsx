import { createContext, useCallback, useMemo, useState } from 'react';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import client from '@/services/apollo-client';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';

const SIGN_IN = gql`
  mutation getToken($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      user {
        id
        colaborator {
          name
        }
        isStaff
      }
    }
  }
`;

type UserType = {
  id: string;
  colaborator: {
    name: string;
  };
  isStaff: boolean;
};

interface AuthContextProps {
  isAuthenticated: boolean;
  user: UserType | null;
  token: string;
  signIn: (data: SignInData) => Promise<any>;
  signOut: () => void;
  checkToken: () => Promise<boolean | undefined>;
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
  const [user, setUser] = useState<UserType | null>(null);

  const { ['healthcareToken']: token } = parseCookies();

  const isAuthenticated = useMemo(() => !!token, [token]);

  const signIn = useCallback(
    async (data: SignInData) => {
      const { username, password, redirectUrl } = data;

      return await client
        .mutate({
          mutation: SIGN_IN,
          variables: {
            username,
            password,
          },
        })
        .then(({ data: { tokenAuth } }) => {
          if (tokenAuth) {
            const { token, user }: { user: UserType; token: string } =
              tokenAuth;
            setCookie(null, 'healthcareToken', token, {
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            });
            setUser(user);
          }

          router.push(redirectUrl || '/');
          return { ...tokenAuth };
        })
        .catch(({ ...rest }) => {
          throw { ...rest };
        });
    },
    [router],
  );

  const checkToken = useCallback(async () => {
    if (token) {
      const { data } = await client.query({
        query: gql`
          query getUser {
            user {
              id
              colaborator {
                name
              }
              isStaff
            }
          }
        `,
        context: {
          headers: {
            authorization: `JWT ${token}`,
          },
        },
      });
      if (data.user) {
        setUser(data.user);
        return true;
      }
      setUser(null);
      return false;
    } else {
      setUser(null);
      return false;
    }
  }, [token]);

  const signOut = useCallback(() => {
    destroyCookie(null, 'healthcareToken');
    router.reload();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        signIn,
        signOut,
        checkToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
