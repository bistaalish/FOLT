// components/ONUCard.tsx

import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';

const vendorLogos: { [key: string]: any } = {
  hwtc: require('@/assets/images/vendors/hwtc.png'),
  // Add more vendors as needed
};

const getVendorLogo = (vendorId?: string) => {
  if (!vendorId) return vendorLogos['hwtc'];
  return vendorLogos[vendorId.toLowerCase()] || vendorLogos['hwtc'];
};

interface ONUCardProps {
  onu: any;
  fadeAnim: Animated.Value;
  onPress: () => void;
}

export default function ONUCard({ onu, fadeAnim, onPress }: ONUCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { opacity: fadeAnim }]}
      onPress={onPress}
    >
      <View>
        <Text style={styles.cardLabel}>
          <Text style={styles.label}>Number:</Text> {onu.Number}
        </Text>
        <Text style={styles.cardLabel}>
          <Text style={styles.label}>SN:</Text> {onu.SN}
        </Text>
        <Text style={styles.cardLabel}>
          <Text style={styles.label}>FSP:</Text> {onu.FSP}
        </Text>
        <Text style={styles.cardLabel}>
          <Text style={styles.label}>VendorID:</Text> {onu.VendorID}
        </Text>
        <Text style={styles.cardLabel}>
          <Text style={styles.label}>Model:</Text> {onu.Model}
        </Text>
      </View>
      <Image
        source={getVendorLogo(onu.VendorID)}
        style={styles.vendorImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  cardLabel: {
    color: '#eee',
    fontSize: 15,
    marginBottom: 8,
  },
  label: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  vendorImage: {
    width: 50,
    height: 50,
    marginLeft: 12,
  },
});
