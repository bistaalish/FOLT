import React from 'react';
import { Animated, Easing, StyleSheet, View, Text } from 'react-native';

interface SpinnerProps {
  message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  const spinValue = new Animated.Value(0);  // Initial spin value

  // Spin Animation Effect
  const startSpin = () => {
    spinValue.setValue(0);  // Reset the spin value
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // Rotate from 0 to 360 degrees
  });

  React.useEffect(() => {
    startSpin();  // Start the spinner animation when the component is mounted
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
        <View style={styles.innerCircle} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
  message: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Spinner;
