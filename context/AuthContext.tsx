import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios'; // import axios

const AuthContext = createContext<{
  signIn: (username: string, password: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  timestamp?: string | null;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [timestamp, setTimestamp] = useStorageState('timestamp');

  const signIn = async (username: string, password: string) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL +"/login";
      console.log('API URL:', apiUrl);
      console.log("username: " ,username)
      console.log("password: ",password)
      const response = await axios.post(
        `${apiUrl}`,
        new URLSearchParams({ username, password }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 5000, // Optional: add timeout
        }
      );
      console.log(response)
      const sessionToken = response.data.access_token;
      console.log("login", sessionToken);
  
      setSession(sessionToken);
      const now = Date.now();
      setTimestamp(new Date(now).toISOString());
      // console.log("session_Login:", response);
      return { success: true }; // explicitly return success if needed
  
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Invalid credentials');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out');
        } else if (error.response) {
          throw new Error(`Login failed: ${error.response}`);
        } else {
          throw new Error(`Network or server error ${error.response}`);
        }
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };
  

  const signOut = () => {
    setSession(null);
    setTimestamp(null);
    console.log("session_Logout:", session);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
        timestamp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
