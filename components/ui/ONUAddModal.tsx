import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/context/AuthContext';

interface ONUData {
  Model?: string;
  Number?: string;
  SN?: string;
  FSP?: string;
  VendorID?: string;
}

interface ONUModalProps {
  visible: boolean;
  onClose: () => void;
  onu: ONUData;
  onAdd: (data: {
    username: string;
    vlan: number | null;
    native: boolean;
    onu: ONUData;
  }) => void;
  oltId: string;
}

const TextInputComponent: React.FC<{
  value: string;
  onChange: (text: string) => void;
}> = React.memo(({ value, onChange }) => (
  <TextInput
    style={styles.input}
    placeholder="Enter Username"
    placeholderTextColor="#aaa"
    value={value}
    onChangeText={onChange}
  />
));

const ONUModal: React.FC<ONUModalProps> = ({ visible, onClose, onu, onAdd, oltId }) => {
  const [username, setUsername] = useState<string>('');
  const [isNativeVLANChecked, setIsNativeVLANChecked] = useState<boolean>(false);
  const [vlans, setVlans] = useState<number[]>([]);
  const [selectedVLAN, setSelectedVLAN] = useState<number | null>(null);
  const [loadingVlans, setLoadingVlans] = useState<boolean>(false);
  const { session, signOut } = useSession();
  const [checkingSN, setCheckingSN] = useState<boolean>(false);
  const [LoadingText, setLoadingText] = useState<string>('Loading...');
  const handleUsernameChange = useCallback((text: string) => {
    setUsername(text);
  }, []);

  const handleNativeVLANToggle = () => {
    setIsNativeVLANChecked(prev => !prev);
  };

  const handleAdd = async () => {
    if (!username) {
      alert('Please enter a username');
      return;
    }
    const dataToAdd = {
      description: username,
      SN: onu.SN,
      FSP: onu.FSP,
      nativevlan: isNativeVLANChecked,
      service_id: selectedVLAN.id
    };
    const parts = dataToAdd.FSP.split('/');
    const interf =  `${parts[0]}/${parts[1]}`;
    const port = parts[2]; // "1"
    dataToAdd.interface = interf;
    dataToAdd.port = port; // "1"
    console.log('Data to add:', dataToAdd);
    try {
      setLoadingText('Checking if SN is already registered on OLT...');
      setCheckingSN(true); // 🔄 Start loader
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
      const response = await fetch(`${apiUrl}/device/${oltId}/onu/search/sn`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sn: dataToAdd.SN }),
      });
      if (response.ok) { 
        setCheckingSN(false); // 🔄 Start loader
        setCheckingSN(true); // 🔄 Start loader
        setLoadingText('Deleting the sn...');
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
        const Deleteresponse = await fetch(`${apiUrl}/device/${oltId}/onu/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sn: dataToAdd.SN }),
      });
      }
      setLoadingText("Registering PON")
      setCheckingSN(true); // 🔄 Start loader
      const Addresponse = await fetch(`${apiUrl}/device/${oltId}/onu/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToAdd)
      });
      onAdd({
        username,
        vlan: selectedVLAN?.vlan || null,
        native: isNativeVLANChecked,
        onu,
      });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   console.error('Failed to send SN:', errorData);
      //   alert('Failed to send SN: ' + (errorData?.message || 'Unknown error'));
      //   return;
      // }
  
      // const responseData = await response.json();
      // console.log('SN lookup response:', responseData);
  
      // Now you can proceed to call onAdd

  
    } catch (error) {
      console.error('Error during SN post:', error);
      alert('Network error while sending SN');
    } finally {
      setCheckingSN(false); // 🔄 Stop loader
    }

  };

  const fetchVLANs = async () => {
    setLoadingVlans(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/device/${oltId}/services`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Fetched VLANs:', data);
      const vlanList = data || [];
      console.log("list",vlanList)
      setVlans(vlanList);
      if (vlanList.length > 0) setSelectedVLAN(vlanList[0]);
    } catch (error) {
      console.error('Error fetching VLANs:', error);
    } finally {
      setLoadingVlans(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchVLANs();
      setUsername('');
      setIsNativeVLANChecked(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="fade" transparent>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{onu?.Model ?? 'ONU Details'}</Text>
          <Text style={styles.modalText}>Number: {onu?.Number ?? 'N/A'}</Text>
          <Text style={styles.modalText}>SN: {onu?.SN ?? 'N/A'}</Text>
          <Text style={styles.modalText}>FSP: {onu?.FSP ?? 'N/A'}</Text>
          <Text style={styles.modalText}>Vendor ID: {onu?.VendorID ?? 'N/A'}</Text>

          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxText}>Enable Native VLAN</Text>
            <Switch
              value={isNativeVLANChecked}
              onValueChange={handleNativeVLANToggle}
              trackColor={{ false: '#767577', true: '#1DB954' }}
              thumbColor={isNativeVLANChecked ? '#fff' : '#f4f3f4'}
            />
          </View>

          {loadingVlans ? (
            <ActivityIndicator size="small" color="#1DB954" />
          ) : (
            <Picker
              selectedValue={selectedVLAN}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedVLAN(itemValue)}
              dropdownIconColor="#fff" // For the dropdown arrow on Android
              
            >
              {vlans.map((vlanObj) => (
                <Picker.Item
                  key={vlanObj.vlan}
                  label={`${vlanObj.vlan}`}
                  value={vlanObj}
                />
              ))}
            </Picker>
          )}
          {checkingSN && (
            <View style={styles.checkingContainer}>
              <ActivityIndicator size="small" color="#1DB954" />
              <Text style={styles.checkingText}>{LoadingText}</Text>
            </View>
          )}
          <TextInputComponent value={username} onChange={handleUsernameChange} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    borderColor: '#444',
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkboxText: {
    color: '#eee',
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  addButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#cc0000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkingText: {
    color: '#ccc',
    marginLeft: 10,
    fontSize: 14,
  },
  
});

export default ONUModal;
