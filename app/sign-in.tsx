import { router } from 'expo-router';
import { Text, View, TextInput, TouchableOpacity, Image, StyleSheet, StatusBar, Alert } from 'react-native';
import { useState } from 'react';
import { useSession } from '@/context/AuthContext';

export default function SignIn() {
  const { signIn } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Please enter both username and password');
      return;
    }
  
    try {
      setLoading(true);
      const result = await signIn(username, password);
  
      if (result?.error) {
        Alert.alert('Login Failed', result.error);
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        Alert.alert('Invalid Credentials', 'Username or password is incorrect.');
      } else if (err.message?.includes('timeout')) {
        Alert.alert('Timeout', 'The request timed out. Please try again.');
      } else {
        Alert.alert('Login Error', err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <Image source={require('@/assets/images/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background
    padding: 20,
  },
  logo: {
    width: 120, // Logo width
    height: 120, // Logo height
    marginBottom: 40, // Space below logo
    resizeMode: 'contain', // Ensures the logo scales proportionally
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#1DB954', // Green accent color
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    color: '#aaa',
    marginTop: 20,
  },
  link: {
    color: '#1DB954', // Link color matching the button
    fontWeight: 'bold',
  },
});
