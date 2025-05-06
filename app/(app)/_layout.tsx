import { Text, View, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/context/AuthContext';
import { Buffer } from 'buffer';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading, signOut, timestamp } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const animateDropdown = (show: boolean) => {
    Animated.timing(dropdownAnim, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.poly(4)),
    }).start();
  };

  useEffect(() => {
    animateDropdown(showDropdown);
  }, [showDropdown]);

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

  const handleAvatarPress = () => setShowDropdown(prev => !prev);
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

  const TOKEN_EXPIRY_TIME = 4 * 60 * 60 * 1000;
  const loginDate = new Date(timestamp);
  const expiryMs = TOKEN_EXPIRY_TIME - (Date.now() - loginDate.getTime());
  if (expiryMs <= 0) {
    signOut();
    return;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
      <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '📡 OLTs',
          headerTitleStyle: styles.headerTitle,
          headerStyle: styles.headerBar,
          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={handleAvatarPress}
                style={styles.avatarContainer}
                accessibilityLabel="User avatar button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </TouchableOpacity>
            );
          },
        }}
      />
    </Stack>


        {showDropdown && (
          <Animated.View
            style={[
              styles.dropdownContainer,
              {
                opacity: dropdownAnim,
                transform: [{ translateY: dropdownAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0]
                }) }]
              }
            ]}
          >
            <TouchableOpacity style={styles.dropdownItem} onPress={handleSignOut}>
              <Feather name="log-out" size={16} color="#1DB954" style={{ marginRight: 6 }} />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
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
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerBar: {
    backgroundColor: '#0c0c0c',
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 1,
    borderColor: '#1DB95433',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
    letterSpacing: 1.2,
    textShadowColor: '#1DB95488',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#1DB954',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 10,
  },
  avatarText: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#1DB95499',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#111622cc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1DB95488',
    paddingVertical: 8,
    paddingHorizontal: 14,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1DB954',
    fontWeight: '600',
  },
});
