import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, StyleSheet, Image, RefreshControl } from 'react-native';
import { TouchableOpacity } from 'react-native'; // add to top
import { useSession } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const { signOut, session } = useSession(); // Get session token from context

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session) fetchDevices();
  }, [session]);

  // Function to fetch devices from the API
  const fetchDevices = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/device`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch devices');
      const data = await response.json();
      setDevices(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false); // Set loading to false after fetching
      setRefreshing(false); // Stop the refresh animation
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true); // Set refreshing to true to trigger the refresh indicator
    fetchDevices(); // Fetch data again
  };

  const renderDevice = ({ item }) => (
    <View style={styles.card}>
      {/* Row for Image and Text */}
      <View style={styles.cardContent}>
        {/* Image Column */}
        <Image
          source={require('@/assets/images/huawei-logo.png')} // Adjust the path to the correct image in your assets folder
          style={styles.logo}
        />
        
        {/* Text Column */}
        <View style={styles.textColumn}>
          <Text style={styles.text}>Id: {item.id}</Text>
          <Text style={styles.text}>Name: {item.name}</Text>
          <Text style={styles.text}>Vendor: {item.vendor}</Text>
          <Text style={styles.text}>Model: {item.model}</Text>
          <Text style={styles.text}>Type: {item.type}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="skyblue" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDevice}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // The state to show refresh spinner
              onRefresh={onRefresh} // The function to call when pulling down
              tintColor="skyblue" // Color of the refresh spinner
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#000', // Match background color to the index screen
  },
  card: {
    backgroundColor: '#222', // Dark background for cards
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'skyblue', // Border to match the color scheme
    flexDirection: 'column', // Ensuring content is aligned in a column
  },
  cardContent: {
    flexDirection: 'row', // Align items in a row (image and text)
    alignItems: 'center', // Center content vertically
    justifyContent: 'flex-start', // Align content to the start
  },
  logo: {
    width: 100, // Adjust to desired size
    height: 100, // Adjust to desired size
    marginRight: 16, // Space between image and text
    resizeMode: 'contain', // Make sure the image is contained inside the box
  },
  textColumn: {
    flex: 1, // Take up remaining space in the row for text
    justifyContent: 'center', // Center text vertically
  },
  text: {
    color: '#fff', // White text for readability
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  signOutButton: {
    marginTop: 20,
    backgroundColor: '#333', // Dark button background
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: 'skyblue', // Same border color as cards
    borderWidth: 1,
  },
  signOutText: {
    color: 'skyblue', // Skyblue text for sign-out button
    fontSize: 16,
    fontWeight: '600',
  },
});
