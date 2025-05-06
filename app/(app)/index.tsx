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
      const url = apiUrl + '/device/';
      console.log('API URL:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
      });
      const fetchedData = response.data;

      const updatedDevices = await Promise.all(
        fetchedData.map(async (device) => {
          try {
            const statusRes = await axios.get(`${apiUrl}/device/${device.id}/status`, {
              headers: {
                Authorization: `Bearer ${session}`,
                'Content-Type': 'application/json',
              },
            });
            return { ...device, status: statusRes.data.status };
          } catch {
            return { ...device, status: 'offline' };
          }
        })
      );

      setDevices(updatedDevices);
      console.log('Updated devices:', updatedDevices);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
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

    const isOnline = item.status === 'online';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={handlePress}
        accessible={true}
        accessibilityLabel={`View details for ${item.name}`}
      >
        <View style={styles.cardContent}>
          {logo && <Image source={logo} style={styles.logo} />}

          <View style={styles.textColumn}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.vendorText}>{item.vendor}</Text>
          </View>

          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? 'limegreen' : 'red' },
            ]}
          />
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
        ) : devices.length === 0 ? (
          <Text style={styles.error}>No devices found.</Text>
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
  error: {
    color: 'tomato',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
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
    justifyContent: 'space-between',
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
    marginRight: 10,
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
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
});
