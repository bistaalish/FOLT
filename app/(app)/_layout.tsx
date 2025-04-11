import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { useSession } from '@/context/AuthContext';
import { Buffer } from 'buffer';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';

export default function AppLayout() {
  const colorScheme = useColorScheme();

  const { session, isLoading, signOut } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // Redirect to sign-in page if no session exists
    return <Redirect href="/sign-in" />;
  }

  // Handler for toggling the dropdown visibility
  const handleAvatarPress = () => {
    setShowDropdown(prev => !prev);
  };

  // Handler for sign-out
  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);  // Hide the dropdown after sign-out
  };

  const token = session;
  const parts = token.split('.').map(part => Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  const payload = JSON.parse(parts[1]);
  const avatarLetter = payload.sub.charAt(0).toUpperCase(); // Get the first letter of the session.sub and convert to uppercase

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'OLTs:',
            headerRight: () => (
              <TouchableOpacity
                onPress={handleAvatarPress}
                style={styles.avatarContainer}
              >
                {/* Display first letter of session.sub */}
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>

      {/* Dropdown with Logout option */}
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
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2c3e50', // Dark color for the avatar
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#2c3e50', // Dark background for the dropdown
    borderRadius: 5,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    elevation: 5, // Add shadow for Android
    width: 120,
    padding: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 14,
    color: '#fff', // White text for visibility against dark background
  },
});
