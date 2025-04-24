import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Image,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useSession } from '@/context/AuthContext';
import ONUCard from '@/components/ui/ONUCard';
import ONUModal from '@/components/ui/ONUAddModal';
import ONTRegisteredModal from '@/components/ui/CustomAlert'; // Import the new modal
const vendorLogos: { [key: string]: any } = {
  hwtc: require('@/assets/images/vendors/hwtc.png'),
  // Add more logos as needed
};

const getVendorLogo = (vendorId?: string) => {
  if (!vendorId) return vendorLogos['hwtc'];
  return vendorLogos[vendorId.toLowerCase()] || vendorLogos['hwtc'];
};



export default function AddONU() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const navigation = useNavigation();
  const { session: token } = useSession();
  const [showONTRegisteredModal, setShowONTRegisteredModal] = useState(false); // State for the "ONT Registered" modal
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [foundONUs, setFoundONUs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedONU, setSelectedONU] = useState<any>(null);

  useEffect(() => {
    navigation.setOptions({
      title: name ?? 'Add ONU',
      headerTitleStyle: { color: '#1DB954' },
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    handleAutoFind();
  }, []);

  const handleAutoFind = async () => {
    setLoading(true);
    setError('');
    setFoundONUs([]);
    progressAnim.setValue(0);

    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/device/${id}/onu/autofind`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error('Failed to autofind ONUs');

      const data = await response.json();
      setFoundONUs(data);
    } catch (err: any) {
      setError(
        err.name === 'AbortError'
          ? 'Timeout: Could not find ONUs in OLT.'
          : err.message || 'No ONU detected.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    handleAutoFind();
  };

  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderShimmerCard = () => (
    <View style={styles.shimmerCard}>
      <View style={styles.shimmerLine} />
      <View style={[styles.shimmerLine, { width: '60%' }]} />
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#1DB954"
          colors={['#1DB954']}
        />
      }
    >
      <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#1DB954" />
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: animatedProgressWidth }]}
              />
            </View>
            <Text style={styles.loadingText}>Scanning for ONUs...</Text>
            {[1, 2, 3].map((_, i) => (
              <React.Fragment key={i}>{renderShimmerCard()}</React.Fragment>
            ))}
          </View>
        ) : (
          <>
            {error && (
              <View style={styles.errorContainer}>
                <Image
                  source={require('@/assets/images/error-glitch.png')}
                  style={styles.errorImage}
                  resizeMode="contain"
                />
                <Text style={styles.errorTitle}>No ONUs Found</Text>
                <Text style={styles.errorSubtitle}>
                  Something went wrong while scanning. Either no ONUs are connected or the connection timed out.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleAutoFind}>
                  <Text style={styles.retryButtonText}>🔄 Retry Scan</Text>
                </TouchableOpacity>
              </View>
            )}

            {foundONUs.length > 0 && (
              <>
                <View style={styles.refreshContainer}>
                  <Text style={styles.cardLabel}>
                    <Text style={styles.label}>Total ONU:</Text>{' '}
                    {foundONUs.length}
                  </Text>
                </View>
              
                {foundONUs.map((onu, index) => (
                  <ONUCard
                    key={index}
                    onu={onu}
                    fadeAnim={fadeAnim}
                    onPress={() => {
                      setSelectedONU(onu);
                      setModalVisible(true);
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </Animated.View>

      {/* Modal for ONU details */}
      <ONUModal
        visible={modalVisible}
        onu={selectedONU}
        onClose={() => setModalVisible(false)}
        oltId={id}
        onAdd={(username) => {
          // alert('ONU Added!');
          setModalVisible(false);
          selectedONU["username"] = username.username
          setSelectedONU(selectedONU);
          handleAutoFind();
          setShowONTRegisteredModal(true)
        }}
      />
       {/* ONT Registered Modal */}
       <ONTRegisteredModal
        visible={showONTRegisteredModal}
        onu={selectedONU}
        onClose={() => setShowONTRegisteredModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  cardLabel: {
    color: '#eee',
    fontSize: 15,
    marginBottom: 8,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#0e0e0e',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 15,
    color: '#ccc',
    fontSize: 16,
    fontStyle: 'italic',
  },
  errorText: {
    color: 'tomato',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1DB95440',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorImage: {
    width: 50,
    height: 50,
    marginLeft: 12,
  },
  refreshContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  shimmerCard: {
    backgroundColor: '#1f1f1f',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    marginTop: 16,
  },
  shimmerLine: {
    backgroundColor: '#333',
    height: 12,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#1DB954',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    color: '#1DB954',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalText: {
    color: '#eee',
    fontSize: 18,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 6,
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#cc0000',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    backgroundColor: '#181818',
    borderRadius: 12,
    borderColor: '#ff004040',
    borderWidth: 1,
    shadowColor: '#ff0040',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  errorImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
    // tintColor: '#ff0040',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff0040',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#1DB954',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});
