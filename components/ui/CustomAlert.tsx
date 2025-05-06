import React, {useEffect} from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';

interface ONTRegisteredModalProps {
  visible: boolean;
  onClose: () => void;
  onu: any;
}

const ONTRegisteredModal: React.FC<ONTRegisteredModalProps> = ({ visible, onClose, onu }) => {
    
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>✅ ONT Registered</Text>
          <Text style={styles.modalMessage}>
            The ONU has been successfully registered.
          </Text>
          <View style={styles.details}>
            <Text style={styles.cardLabel}>
              <Text style={styles.label}>Number:</Text> {onu?.Number}
            </Text>
            <Text style={styles.cardLabel}>
              <Text style={styles.label}>SN:</Text> {onu?.SN}
            </Text>
            <Text style={styles.cardLabel}>
              <Text style={styles.label}>FSP:</Text> {onu?.FSP}
            </Text>
            <Text style={styles.cardLabel}>
              <Text style={styles.label}>ONTID:</Text> {onu?.ONTID}
            </Text>
            <Text style={styles.cardLabel}>
              <Text style={styles.label}>VendorID:</Text> {onu?.VendorID}
            </Text>
            <Text style={styles.cardLabel}>
              <Text style={styles.label}>Model:</Text> {onu?.Model}
            </Text>
            <Text style={styles.cardLabel}>
                  <Text style={styles.label}>Username:</Text> {onu?.username}
            </Text>
        </View>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  resultText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 6,
    fontWeight: '500',
  },
  opticalDataContainer: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffffaa',
    minWidth: 120,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: 320,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(29,185,84,0.2)',
  },
  modalTitle: {
    fontSize: 24,
    color: '#1DB954',
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 18,
    textAlign: 'center',
  },
  details: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  cardLabel: {
    color: '#e5e5e5',
    fontSize: 15,
    marginBottom: 6,
  },
  label: {
    color: '#1DB954',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ONTRegisteredModal;
