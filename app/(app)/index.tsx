import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSession } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const { signOut, session } = useSession();
  const router = useRouter();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session) fetchDevices();
  }, [session]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const url = 'https://olt.linuxeval.eu.org/device/';
      console.log('API URL:', url);
  
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
      });
  
      setDevices(response.data);
      console.log(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const getVendorLogo = (vendor: string) => {
    const v = vendor.toLowerCase();
    if (v === 'huawei') return require('@/assets/images/huawei-logo.png');
    return null;
  };

  const renderDevice = ({ item }) => {
    const logo = getVendorLogo(item.vendor);

    const handlePress = () => {
      router.push({
        pathname: '/OLT/[id]',
        params: {
          id: item.id,
          name: item.name,
          vendor: item.vendor,
          Model: item.model,
        },
      });
    };
    console.log(item);
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={handlePress}>
        <View style={styles.cardContent}>
          {logo && <Image source={logo} style={styles.logo} />}
          <View style={styles.textColumn}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.vendorText}>{item.vendor}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loaderText}>Loading Devices...</Text>
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDevice}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#1DB954"
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 18,
    marginBottom: 18,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#1DB95444',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#111',
    resizeMode: 'contain',
  },
  textColumn: {
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  vendorText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginTop: 4,
  },
  error: {
    color: 'tomato',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  signOutButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#1DB954',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
