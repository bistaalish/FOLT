import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router'; // assuming you're using expo-router


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

// This hook can be used to access the user info.
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
      const apiUrl = "http://olt.linuxeval.eu.org";
      // Perform the login API request
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          
        },
        body: new URLSearchParams({ username, password }).toString(),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const sessionToken = data.access_token; // Adjust based on your backend response
      console.log("login",sessionToken);
      setSession(sessionToken);
      const now = Date.now();
      setSession(sessionToken);
      setTimestamp(new Date(now).toISOString()); // Save human-readable timestamp

    } catch (error) {
      console.error('SignIn failed:', error);
    }
  };

  const signOut = () => {
    setSession(null);
    setTimestamp(null);
    console.log("session_Logout:",session);
    
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
