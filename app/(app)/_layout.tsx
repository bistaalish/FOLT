import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useState,useEffect } from 'react';
import { useSession } from '@/context/AuthContext';
import { Buffer } from 'buffer';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading, signOut,timestamp } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }  
  
  const handleAvatarPress = () => {
    setShowDropdown(prev => !prev);
  };

  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);
  };

  const token = session;
  const parts = token
    .split('.')
    .map(part => Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  const payload = JSON.parse(parts[1]);
  const avatarLetter = payload.sub.charAt(0).toUpperCase();
  const TOKEN_EXPIRY_TIME = 4 * 60 * 60 * 1000; // 4 hours
  const loginDate = new Date(timestamp);
  const expiryMs = TOKEN_EXPIRY_TIME - (Date.now() - loginDate.getTime());
  if (expiryMs <= 0) {
    signOut(); // Already expired
    return;
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'OLTs:',
              headerTitleStyle: styles.headerTitle,
              headerStyle: styles.headerBar,
              headerRight: () => (
                <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{avatarLetter}</Text>
                </TouchableOpacity>
              ),
            }}
          />
        </Stack>

        {showDropdown && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleSignOut}>
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerBar: {
    backgroundColor: '#0c0c0c',
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 1,
    borderColor: '#00ffff44',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1DB954',
    textShadowColor: '#1DB954',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    letterSpacing: 1.2,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#1DB954',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
  },
  avatarText: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#1DB954',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#111622',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1DB954',
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 999,
    shadowColor: '#111622',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '600',
    textShadowColor: '#1DB954',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});
