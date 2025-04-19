import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

export default function OLTDetails() {
  const { name, id } = useLocalSearchParams();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  useEffect(() => {
    if (name) {
      navigation.setOptions({
        title: String(name),
        headerTitleStyle: {
          color: '#1DB954',
        },
      });
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [name]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.subtitle}>Choose your action</Text>

      <Image
        source={require('@/assets/images/huawei-logo.png')}
        style={styles.heroImage}
        resizeMode="contain"
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.addCard]}
          activeOpacity={0.85}
          onPress={() => {
            // Navigate to add page with id and name as params
            router.push({
              pathname: '/OLT/add',
              params: {
                id: id,
                name: name,

              },
            });
          }}
        >
          <Feather name="plus-circle" size={28} color="#FF9A00" />
          <Text style={styles.cardText}>Add ONU</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.searchCard]}
          activeOpacity={0.85}
          onPress={() => {
            // Navigate to add page with id and name as params
            router.push({
              pathname: '/OLT/search',
              params: {
                id: id,
                name: name,

              },
            });
          }}
        >
          <Feather name="search" size={28} color="#00FFC6" />
          <Text style={styles.cardText}>Search ONU</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#bbb',
    marginBottom: 26,
    letterSpacing: 1,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  heroImage: {
    width: '100%',
    height: 160,
    marginBottom: 40,
  },
  actionsContainer: {
    width: '100%',
    gap: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#141414',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1.5,
    transform: [{ scale: 1 }],
  },
  searchCard: {
    borderColor: '#00FFC6',
    shadowColor: '#00FFC6',
  },
  addCard: {
    borderColor: '#FF9A00',
    shadowColor: '#FF9A00',
  },
  cardText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
    letterSpacing: 1.2,
  },
});
