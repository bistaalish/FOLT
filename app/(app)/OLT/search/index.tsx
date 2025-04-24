import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Animated, Easing,ActivityIndicator,Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSession } from '@/context/AuthContext';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import useSNSearch from '@/hooks/useSNSearch';
import useOpticalData from '@/hooks/useOpticalData';
import DeleteModal from '@/components/ui/DeleteModal';
import Spinner from '@/components/ui/spinner'; // Import the Spinner component
import RebootModal from '@/components/ui/RebootModal';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const SearchScreen = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('SN');
  const { session: token } = useSession();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRebootingModalVisible, setIsRebootingModalVisible] = useState(false);
  const [SearchingModal, setSearchingModal] = useState(false);
  const [selectedSN, setSelectedSN] = useState<string | null>(null);
  const [FSP, setFSP] = useState<string | null>(null);
  const [ONTID, setONTID] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [deleteCompleteModalVisible, setDeleteCompleteModalVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'ONU Search',
      headerTitleStyle: { color: '#1DB954' },
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // SN Search hook
  const { results, isLoading, error, searchSN, clearResults } = useSNSearch(id, token, query);
  
  // Optical Data hook (initialized with null values)
  const {  opticalData, isLoading: opticalLoading, error: opticalError, fetchOpticalData, resetOpticalData } = useOpticalData(id, token, results[0]?.fsp || '', results[0]?.ontid || '');
  

  useEffect(() => {
    if (results.length > 0 && results[0].status?.toLowerCase() !== 'offline') {
        fetchOpticalData();  // Only fetch if status is not 'offline'
      }
  }, [results]);

  const handleSearch = () => {
    const trimmedSN = query.trim();
    if (!trimmedSN || trimmedSN.length < 15 ) {
      alert(`Please enter a valid ${searchType.toUpperCase()}`);
      return;
    }
    resetOpticalData();
    searchSN(); // Trigger the SN search when the button is pressed
  };

  const clearQuery = () => {
    clearResults();
    resetOpticalData();
    setQuery('');
    
  };
  const handleDelete = (snToDelete) => {
     setSelectedSN(snToDelete);
     setIsModalVisible(true);
  };

  const handleReboot = (FSP,ONTID) => {
    setFSP(FSP);
    setONTID(ONTID);
    setIsRebootingModalVisible(true);
    clearQuery();
    resetOpticalData();
  };

  const confirmDelete = async () => {
    if (isDeleting) return; // Prevent double tap
    setIsDeleting(true);    // Lock the function right away
    // setResults(prevResults => prevResults.filter(item => item.sn !== selectedSN));
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/device/${id}/onu/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sn: selectedSN }),
    });

    if (response.ok) {
      // Optional: Remove it from local state list
      setDeleteCompleteModalVisible(true);
    } else {
      const error = await response.text();
      console.error('Failed to delete:', error);
      // Show toast or error modal if you want
    }
  } catch (err) {
    console.error('Delete request failed:', err);
  } finally {
    setIsDeleting(false);
    setSelectedSN(null);
    setIsModalVisible(false);
  }
    // setIsModalVisible(false);
    // setSelectedSN(null);
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setSelectedSN(null);
  };
  const confirmReboot = async () => {
    if (isRebooting) return; // Prevent double tap
    setIsRebooting(true);    // Lock the function right away
    // setResults(prevResults => prevResults.filter(item => item.sn !== selectedSN));
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/device/${id}/onu/reset`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ FSP: FSP, ONTID: ONTID }),
    });

    if (response.ok) {
      console.log("Reboot request sent successfully");
      // Optional: Remove it from local state list
      setIsRebootingModalVisible(false);
      
    } else {
      const error = await response.text();
      console.error('Failed to Reboot:', error);
      // Show toast or error modal if you want
    }
  } catch (err) {
    console.error('Reboot request failed:', err);
  } finally {
    setIsRebooting(false);
    setSelectedSN(null);
    setIsRebootingModalVisible(false);
  }
    // setIsModalVisible(false);
    // setSelectedSN(null);
  };
  const cancelReboot = () => {
    setIsRebootingModalVisible(false);
    setSelectedSN(null);
    setONTID(null);
    setFSP(null);
  }
  // Optical Data fade-in animation
  const opticalDataOpacity = new Animated.Value(0); // Initial opacity value

  const fadeInOpticalData = () => {
    Animated.timing(opticalDataOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (opticalData) {
      fadeInOpticalData(); // Trigger the fade-in effect when optical data is fetched
    }
  }, [opticalData]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Picker
          selectedValue={searchType}
          onValueChange={setSearchType}
          style={styles.picker}
          dropdownIconColor="#1DB954"
        >
          <Picker.Item label="Search by SN" value="SN" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder={`Enter ${searchType.toUpperCase()}`}
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.btnText}>🚀 Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearBtn} onPress={clearQuery}>
            <Text style={styles.btnText}>✖️ Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && <Spinner message='Searching ONU'/>}

      {!isLoading && error && (
        <Text style={styles.noResultsText}>🚫 {error}</Text>
      )}
        
      {!isLoading && results.length > 0 && (
       <FlatList
       data={results}
       keyExtractor={(item, index) => item.id || item.sn || index.toString()}
       renderItem={({ item }) => (
         <View style={styles.resultItem}>
           <View style={styles.statusContainer}>
             <View
               style={[
                 styles.statusIndicator,
                 {
                   backgroundColor: item.status?.toLowerCase() === 'online' ? '#1DB954' : '#FF3B30', // Green for online, Red for offline
                   transform: [{ scale: item.status ? 1.2 : 1 }],
                 },
               ]}
             >
        
             </View>
             <Text style={styles.statusText}>
               {item.status?.toLowerCase() === 'online' ? 'Online' : 'Offline'}
             </Text>
           </View>
     
           <Text
            style={[
             styles.resultText // Red if offline
            ]}
          >
            SN: <Text style={[styles.highlight, item.status?.toLowerCase() === 'offline' && { color: '#FF3B30' }]}>{item.sn}</Text>
          </Text>

          <Text
            style={[
             styles.resultText
            ]}
          >
            Description: <Text style={[styles.highlight, item.status?.toLowerCase() === 'offline' && { color: '#FF3B30' }]}>{item.description}</Text>
          </Text>

          <Text
            style={[
             styles.resultText
            ]}
          >
            FSP: <Text style={[styles.highlight, item.status?.toLowerCase() === 'offline' && { color: '#FF3B30' }]}>{item.fsp}</Text>
          </Text>

          <Text
            style={[
             styles.resultText
            ]}
          >
            ONTID: <Text style={[styles.highlight, item.status?.toLowerCase() === 'offline' && { color: '#FF3B30' }]}>{item.ontid}</Text>
          </Text>

          <Text
            style={[
             styles.resultText
            ]}
          >
            VendorSN: <Text style={[styles.highlight, item.status?.toLowerCase() === 'offline' && { color: '#FF3B30' }]}>{item.vendorsn}</Text>
          </Text>

          <Text
            style={[
             styles.resultText
            ]}
          >
            Line Profile: <Text style={[styles.highlight, item.status?.toLowerCase() === 'offline' && { color: '#FF3B30' }]}>{item.lineProfile}</Text>
          </Text>
           {item.status?.toLowerCase() === 'online' && !opticalData && (
             <View style={styles.checkingContainer}>
               <ActivityIndicator size="small" color="#1DB954" />
               <Text style={styles.checkingText}>Fetching Optical Power</Text>
             </View>
           )}
     
           {opticalData && (
             <Animated.View style={[styles.opticalDataContainer, { opacity: opticalDataOpacity }]}>
               <Text style={styles.resultText}>ONU Rx: <Text style={styles.highlight}>{opticalData.ONU_RX}</Text></Text>
               <Text style={styles.resultText}>OLT Rx: <Text style={styles.highlight}>{opticalData.OLT_RX}</Text></Text>
             </Animated.View>
           )}
           <View style={styles.actionRow}>
           { item.status?.toLowerCase() === 'online' && (
            <TouchableOpacity
            onPress={() => handleReboot(item.fsp,item.ontid)}
            style={styles.rebootButton}
          >
            <Text style={styles.deleteButtonText}>Reboot</Text>
          </TouchableOpacity>
      )}
                 {/* Delete Button */}
            <TouchableOpacity
              onPress={() => handleDelete(item.sn)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            </View>
              </View>
       )}
     />
      )}
      <RebootModal
        isVisible={isRebootingModalVisible}
        snToDelete={selectedSN}
        onConfirm={confirmReboot}
        onCancel={cancelReboot}
      />
            {/* Delete Confirmation Modal */}
            <DeleteModal
        isVisible={isModalVisible}
        snToDelete={selectedSN}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      {isRebooting && (
          <Modal transparent visible>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
                <Text style={styles.modalText}>Rebooting...</Text>
              </View>
            </View>
          </Modal>
        )}
      {isDeleting && (
          <Modal transparent visible>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
                <Text style={styles.modalText}>Deleting...</Text>
              </View>
            </View>
          </Modal>
        )}
        <Modal
          transparent
          visible={deleteCompleteModalVisible}
          animationType="fade"
          onRequestClose={() => setDeleteCompleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Deleted Successfully ✅</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setDeleteCompleteModalVisible(false)
                  clearResults();
                  resetOpticalData();
                  setQuery('');

                }}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
    
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', // allows wrapping if too long
    gap: 12, // if you're using React Native >= 0.71, otherwise use margin
    marginTop: 8,
  },
  
  opticalDataContainer: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffffaa',
    minWidth: 120,
  },
  
  rebootButton: {
    backgroundColor: '#ffa50033',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffa500',
  },
  
  deleteButton: {
    backgroundColor: '#ff000033',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#181818',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '75%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#fff',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultItem: {
    backgroundColor: '#181818', // Dark card background for a sleek look
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderColor: '#333',
    borderWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    opacity: 0.9, // Slight transparency for a modern vibe
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    transition: 'all 0.3s ease', // Smooth transition for the status indicator
  },
  statusSymbol: {
    fontSize: 20,
    color: '#fff', // White for the checkmark and cross
    transition: 'all 0.3s ease', // Smooth scale and transform effect
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  resultText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 6,
    fontWeight: '500',
  },
  highlight: {
    color: '#1DB954', // Accent green for highlights
    fontWeight: '700',
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#222',
    transition: 'all 0.3s ease', // Smooth transitions for the checking container
  },
  checkingText: {
    color: '#aaa',
    marginLeft: 10,
  },
  opticalDataContainer: {
    marginTop: 12,
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 12,
    opacity: 0.9,
  },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#0d0d0d',
    },
    heading: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1DB954',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: '#1DB95488',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },
    card: {
        backgroundColor: '#181818',
        borderRadius: 12,
        padding: 18,
        shadowColor: '#1DB954',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    picker: {
        backgroundColor: '#222',
        color: '#1DB954',
        marginBottom: 14,
        borderRadius: 10,
    },
    input: {
        height: 48,
        backgroundColor: '#101010',
        borderColor: '#1DB95433',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        color: '#ffffff',
        fontSize: 15,
        marginBottom: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    searchBtn: {
        backgroundColor: '#00bfff',
        flex: 1,
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#00bfff',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    clearBtn: {
        backgroundColor: '#ff3c3c',
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#ff3c3c',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    checkingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    resultItem: {
        backgroundColor: '#121212',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#1DB954',
    },
    resultText: {
        fontSize: 15,
        color: '#ddd',
        marginBottom: 6,
    },
    highlight: {
        color: '#1DB954',
        fontWeight: '600',
    },
    noResultsText: {
        textAlign: 'center',
        marginVertical: 30,
        fontSize: 16,
        color: '#bbb',
        fontStyle: 'italic',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30,
    },
    spinner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        borderTopColor: '#1DB954',
        borderRightColor: 'transparent',
        borderBottomColor: '#1DB954',
        borderLeftColor: 'transparent',
        marginBottom: 12,
    },
    innerCircle: {
        width: 10,
        height: 10,
        backgroundColor: '#1DB954',
        borderRadius: 5,
        position: 'absolute',
        top: 25,
        left: 25,
    },
    loadingLabel: {
        color: '#1DB954',
        fontSize: 16,
        fontWeight: '500',
    },
    opticalDataContainer: {
        marginTop: 12,
    },
});

export default SearchScreen;
